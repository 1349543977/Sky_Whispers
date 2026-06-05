"use strict";
// ============================================================
// ProgressBar - Animated progress bar with Cloud Whisper aesthetic
// Gradient fill, shimmer sweep, glow on leading edge
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const math_1 = require("../utils/math");
class ProgressBar {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        // Animation state
        this.shimmerOffset = 0;
        this.glowPulse = 0;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.min = (_a = options.min) !== null && _a !== void 0 ? _a : 0;
        this.max = (_b = options.max) !== null && _b !== void 0 ? _b : 100;
        this.value = options.value;
        this.displayValue = options.value;
        this.fillColor = (_c = options.fillColor) !== null && _c !== void 0 ? _c : color_1.DesignTokens.colors.secondary;
        this.fillGradientEnd = (_d = options.fillGradientEnd) !== null && _d !== void 0 ? _d : color_1.DesignTokens.colors.secondaryLight;
        this.bgColor = (_e = options.bgColor) !== null && _e !== void 0 ? _e : 'rgba(0,0,0,0.08)';
        this.borderColor = (_f = options.borderColor) !== null && _f !== void 0 ? _f : 'transparent';
        this.borderRadius = (_g = options.borderRadius) !== null && _g !== void 0 ? _g : color_1.DesignTokens.borderRadius.md;
        this.showText = (_h = options.showText) !== null && _h !== void 0 ? _h : false;
        this.textColor = (_j = options.textColor) !== null && _j !== void 0 ? _j : color_1.DesignTokens.colors.textPrimary;
        this.fontSize = (_k = options.fontSize) !== null && _k !== void 0 ? _k : color_1.DesignTokens.fontSize.xs;
    }
    update(dt) {
        // Smooth animation
        this.displayValue = (0, math_1.lerp)(this.displayValue, this.value, 0.1);
        // Shimmer sweep
        this.shimmerOffset += dt * 150;
        if (this.shimmerOffset > this.width + 60) {
            this.shimmerOffset = -60;
        }
        // Glow pulse
        this.glowPulse = (Math.sin(Date.now() * 0.004) + 1) / 2;
    }
    render(renderer) {
        const progress = (0, math_1.clamp)((this.displayValue - this.min) / (this.max - this.min), 0, 1);
        // Track shadow
        renderer.drawSoftShadow(this.x + this.width / 2, this.y + this.height + 2, this.width * 0.48, 2, 4, 'rgba(26, 39, 56, 0.06)', constants_1.LAYERS.UI - 1);
        // Background track
        renderer.fillRoundRect(this.x, this.y, this.width, this.height, this.borderRadius, this.bgColor, constants_1.LAYERS.UI);
        // Gradient fill
        const fillWidth = this.width * progress;
        if (fillWidth > 0) {
            const clampedFillWidth = Math.max(fillWidth, this.borderRadius * 2);
            renderer.fillGradientRoundRect(this.x, this.y, clampedFillWidth, this.height, this.borderRadius, this.fillColor, this.fillGradientEnd, false, constants_1.LAYERS.UI);
            // Shimmer highlight across filled portion
            this.renderShimmer(renderer, clampedFillWidth);
            // Glow effect on leading edge
            this.renderLeadingGlow(renderer, clampedFillWidth, progress);
        }
        // Border
        if (this.borderColor !== 'transparent') {
            renderer.strokeRoundRect(this.x, this.y, this.width, this.height, this.borderRadius, this.borderColor, 1, constants_1.LAYERS.UI);
        }
        // Text overlay
        if (this.showText) {
            const percent = Math.round(progress * 100);
            renderer.fillTextWithShadow(`${percent}%`, this.x + this.width / 2, this.y + this.height / 2, this.textColor, 'rgba(0,0,0,0.08)', this.fontSize, 1, 1, 'center', 'middle', constants_1.LAYERS.UI);
        }
    }
    renderShimmer(renderer, fillWidth) {
        const shimmerX = this.x + this.shimmerOffset;
        const shimmerWidth = 40;
        if (shimmerX + shimmerWidth > this.x && shimmerX < this.x + fillWidth) {
            renderer.setAlpha(0.2, constants_1.LAYERS.UI, (ctx) => {
                const gradient = ctx.createLinearGradient(shimmerX, this.y, shimmerX + shimmerWidth, this.y);
                gradient.addColorStop(0, 'rgba(255,255,255,0)');
                gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = gradient;
                const r = Math.min(this.borderRadius, this.width / 2, this.height / 2);
                ctx.beginPath();
                ctx.moveTo(this.x + r, this.y);
                ctx.lineTo(this.x + fillWidth - r, this.y);
                ctx.arcTo(this.x + fillWidth, this.y, this.x + fillWidth, this.y + r, r);
                ctx.lineTo(this.x + fillWidth, this.y + this.height - r);
                ctx.arcTo(this.x + fillWidth, this.y + this.height, this.x + fillWidth - r, this.y + this.height, r);
                ctx.lineTo(this.x + r, this.y + this.height);
                ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - r, r);
                ctx.lineTo(this.x, this.y + r);
                ctx.arcTo(this.x, this.y, this.x + r, this.y, r);
                ctx.closePath();
                ctx.fill();
            });
        }
    }
    renderLeadingGlow(renderer, fillWidth, progress) {
        if (progress <= 0 || progress >= 1)
            return;
        const glowX = this.x + fillWidth;
        const glowY = this.y + this.height / 2;
        const glowRadius = 6 + this.glowPulse * 3;
        const glowAlpha = 0.3 + this.glowPulse * 0.2;
        renderer.setAlpha(glowAlpha, constants_1.LAYERS.UI, (ctx) => {
            const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
            gradient.addColorStop(0, this.fillGradientEnd);
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    setValue(value) {
        this.value = (0, math_1.clamp)(value, this.min, this.max);
    }
    getValue() {
        return this.value;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    setFillColor(color) {
        this.fillColor = color;
    }
}
exports.ProgressBar = ProgressBar;
//# sourceMappingURL=ProgressBar.js.map