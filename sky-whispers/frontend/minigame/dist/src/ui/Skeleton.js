"use strict";
// ============================================================
// Skeleton - Loading skeleton with Cloud Whisper aesthetic
// Shimmer sweep, pulse opacity, soft rounded shapes
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skeleton = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
class Skeleton {
    constructor(options) {
        var _a, _b, _c;
        this.shimmerOffset = 0;
        this.active = true;
        this.pulsePhase = 0;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.rows = (_a = options.rows) !== null && _a !== void 0 ? _a : 4;
        this.rowHeight = (_b = options.rowHeight) !== null && _b !== void 0 ? _b : 16;
        this.rowGap = (_c = options.rowGap) !== null && _c !== void 0 ? _c : 12;
    }
    update(dt) {
        if (!this.active)
            return;
        // Shimmer sweep animation
        this.shimmerOffset += dt * 200;
        if (this.shimmerOffset > this.width + 100) {
            this.shimmerOffset = -100;
        }
        // Pulse phase for subtle opacity variation
        this.pulsePhase += dt * 2;
    }
    render(renderer) {
        if (!this.active)
            return;
        // Subtle pulse opacity
        const pulseAlpha = 0.85 + Math.sin(this.pulsePhase) * 0.08;
        for (let i = 0; i < this.rows; i++) {
            const rowY = this.y + i * (this.rowHeight + this.rowGap);
            const rowWidth = i === this.rows - 1 ? this.width * 0.6 : this.width;
            // Base shape with soft color
            renderer.setAlpha(pulseAlpha, constants_1.LAYERS.UI, (ctx) => {
                ctx.fillStyle = color_1.DesignTokens.colors.neutral200;
                const r = Math.min(color_1.DesignTokens.borderRadius.md, rowWidth / 2, this.rowHeight / 2);
                ctx.beginPath();
                ctx.moveTo(this.x + r, rowY);
                ctx.lineTo(this.x + rowWidth - r, rowY);
                ctx.arcTo(this.x + rowWidth, rowY, this.x + rowWidth, rowY + r, r);
                ctx.lineTo(this.x + rowWidth, rowY + this.rowHeight - r);
                ctx.arcTo(this.x + rowWidth, rowY + this.rowHeight, this.x + rowWidth - r, rowY + this.rowHeight, r);
                ctx.lineTo(this.x + r, rowY + this.rowHeight);
                ctx.arcTo(this.x, rowY + this.rowHeight, this.x, rowY + this.rowHeight - r, r);
                ctx.lineTo(this.x, rowY + r);
                ctx.arcTo(this.x, rowY, this.x + r, rowY, r);
                ctx.closePath();
                ctx.fill();
            });
            // Shimmer highlight sweep
            const shimmerX = this.x + this.shimmerOffset;
            const shimmerWidth = 60;
            if (shimmerX + shimmerWidth > this.x && shimmerX < this.x + rowWidth) {
                renderer.setAlpha(0.3 * pulseAlpha, constants_1.LAYERS.UI, (ctx) => {
                    const gradient = ctx.createLinearGradient(shimmerX, rowY, shimmerX + shimmerWidth, rowY);
                    gradient.addColorStop(0, 'rgba(255,255,255,0)');
                    gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
                    gradient.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.fillStyle = gradient;
                    const r = Math.min(color_1.DesignTokens.borderRadius.md, rowWidth / 2, this.rowHeight / 2);
                    ctx.beginPath();
                    ctx.moveTo(this.x + r, rowY);
                    ctx.lineTo(this.x + rowWidth - r, rowY);
                    ctx.arcTo(this.x + rowWidth, rowY, this.x + rowWidth, rowY + r, r);
                    ctx.lineTo(this.x + rowWidth, rowY + this.rowHeight - r);
                    ctx.arcTo(this.x + rowWidth, rowY + this.rowHeight, this.x + rowWidth - r, rowY + this.rowHeight, r);
                    ctx.lineTo(this.x + r, rowY + this.rowHeight);
                    ctx.arcTo(this.x, rowY + this.rowHeight, this.x, rowY + this.rowHeight - r, r);
                    ctx.lineTo(this.x, rowY + r);
                    ctx.arcTo(this.x, rowY, this.x + r, rowY, r);
                    ctx.closePath();
                    ctx.fill();
                });
            }
        }
    }
    setActive(active) {
        this.active = active;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.Skeleton = Skeleton;
//# sourceMappingURL=Skeleton.js.map