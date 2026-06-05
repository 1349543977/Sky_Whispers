"use strict";
// ============================================================
// SnowEffect - Dreamy, drifting snowflakes with sparkle
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnowEffect = void 0;
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
const DEFAULT_CONFIG = {
    maxParticles: 100,
    emitRate: 25,
    lifetime: { min: 4, max: 8 },
    speed: { min: 15, max: 45 },
    size: { min: 1, max: 5 },
    gravity: 25,
    friction: 0.98,
    colors: [constants_1.COLORS.SNOW],
    angle: { min: 80, max: 100 },
};
class SnowEffect {
    constructor(screenWidth, screenHeight, config) {
        this.particles = [];
        this.accumulations = [];
        this.emitAccumulator = 0;
        this.active = true;
        this.windSpeed = 0;
        this.accumulationTimer = 0;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.config = Object.assign(Object.assign({}, DEFAULT_CONFIG), config);
    }
    update(dt) {
        if (!this.active)
            return;
        // Emit new particles
        this.emitAccumulator += dt * this.config.emitRate;
        while (this.emitAccumulator >= 1 && this.particles.length < this.config.maxParticles) {
            this.emitParticle();
            this.emitAccumulator -= 1;
        }
        // Update snowflakes
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy += this.config.gravity * dt;
            p.vx += this.windSpeed * dt;
            p.vx *= this.config.friction;
            p.vy *= this.config.friction;
            // Sinusoidal horizontal drift
            p.driftPhase += p.driftFrequency * dt;
            const driftForce = Math.sin(p.driftPhase) * p.driftAmplitude * dt;
            p.x += p.vx * dt + driftForce;
            p.y += p.vy * dt;
            // Rotation for larger flakes
            p.rotation += p.rotationSpeed * dt;
            // Sparkle timer
            if (p.canSparkle) {
                p.sparkleTimer -= dt;
                if (p.sparkleTimer <= 0) {
                    p.sparkleIntensity = 1;
                    p.sparkleTimer = (0, math_1.randomRange)(SnowEffect.SPARKLE_INTERVAL_MIN, SnowEffect.SPARKLE_INTERVAL_MAX);
                }
                // Decay sparkle
                if (p.sparkleIntensity > 0) {
                    p.sparkleIntensity = Math.max(0, p.sparkleIntensity - dt / SnowEffect.SPARKLE_DURATION);
                }
            }
            p.life -= dt;
            // Hit ground - create accumulation
            if (p.y >= this.screenHeight) {
                this.createAccumulation(p.x, this.screenHeight - (0, math_1.randomRange)(0, 5));
                this.particles.splice(i, 1);
                continue;
            }
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        // Update accumulations
        for (let i = this.accumulations.length - 1; i >= 0; i--) {
            const a = this.accumulations[i];
            a.life -= dt;
            // Fade out in last 40% of life
            const fadeStart = a.maxLife * 0.6;
            if (a.life < fadeStart) {
                a.alpha = (a.life / fadeStart) * 0.5;
            }
            if (a.life <= 0) {
                this.accumulations.splice(i, 1);
            }
        }
        // Spawn accumulations periodically
        this.accumulationTimer += dt;
        if (this.accumulationTimer >= SnowEffect.ACCUMULATION_SPAWN_INTERVAL
            && this.accumulations.length < SnowEffect.ACCUMULATION_MAX_COUNT) {
            this.accumulationTimer = 0;
            this.createAccumulation((0, math_1.randomRange)(10, this.screenWidth - 10), this.screenHeight - (0, math_1.randomRange)(0, 8));
        }
    }
    render(renderer) {
        if (!this.active)
            return;
        // Snowflakes with glow and sparkle
        for (const p of this.particles) {
            const lifeAlpha = Math.min(p.life / p.maxLife, 1) * 0.85;
            // Soft glow around each flake
            const glowAlpha = lifeAlpha * 0.2;
            renderer.drawRadialGlow(p.x, p.y, 0, SnowEffect.GLOW_OUTER_RADIUS * p.depth, `rgba(232, 237, 242, ${glowAlpha})`, `rgba(232, 237, 242, 0)`, constants_1.LAYERS.EFFECTS);
            // Draw snowflake body
            renderer.setAlpha(lifeAlpha, constants_1.LAYERS.EFFECTS, (ctx) => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                // Gradient fill for depth
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
                gradient.addColorStop(0, constants_1.COLORS.SNOW_SPARKLE);
                gradient.addColorStop(1, constants_1.COLORS.SNOW);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            // Sparkle effect on larger flakes
            if (p.canSparkle && p.sparkleIntensity > 0) {
                renderer.drawSparkle(p.x, p.y, p.size * 2.5 * p.sparkleIntensity, constants_1.COLORS.SNOW_SPARKLE, p.sparkleIntensity * lifeAlpha, constants_1.LAYERS.EFFECTS);
            }
        }
        // Snow accumulations
        for (const a of this.accumulations) {
            renderer.setAlpha(a.alpha, constants_1.LAYERS.EFFECTS, (ctx) => {
                ctx.fillStyle = constants_1.COLORS.SNOW;
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
    emitParticle() {
        const speed = (0, math_1.randomRange)(this.config.speed.min, this.config.speed.max);
        const angle = (0, math_1.randomRange)(this.config.angle.min, this.config.angle.max);
        const angleRad = (angle * Math.PI) / 180;
        const lifetime = (0, math_1.randomRange)(this.config.lifetime.min, this.config.lifetime.max);
        const size = (0, math_1.randomRange)(this.config.size.min, this.config.size.max);
        const depth = (size - this.config.size.min) / (this.config.size.max - this.config.size.min);
        this.particles.push({
            x: (0, math_1.randomRange)(-20, this.screenWidth + 20),
            y: (0, math_1.randomRange)(-20, -5),
            vx: Math.cos(angleRad) * speed,
            vy: Math.sin(angleRad) * speed,
            life: lifetime,
            maxLife: lifetime,
            size,
            color: this.config.colors[0],
            alpha: 1,
            gravity: this.config.gravity,
            friction: this.config.friction,
            driftPhase: (0, math_1.randomRange)(0, Math.PI * 2),
            driftAmplitude: (0, math_1.randomRange)(SnowEffect.DRIFT_AMPLITUDE_MIN, SnowEffect.DRIFT_AMPLITUDE_MAX),
            driftFrequency: (0, math_1.randomRange)(SnowEffect.DRIFT_FREQUENCY_MIN, SnowEffect.DRIFT_FREQUENCY_MAX),
            rotation: 0,
            rotationSpeed: size >= SnowEffect.SPARKLE_SIZE_THRESHOLD
                ? (0, math_1.randomRange)(-0.5, 0.5)
                : 0,
            canSparkle: size >= SnowEffect.SPARKLE_SIZE_THRESHOLD,
            sparkleTimer: (0, math_1.randomRange)(SnowEffect.SPARKLE_INTERVAL_MIN, SnowEffect.SPARKLE_INTERVAL_MAX),
            sparkleIntensity: 0,
            depth,
        });
    }
    createAccumulation(x, y) {
        this.accumulations.push({
            x,
            y,
            size: (0, math_1.randomRange)(1.5, 3.5),
            alpha: 0.5,
            life: SnowEffect.ACCUMULATION_MAX_LIFE,
            maxLife: SnowEffect.ACCUMULATION_MAX_LIFE,
        });
    }
    setWindSpeed(speed) {
        this.windSpeed = speed;
    }
    setActive(active) {
        this.active = active;
        if (!active) {
            this.particles = [];
            this.accumulations = [];
            this.accumulationTimer = 0;
        }
    }
    get isActive() {
        return this.active;
    }
}
exports.SnowEffect = SnowEffect;
SnowEffect.DRIFT_AMPLITUDE_MIN = 15;
SnowEffect.DRIFT_AMPLITUDE_MAX = 40;
SnowEffect.DRIFT_FREQUENCY_MIN = 0.8;
SnowEffect.DRIFT_FREQUENCY_MAX = 2.0;
SnowEffect.SPARKLE_INTERVAL_MIN = 1.5;
SnowEffect.SPARKLE_INTERVAL_MAX = 4.0;
SnowEffect.SPARKLE_DURATION = 0.3;
SnowEffect.SPARKLE_SIZE_THRESHOLD = 3;
SnowEffect.GLOW_OUTER_RADIUS = 8;
SnowEffect.ACCUMULATION_SPAWN_INTERVAL = 0.8;
SnowEffect.ACCUMULATION_MAX_LIFE = 5.0;
SnowEffect.ACCUMULATION_MAX_COUNT = 40;
//# sourceMappingURL=SnowEffect.js.map