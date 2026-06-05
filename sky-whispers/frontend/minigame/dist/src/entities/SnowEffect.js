"use strict";
// ============================================================
// SnowEffect - Snow particle system
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnowEffect = void 0;
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
const DEFAULT_CONFIG = {
    maxParticles: 100,
    emitRate: 30,
    lifetime: { min: 3, max: 6 },
    speed: { min: 20, max: 60 },
    size: { min: 2, max: 5 },
    gravity: 30,
    friction: 0.98,
    colors: [constants_1.COLORS.SNOW],
    angle: { min: 70, max: 110 },
};
class SnowEffect {
    constructor(screenWidth, screenHeight, config) {
        this.particles = [];
        this.emitAccumulator = 0;
        this.active = true;
        this.windSpeed = 0;
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
    render(renderer) {
        if (!this.active)
            return;
        renderer.setAlpha(1, constants_1.LAYERS.EFFECTS, (ctx) => {
            for (const p of this.particles) {
                const alpha = Math.min(p.life / p.maxLife, 1) * 0.8;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = constants_1.COLORS.SNOW;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        });
    }
    emitParticle() {
        const speed = (0, math_1.randomRange)(this.config.speed.min, this.config.speed.max);
        const angle = (0, math_1.randomRange)(this.config.angle.min, this.config.angle.max);
        const angleRad = (angle * Math.PI) / 180;
        const lifetime = (0, math_1.randomRange)(this.config.lifetime.min, this.config.lifetime.max);
        this.particles.push({
            x: (0, math_1.randomRange)(-20, this.screenWidth + 20),
            y: (0, math_1.randomRange)(-20, -5),
            vx: Math.cos(angleRad) * speed,
            vy: Math.sin(angleRad) * speed,
            life: lifetime,
            maxLife: lifetime,
            size: (0, math_1.randomRange)(this.config.size.min, this.config.size.max),
            color: this.config.colors[0],
            alpha: 1,
            gravity: this.config.gravity,
            friction: this.config.friction,
        });
    }
    setWindSpeed(speed) {
        this.windSpeed = speed;
    }
    setActive(active) {
        this.active = active;
        if (!active) {
            this.particles = [];
        }
    }
    get isActive() {
        return this.active;
    }
}
exports.SnowEffect = SnowEffect;
//# sourceMappingURL=SnowEffect.js.map