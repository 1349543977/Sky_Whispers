// ============================================================
// RainEffect - Soft, dreamy rain with glow, splashes, puddles
// ============================================================

import { Renderer } from '../core/Renderer';
import { Particle, ParticleSystemConfig } from '../types';
import { LAYERS, COLORS } from '../utils/constants';
import { randomRange } from '../utils/math';

const DEFAULT_CONFIG: ParticleSystemConfig = {
  maxParticles: 100,
  emitRate: 50,
  lifetime: { min: 0.8, max: 1.5 },
  speed: { min: 300, max: 500 },
  size: { min: 1, max: 2.5 },
  gravity: 200,
  friction: 0.99,
  colors: [COLORS.RAIN],
  angle: { min: 80, max: 100 },
};

/** Expanding ring splash when a drop hits ground */
interface RingSplash {
  x: number;
  y: number;
  alpha: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
}

/** Tiny upward splash particle */
interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

/** Puddle that accumulates on the ground */
interface Puddle {
  x: number;
  y: number;
  width: number;
  maxWidth: number;
  height: number;
  alpha: number;
  life: number;
  maxLife: number;
}

/** Extended rain drop with wind drift */
interface RainDrop extends Particle {
  windDrift: number;
}

export class RainEffect {
  private particles: RainDrop[] = [];
  private ringSplashes: RingSplash[] = [];
  private splashParticles: SplashParticle[] = [];
  private puddles: Puddle[] = [];
  private config: ParticleSystemConfig;
  private emitAccumulator: number = 0;
  private screenWidth: number;
  private screenHeight: number;
  private groundY: number;
  private active: boolean = true;
  private windAngle: number = 0;
  private mistAlpha: number = 0;
  private puddleTimer: number = 0;

  private static readonly RING_SPLASH_LIFE = 0.4;
  private static readonly RING_SPLASH_MAX_RADIUS = 8;
  private static readonly SPLASH_PARTICLE_LIFE = 0.35;
  private static readonly SPLASH_PARTICLE_COUNT_MIN = 3;
  private static readonly SPLASH_PARTICLE_COUNT_MAX = 5;
  private static readonly PUDDLE_MAX_LIFE = 3.0;
  private static readonly PUDDLE_SPAWN_INTERVAL = 0.5;
  private static readonly MIST_TARGET_ALPHA = 0.08;
  private static readonly MIST_FADE_SPEED = 0.5;
  private static readonly GLOW_RADIUS = 6;

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

    // Update rain drops
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vy += this.config.gravity * dt;
      p.vx += p.windDrift * dt;
      p.vx *= this.config.friction;
      p.vy *= this.config.friction;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Hit ground - create splash effects
      if (p.y >= this.groundY) {
        this.createSplash(p.x, this.groundY);
        this.particles.splice(i, 1);
        continue;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update ring splashes
    for (let i = this.ringSplashes.length - 1; i >= 0; i--) {
      const s = this.ringSplashes[i];
      s.life -= dt;
      const progress = 1 - s.life / s.maxLife;
      s.radius = s.maxRadius * progress;
      s.alpha = (1 - progress) * 0.5;
      if (s.life <= 0) {
        this.ringSplashes.splice(i, 1);
      }
    }

    // Update splash particles
    for (let i = this.splashParticles.length - 1; i >= 0; i--) {
      const sp = this.splashParticles[i];
      sp.vy += 200 * dt; // gravity on splash particles
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt;
      if (sp.life <= 0) {
        this.splashParticles.splice(i, 1);
      }
    }

    // Update puddles
    for (let i = this.puddles.length - 1; i >= 0; i--) {
      const p = this.puddles[i];
      p.life -= dt;
      // Grow puddle
      const growProgress = Math.min(1, (p.maxLife - p.life) / (p.maxLife * 0.3));
      p.width = p.maxWidth * growProgress;
      // Fade out in last 30% of life
      const fadeStart = p.maxLife * 0.7;
      if (p.life < fadeStart) {
        p.alpha = (p.life / fadeStart) * 0.25;
      }
      if (p.life <= 0) {
        this.puddles.splice(i, 1);
      }
    }

    // Spawn puddles periodically
    this.puddleTimer += dt;
    if (this.puddleTimer >= RainEffect.PUDDLE_SPAWN_INTERVAL && this.puddles.length < 20) {
      this.puddleTimer = 0;
      this.puddles.push({
        x: randomRange(20, this.screenWidth - 20),
        y: this.groundY + randomRange(0, 10),
        width: 0,
        maxWidth: randomRange(8, 18),
        height: randomRange(2, 4),
        alpha: 0.25,
        life: RainEffect.PUDDLE_MAX_LIFE,
        maxLife: RainEffect.PUDDLE_MAX_LIFE,
      });
    }

    // Mist layer near ground - fade in when active
    if (this.mistAlpha < RainEffect.MIST_TARGET_ALPHA) {
      this.mistAlpha = Math.min(RainEffect.MIST_TARGET_ALPHA, this.mistAlpha + RainEffect.MIST_FADE_SPEED * dt);
    }
  }

  render(renderer: Renderer): void {
    if (!this.active) return;

    // Rain drops with gradient and glow
    for (const p of this.particles) {
      const lifeAlpha = Math.min(p.life / p.maxLife, 1) * 0.7;

      // Subtle glow around each drop
      renderer.drawRadialGlow(
        p.x, p.y, 0, RainEffect.GLOW_RADIUS,
        `rgba(168, 212, 236, ${lifeAlpha * 0.15})`,
        `rgba(168, 212, 236, 0)`,
        LAYERS.EFFECTS,
      );

      // Elongated drop with gradient
      renderer.setAlpha(lifeAlpha, LAYERS.EFFECTS, (ctx) => {
        const dropLength = Math.min(p.vy * 0.015, 18);
        const windOffsetX = p.vx * 0.01;
        const gradient = ctx.createLinearGradient(
          p.x + windOffsetX, p.y - dropLength,
          p.x, p.y,
        );
        gradient.addColorStop(0, `rgba(168, 212, 236, 0.3)`);
        gradient.addColorStop(0.5, COLORS.RAIN);
        gradient.addColorStop(1, COLORS.WATER_LIGHT);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x + windOffsetX, p.y - dropLength);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
    }

    // Ring splashes
    for (const s of this.ringSplashes) {
      renderer.setAlpha(s.alpha, LAYERS.EFFECTS, (ctx) => {
        ctx.strokeStyle = COLORS.RAIN_SPLASH;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.radius, s.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // Splash particles (tiny upward drops)
    renderer.setAlpha(1, LAYERS.EFFECTS, (ctx) => {
      ctx.fillStyle = COLORS.RAIN_SPLASH;
      for (const sp of this.splashParticles) {
        const alpha = (sp.life / sp.maxLife) * 0.6;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });

    // Puddles
    for (const p of this.puddles) {
      renderer.setAlpha(p.alpha, LAYERS.EFFECTS, (ctx) => {
        ctx.fillStyle = COLORS.WATER_LIGHT;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.width, p.height, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Ground mist layer
    if (this.mistAlpha > 0) {
      renderer.setAlpha(this.mistAlpha, LAYERS.EFFECTS, (ctx) => {
        const mistGradient = ctx.createLinearGradient(0, this.groundY - 30, 0, this.screenHeight);
        mistGradient.addColorStop(0, 'rgba(200, 208, 220, 0)');
        mistGradient.addColorStop(0.3, COLORS.FOG);
        mistGradient.addColorStop(1, 'rgba(200, 208, 220, 0.3)');
        ctx.fillStyle = mistGradient;
        ctx.fillRect(0, this.groundY - 30, this.screenWidth, this.screenHeight - this.groundY + 30);
      });
    }
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
      windDrift: this.windAngle * 2,
    });
  }

  private createSplash(x: number, y: number): void {
    // Ring splash
    this.ringSplashes.push({
      x,
      y,
      alpha: 0.5,
      radius: 0,
      maxRadius: RainEffect.RING_SPLASH_MAX_RADIUS,
      life: RainEffect.RING_SPLASH_LIFE,
      maxLife: RainEffect.RING_SPLASH_LIFE,
    });

    // Upward splash particles
    const count = Math.floor(randomRange(
      RainEffect.SPLASH_PARTICLE_COUNT_MIN,
      RainEffect.SPLASH_PARTICLE_COUNT_MAX,
    ));
    for (let i = 0; i < count; i++) {
      const angle = randomRange(-Math.PI * 0.8, -Math.PI * 0.2);
      const speed = randomRange(40, 100);
      this.splashParticles.push({
        x: x + randomRange(-2, 2),
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: RainEffect.SPLASH_PARTICLE_LIFE,
        maxLife: RainEffect.SPLASH_PARTICLE_LIFE,
        size: randomRange(0.5, 1.5),
      });
    }
  }

  setWindAngle(angle: number): void {
    this.windAngle = angle;
  }

  setActive(active: boolean): void {
    this.active = active;
    if (!active) {
      this.particles = [];
      this.ringSplashes = [];
      this.splashParticles = [];
      this.puddles = [];
      this.mistAlpha = 0;
      this.puddleTimer = 0;
    }
  }

  get isActive(): boolean {
    return this.active;
  }
}
