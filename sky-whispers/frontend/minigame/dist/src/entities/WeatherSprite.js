"use strict";
// ============================================================
// WeatherSprite - Cute weather-themed creature entity
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherSprite = void 0;
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
class WeatherSprite {
    constructor(data, type, x, y) {
        this.time = 0;
        this.floatOffset = 0;
        this.heartParticles = [];
        this.width = 32;
        this.height = 32;
        this.data = data;
        this.type = type;
        this.x = x;
        this.y = y;
        this.baseY = y;
    }
    update(dt) {
        this.time += dt * 1000;
        this.floatOffset = Math.sin(this.time * 0.003) * 4;
        this.y = this.baseY + this.floatOffset;
        // Update heart particles
        for (let i = this.heartParticles.length - 1; i >= 0; i--) {
            const p = this.heartParticles[i];
            p.y += p.vy * dt;
            p.alpha -= dt * 0.8;
            if (p.alpha <= 0) {
                this.heartParticles.splice(i, 1);
            }
        }
    }
    render(renderer) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        // Glow effect
        renderer.setAlpha(0.2, constants_1.LAYERS.ENTITIES, (ctx) => {
            ctx.fillStyle = this.type.color_primary;
            ctx.beginPath();
            ctx.arc(cx, cy, this.width / 2 + 6, 0, Math.PI * 2);
            ctx.fill();
        });
        // Body
        renderer.drawCircle(cx, cy, this.width / 2, this.type.color_primary, true, constants_1.LAYERS.ENTITIES);
        // Face - eyes
        renderer.drawCircle(cx - 5, cy - 3, 3, '#FFFFFF', true, constants_1.LAYERS.ENTITIES);
        renderer.drawCircle(cx + 5, cy - 3, 3, '#FFFFFF', true, constants_1.LAYERS.ENTITIES);
        renderer.drawCircle(cx - 5, cy - 3, 1.5, '#2C3E50', true, constants_1.LAYERS.ENTITIES);
        renderer.drawCircle(cx + 5, cy - 3, 1.5, '#2C3E50', true, constants_1.LAYERS.ENTITIES);
        // Mouth - smile based on happiness
        const happiness = (0, math_1.clamp)(this.data.happiness, 0, 100);
        if (happiness > 60) {
            // Happy mouth
            renderer.setAlpha(1, constants_1.LAYERS.ENTITIES, (ctx) => {
                ctx.strokeStyle = '#2C3E50';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(cx, cy + 2, 4, 0.1 * Math.PI, 0.9 * Math.PI);
                ctx.stroke();
            });
        }
        else if (happiness > 30) {
            // Neutral mouth
            renderer.fillRect(cx - 3, cy + 4, 6, 1.5, '#2C3E50', constants_1.LAYERS.ENTITIES);
        }
        else {
            // Sad mouth
            renderer.setAlpha(1, constants_1.LAYERS.ENTITIES, (ctx) => {
                ctx.strokeStyle = '#2C3E50';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(cx, cy + 8, 4, 1.1 * Math.PI, 1.9 * Math.PI);
                ctx.stroke();
            });
        }
        // Weather-themed accessory based on type
        this.renderAccessory(renderer, cx, cy);
        // Level badge
        renderer.fillRoundRect(cx + this.width / 2 - 8, cy + this.width / 2 - 4, 16, 12, 6, '#2C3E50', constants_1.LAYERS.ENTITIES);
        renderer.drawText(`Lv${this.data.level}`, cx + this.width / 2, cy + this.width / 2 + 2, '#FFFFFF', 8, 'center', 'middle', constants_1.LAYERS.ENTITIES);
        // Heart particles
        for (const p of this.heartParticles) {
            renderer.setAlpha(p.alpha, constants_1.LAYERS.EFFECTS, (ctx) => {
                ctx.fillStyle = '#FF6B6B';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('❤', p.x, p.y);
            });
        }
    }
    renderAccessory(renderer, cx, cy) {
        const color = this.type.color_secondary;
        switch (this.type.weather_condition) {
            case 'rainy':
                // Rain drop on head
                renderer.drawCircle(cx, cy - this.width / 2 - 4, 4, constants_1.COLORS.RAIN, true, constants_1.LAYERS.ENTITIES);
                break;
            case 'snowy':
                // Snowflake on head
                renderer.drawText('❄', cx, cy - this.width / 2 - 6, '#ECEFF1', 10, 'center', 'bottom', constants_1.LAYERS.ENTITIES);
                break;
            case 'sunny':
                // Sun rays
                renderer.drawCircle(cx, cy - this.width / 2 - 2, 5, '#FFD54F', true, constants_1.LAYERS.ENTITIES);
                break;
            case 'thunderstorm':
                // Lightning bolt
                renderer.drawText('⚡', cx, cy - this.width / 2 - 4, '#FFF9C4', 10, 'center', 'bottom', constants_1.LAYERS.ENTITIES);
                break;
            case 'windy':
                // Wind swirl
                renderer.drawText('🌀', cx + this.width / 2 + 2, cy - 4, color, 8, 'center', 'middle', constants_1.LAYERS.ENTITIES);
                break;
            default:
                break;
        }
    }
    emitHearts() {
        const cx = this.x + this.width / 2;
        const cy = this.y;
        for (let i = 0; i < 3; i++) {
            this.heartParticles.push({
                x: cx + (Math.random() - 0.5) * 20,
                y: cy - 10 - Math.random() * 10,
                alpha: 1,
                vy: -30 - Math.random() * 20,
            });
        }
    }
    containsPoint(px, py) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        return dx * dx + dy * dy <= (this.width / 2 + 4) * (this.width / 2 + 4);
    }
    getData() {
        return this.data;
    }
    updateData(data) {
        this.data = data;
    }
    getType() {
        return this.type;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
exports.WeatherSprite = WeatherSprite;
//# sourceMappingURL=WeatherSprite.js.map