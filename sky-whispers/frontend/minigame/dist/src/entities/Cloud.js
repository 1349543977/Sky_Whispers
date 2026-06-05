"use strict";
// ============================================================
// Cloud - Drifting cloud entity with variants
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cloud = void 0;
const constants_1 = require("../utils/constants");
class Cloud {
    constructor(x, y, speed, variant, screenWidth) {
        this.time = 0;
        this.dripOffset = 0;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.variant = variant;
        this.screenWidth = screenWidth;
        this.width = variant === 'gift' ? 70 : 60;
        this.height = variant === 'rain' ? 35 : 30;
    }
    update(dt) {
        this.time += dt * 1000;
        this.x += this.speed * dt;
        // Wrap around screen
        if (this.x > this.screenWidth + this.width) {
            this.x = -this.width;
        }
        if (this.variant === 'rain') {
            this.dripOffset = (this.dripOffset + dt * 30) % 20;
        }
    }
    render(renderer) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        switch (this.variant) {
            case 'normal':
                this.renderNormalCloud(renderer, cx, cy);
                break;
            case 'rain':
                this.renderRainCloud(renderer, cx, cy);
                break;
            case 'gift':
                this.renderGiftCloud(renderer, cx, cy);
                break;
        }
    }
    renderNormalCloud(renderer, cx, cy) {
        renderer.setAlpha(0.85, constants_1.LAYERS.ENTITIES, (ctx) => {
            ctx.fillStyle = constants_1.COLORS.CLOUD_WHITE;
            // Cloud shape using overlapping circles
            ctx.beginPath();
            ctx.arc(cx - 15, cy, 14, 0, Math.PI * 2);
            ctx.arc(cx, cy - 6, 16, 0, Math.PI * 2);
            ctx.arc(cx + 15, cy, 14, 0, Math.PI * 2);
            ctx.arc(cx + 5, cy + 4, 12, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    renderRainCloud(renderer, cx, cy) {
        renderer.setAlpha(0.9, constants_1.LAYERS.ENTITIES, (ctx) => {
            ctx.fillStyle = constants_1.COLORS.CLOUD_RAIN;
            ctx.beginPath();
            ctx.arc(cx - 15, cy, 14, 0, Math.PI * 2);
            ctx.arc(cx, cy - 6, 16, 0, Math.PI * 2);
            ctx.arc(cx + 15, cy, 14, 0, Math.PI * 2);
            ctx.arc(cx + 5, cy + 4, 12, 0, Math.PI * 2);
            ctx.fill();
        });
        // Rain drops
        renderer.setAlpha(0.6, constants_1.LAYERS.EFFECTS, (ctx) => {
            ctx.fillStyle = constants_1.COLORS.RAIN;
            for (let i = 0; i < 3; i++) {
                const dx = cx - 12 + i * 12;
                const dy = cy + 14 + (this.dripOffset + i * 7) % 20;
                ctx.fillRect(dx, dy, 1.5, 6);
            }
        });
    }
    renderGiftCloud(renderer, cx, cy) {
        renderer.setAlpha(0.9, constants_1.LAYERS.ENTITIES, (ctx) => {
            ctx.fillStyle = constants_1.COLORS.CLOUD_GIFT;
            ctx.beginPath();
            ctx.arc(cx - 18, cy, 16, 0, Math.PI * 2);
            ctx.arc(cx, cy - 8, 18, 0, Math.PI * 2);
            ctx.arc(cx + 18, cy, 16, 0, Math.PI * 2);
            ctx.arc(cx + 5, cy + 5, 14, 0, Math.PI * 2);
            ctx.fill();
        });
        // Ribbon
        renderer.setAlpha(1, constants_1.LAYERS.ENTITIES, (ctx) => {
            ctx.fillStyle = '#E74C3C';
            ctx.fillRect(cx - 2, cy - 12, 4, 24);
            ctx.fillRect(cx - 10, cy - 2, 20, 4);
            // Bow
            ctx.beginPath();
            ctx.arc(cx - 5, cy - 12, 4, 0, Math.PI * 2);
            ctx.arc(cx + 5, cy - 12, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    containsPoint(px, py) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const dx = px - cx;
        const dy = py - cy;
        return (dx * dx) / (this.width * this.width / 4) + (dy * dy) / (this.height * this.height / 4) <= 1;
    }
    getVariant() {
        return this.variant;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
exports.Cloud = Cloud;
//# sourceMappingURL=Cloud.js.map