"use strict";
// ============================================================
// Skeleton - Loading skeleton with shimmer animation
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
        this.shimmerOffset += dt * 200;
        if (this.shimmerOffset > this.width + 100) {
            this.shimmerOffset = -100;
        }
    }
    render(renderer) {
        if (!this.active)
            return;
        for (let i = 0; i < this.rows; i++) {
            const rowY = this.y + i * (this.rowHeight + this.rowGap);
            const rowWidth = i === this.rows - 1 ? this.width * 0.6 : this.width;
            // Base
            renderer.fillRoundRect(this.x, rowY, rowWidth, this.rowHeight, color_1.DesignTokens.borderRadius.sm, '#E8E8E8', constants_1.LAYERS.UI);
            // Shimmer highlight
            const shimmerX = this.x + this.shimmerOffset;
            const shimmerWidth = 60;
            if (shimmerX + shimmerWidth > this.x && shimmerX < this.x + rowWidth) {
                renderer.setAlpha(0.3, constants_1.LAYERS.UI, (ctx) => {
                    const gradient = ctx.createLinearGradient(shimmerX, rowY, shimmerX + shimmerWidth, rowY);
                    gradient.addColorStop(0, 'rgba(255,255,255,0)');
                    gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
                    gradient.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.fillStyle = gradient;
                    this.drawRoundRectPath(ctx, this.x, rowY, rowWidth, this.rowHeight, color_1.DesignTokens.borderRadius.sm);
                    ctx.fill();
                });
            }
        }
    }
    drawRoundRectPath(ctx, x, y, w, h, radius) {
        const r = Math.min(radius, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
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