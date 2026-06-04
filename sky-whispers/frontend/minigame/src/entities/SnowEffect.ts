// ============================================================
// SnowEffect - Snow particle system
// ============================================================

import { Renderer } from '../core/Renderer';
import { Particle, ParticleSystemConfig } from '../types';
import { LAYERS, COLORS } from '../utils/constants';
import { randomRange } from '../utils/math';

const DEFAULT_CONFIG: ParticleSystemConfig = {
  maxParticles: 100,
  emitRate: 30,
  lifetime: { min: 3, max: 6 },
  speed: { min: 20, max: 60 },
  size: { min: 2, max: 5 },
  gravity: 30,
  friction: 0.98,
  colors: [COLORS.SNOW],
  angle: { min: 70, max: 110 },
};

export class SnowEffect {
  private particles: Particle[] = [];
  private config: ParticleSystemConfig;
  private emitAccumulator: number = 0;
  private screenWidth: number;
  private screenHeight: number;
  private active: boolean = true;
  private windSpeed: number = 0;

  constructor(screenWidth: number, screenHeight: number, config?: Partial<ParticleSystemConfig>) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
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
      p.vx += this.windSpeed * dt;
      p.vx *= this.config.friction;
      p.vy *= this.config.friction;

      // Add wobble
      p.vx += Math.sin(p.life * 3 + p.x * 0.01) * 10 * dt;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      if (p.y >= this.screenHeight || p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(renderer: Renderer): void {
    if (!this.active) return;

    renderer.setAlpha(1, LAYERS.EFFECTS, (ctx) => {
      for (const p of this.particles) {
        const alpha = Math.min(p.life / p.maxLife, 1) * 0.8;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLORS.SNOW;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  }

  private emitParticle(): void {
    const speed = randomRange(this.config.speed.min, this.config.speed.max);
    const angle = randomRange(this.config.angle.min, this.config.angle.max);
    const angleRad = (angle * Math.PI) / 180;
    const lifetime = randomRange(this.config.lifetime.min, this.config.lifetime.max);

    this.particles.push({
      x: randomRange(-20, this.screenWidth + 20),
      y: randomRange(-20, -5),
      vx: Math.cos(angleRad) * speed,
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

  setWindSpeed(speed: number): void {
    this.windSpeed = speed;
  }

  setActive(active: boolean): void {
    this.active = active;
    if (!active) {
      this.particles = [];
    }
  }

  get isActive(): boolean {
    return this.active;
  }
}
