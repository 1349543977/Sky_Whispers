"use strict";
// ============================================================
// Windmill - Windmill entity with rotating blades and coin emission
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Windmill = void 0;
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
class Windmill {
    constructor(x, y, level, windPower) {
        this.rotation = 0;
        this.coinParticles = [];
        this.time = 0;
        this.width = 60;
        this.height = 80;
        this.x = x;
        this.y = y;
        this.level = level;
        this.windPower = windPower;
    }
    update(dt) {
        this.time += dt * 1000;
        // Rotation speed based on wind power
        const speed = constants_1.ANIMATION.WINDMILL_BASE_SPEED * (1 + this.windPower * 0.5);
        this.rotation += speed * dt * 60;
        // Update coin particles
        for (let i = this.coinParticles.length - 1; i >= 0; i--) {
            const p = this.coinParticles[i];
            p.y += p.vy * dt;
            p.vy -= 20 * dt; // Float upward
            p.life -= dt;
            p.alpha = (0, math_1.clamp)(p.life / 1.5, 0, 1);
            if (p.life <= 0) {
                this.coinParticles.splice(i, 1);
            }
        }
    }
    render(renderer) {
        const cx = this.x + this.width / 2;
        const baseY = this.y + this.height - 10;
        // Windmill base/tower
        renderer.fillRoundRect(cx - 6, baseY - 40, 12, 40, 3, constants_1.COLORS.WINDMILL_BASE, constants_1.LAYERS.ENTITIES);
        // Windmill hub
        renderer.drawCircle(cx, baseY - 40, 5, '#5D4037', true, constants_1.LAYERS.ENTITIES);
        // Rotating blades
        this.renderBlades(renderer, cx, baseY - 40);
        // Level indicator
        renderer.fillRoundRect(this.x, this.y + this.height - 4, this.width, 8, 4, '#5D4037', constants_1.LAYERS.ENTITIES);
        renderer.drawText(`Lv${this.level}`, cx, this.y + this.height, '#FFFFFF', 8, 'center', 'top', constants_1.LAYERS.ENTITIES);
        // Coin particles
        for (const p of this.coinParticles) {
            renderer.setAlpha(p.alpha, constants_1.LAYERS.EFFECTS, (ctx) => {
                ctx.fillStyle = constants_1.COLORS.COIN_GOLD;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFE082';
                ctx.font = '6px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('$', p.x, p.y);
            });
        }
    }
    renderBlades(renderer, cx, cy) {
        const bladeLength = 20 + this.level * 2;
        const bladeWidth = 6;
        renderer.setAlpha(1, constants_1.LAYERS.ENTITIES, (ctx) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.rotation);
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI) / 2);
                // Blade
                ctx.fillStyle = constants_1.COLORS.WINDMILL_BLADE;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-bladeWidth / 2, -bladeLength);
                ctx.lineTo(bladeWidth / 2, -bladeLength * 0.8);
                ctx.closePath();
                ctx.fill();
                // Blade outline
                ctx.strokeStyle = '#D7CCC8';
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.restore();
            }
            ctx.restore();
        });
    }
    emitCoin() {
        const cx = this.x + this.width / 2;
        const baseY = this.y + this.height - 40;
        this.coinParticles.push({
            x: cx + (Math.random() - 0.5) * 20,
            y: baseY,
            vy: -40 - Math.random() * 20,
            alpha: 1,
            life: 1.5,
        });
    }
    setWindPower(power) {
        this.windPower = power;
    }
    setLevel(level) {
        this.level = level;
    }
    containsPoint(px, py) {
        return (px >= this.x &&
            px <= this.x + this.width &&
            py >= this.y &&
            py <= this.y + this.height);
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
exports.Windmill = Windmill;
//# sourceMappingURL=Windmill.js.map