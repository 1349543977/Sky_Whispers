// ============================================================
// RainEffect - Rain particle system
// ============================================================

import { Renderer } from '../core/Renderer';
import { Particle, ParticleSystemConfig } from '../types';
import { LAYERS, COLORS } from '../utils/constants';
import { randomRange } from '../utils/math';

const DEFAULT_CONFIG: ParticleSystemConfig = {
  maxParticles: 150,
  emitRate: 80,
  lifetime: { min: 0.8, max: 1.5 },
  speed: { min: 300, max: 500 },
  size: { min: 1, max: 2.5 },
  gravity: 200,
  friction: 0.99,
  colors: [COLORS.RAIN],
  angle: { min: 80, max: 100 },
};

interface Splash {
  x: number;
  y: number;
  alpha: number;
  size: number;
  life: number;
}

export class RainEffect {
  private particles: Particle[] = [];
  private splashes: Splash[] = [];
  private config: ParticleSystemConfig;
  private emitAccumulator: number = 0;
  private screenWidth: number;
  private screenHeight: number;
  private groundY: number;
  private active: boolean = true;
  private windAngle: number = 0;

  constructor(screenWidth: number, screenHeight: number, groundY: number, config?: Partial<ParticleSystemConfig>) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.groundY = groundY;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  update(dt: number): void {
    if (!this.active) return;

    // Emit new particles
    this.emitAccumulator += dt * this.config.emitRate;
    while (this.emitAccumulator >= 1 && this.particles.length < this.config.maxParticles) {
      this.emitParticle();
      this.emitAccumulator -= 1;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vy += this.config.gravity * dt;
      p.vx *= this.config.friction;
      p.vy *= this.config.friction;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Hit ground - create splash
      if (p.y >= this.groundY) {
        this.splashes.push({
          x: p.x,
          y: this.groundY,
          alpha: 0.6,
          size: 3,
          life: 0.3,
        });
        this.particles.splice(i, 1);
        continue;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.life -= dt;
      s.alpha = Math.max(0, s.life / 0.3) * 0.6;
      s.size += dt * 15;
      if (s.life <= 0) {
        this.splashes.splice(i, 1);
      }
    }
  }

  render(renderer: Renderer): void {
    if (!this.active) return;

    // Rain drops
    renderer.setAlpha(0.6, LAYERS.EFFECTS, (ctx) => {
      ctx.strokeStyle = COLORS.RAIN;
      ctx.lineWidth = 1.5;
      for (const p of this.particles) {
        const alpha = Math.min(p.life / p.maxLife, 1) * 0.7;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 0.01, p.y + p.vy * 0.01);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });

    // Splashes
    renderer.setAlpha(1, LAYERS.EFFECTS, (ctx) => {
      for (const s of this.splashes) {
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = COLORS.RAIN;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  }

  private emitParticle(): void {
    const angle = randomRange(this.config.angle.min, this.config.angle.max) + this.windAngle;
    const angleRad = (angle * Math.PI) / 180;
    const speed = randomRange(this.config.speed.min, this.config.speed.max);
    const lifetime = randomRange(this.config.lifetime.min, this.config.lifetime.max);

    this.particles.push({
      x: randomRange(-20, this.screenWidth + 20),
      y: randomRange(-20, -5),
      vx: Math.cos(angleRad) * speed * 0.1,
      vy: Math.sin(angleRad) * speed,
      life: lifetime,
      maxLife: lifetime,
      size: randomRange(this.config.size.min, this.config.size.max),
      color: this.config.colors[0],
      alpha: 1,
      gravity: this.config.gravity,
      friction: this.config.friction,
    });
  }

  setWindAngle(angle: number): void {
    this.windAngle = angle;
  }

  setActive(active: boolean): void {
    this.active = active;
    if (!active) {
      this.particles = [];
      this.splashes = [];
    }
  }

  get isActive(): boolean {
    return this.active;
  }
}
