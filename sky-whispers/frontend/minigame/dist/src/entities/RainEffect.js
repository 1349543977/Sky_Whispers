"use strict";
// ============================================================
// RainEffect - Rain particle system
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.RainEffect = void 0;
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
const DEFAULT_CONFIG = {
    maxParticles: 150,
    emitRate: 80,
    lifetime: { min: 0.8, max: 1.5 },
    speed: { min: 300, max: 500 },
    size: { min: 1, max: 2.5 },
    gravity: 200,
    friction: 0.99,
    colors: [constants_1.COLORS.RAIN],
    angle: { min: 80, max: 100 },
};
class RainEffect {
    constructor(screenWidth, screenHeight, groundY, config) {
        this.particles = [];
        this.splashes = [];
        this.emitAccumulator = 0;
        this.active = true;
        this.windAngle = 0;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.groundY = groundY;
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
    render(renderer) {
        if (!this.active)
            return;
        // Rain drops
        renderer.setAlpha(0.6, constants_1.LAYERS.EFFECTS, (ctx) => {
            ctx.strokeStyle = constants_1.COLORS.RAIN;
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
        renderer.setAlpha(1, constants_1.LAYERS.EFFECTS, (ctx) => {
            for (const s of this.splashes) {
                ctx.globalAlpha = s.alpha;
                ctx.strokeStyle = constants_1.COLORS.RAIN;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, Math.PI, 2 * Math.PI);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        });
    }
    emitParticle() {
        const angle = (0, math_1.randomRange)(this.config.angle.min, this.config.angle.max) + this.windAngle;
        const angleRad = (angle * Math.PI) / 180;
        const speed = (0, math_1.randomRange)(this.config.speed.min, this.config.speed.max);
        const lifetime = (0, math_1.randomRange)(this.config.lifetime.min, this.config.lifetime.max);
        this.particles.push({
            x: (0, math_1.randomRange)(-20, this.screenWidth + 20),
            y: (0, math_1.randomRange)(-20, -5),
            vx: Math.cos(angleRad) * speed * 0.1,
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
    setWindAngle(angle) {
        this.windAngle = angle;
    }
    setActive(active) {
        this.active = active;
        if (!active) {
            this.particles = [];
            this.splashes = [];
        }
    }
    get isActive() {
        return this.active;
    }
}
exports.RainEffect = RainEffect;
//# sourceMappingURL=RainEffect.js.map