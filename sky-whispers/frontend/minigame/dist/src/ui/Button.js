"use strict";
// ============================================================
// Button - Touch button with Cloud Whisper aesthetic
// Gradient background, soft shadow, bounce animations
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const math_1 = require("../utils/math");
class Button {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        this.pressed = false;
        // Animation state
        this.scale = 1;
        this.targetScale = 1;
        this.bounceProgress = 1;
        this.bounceStartTime = 0;
        this.shimmerOffset = 0;
        this.spinnerAngle = 0;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.text = options.text;
        this.fontSize = (_a = options.fontSize) !== null && _a !== void 0 ? _a : color_1.DesignTokens.fontSize.md;
        this.textColor = (_b = options.textColor) !== null && _b !== void 0 ? _b : '#FFFFFF';
        this.bgColor = (_c = options.bgColor) !== null && _c !== void 0 ? _c : color_1.DesignTokens.colors.primary;
        this.gradientEnd = (_d = options.gradientEnd) !== null && _d !== void 0 ? _d : color_1.DesignTokens.colors.primaryLight;
        this.pressedBgColor = (_e = options.pressedBgColor) !== null && _e !== void 0 ? _e : color_1.DesignTokens.colors.primaryDark;
        this.disabledBgColor = (_f = options.disabledBgColor) !== null && _f !== void 0 ? _f : color_1.DesignTokens.colors.neutral300;
        this.borderRadius = (_g = options.borderRadius) !== null && _g !== void 0 ? _g : color_1.DesignTokens.borderRadius.lg;
        this.disabled = (_h = options.disabled) !== null && _h !== void 0 ? _h : false;
        this.loading = (_j = options.loading) !== null && _j !== void 0 ? _j : false;
        this.icon = (_k = options.icon) !== null && _k !== void 0 ? _k : '';
        this.onTap = options.onTap;
        // Initialize shimmer dots for loading state
        this.shimmerDots = [
            { offset: 0, speed: 1.2, size: 3 },
            { offset: 0.33, speed: 1.0, size: 2.5 },
            { offset: 0.66, speed: 0.8, size: 2 },
        ];
    }
    update(dt) {
        // Smooth scale transition
        this.scale += (this.targetScale - this.scale) * 0.2;
        // Bounce animation on release (easeOutBack)
        if (this.bounceProgress < 1) {
            this.bounceProgress = Math.min(1, (Date.now() - this.bounceStartTime) / constants_1.ANIMATION.BUTTON_RELEASE_SCALE / 1000 * 3);
            const easedT = (0, math_1.easeOutBack)(this.bounceProgress);
            this.scale = 0.92 + (1 - 0.92) * easedT;
        }
        // Loading animations
        if (this.loading) {
            this.spinnerAngle += dt * 6;
            this.shimmerOffset += dt * 300;
            if (this.shimmerOffset > this.width + 120) {
                this.shimmerOffset = -120;
            }
        }
    }
    render(renderer) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const drawWidth = this.width * this.scale;
        const drawHeight = this.height * this.scale;
        const drawX = cx - drawWidth / 2;
        const drawY = cy - drawHeight / 2;
        // Soft shadow beneath button
        if (!this.disabled) {
            renderer.drawSoftShadow(cx, drawY + drawHeight + 3, drawWidth * 0.45, 4, 6, color_1.DesignTokens.shadow.md.color, constants_1.LAYERS.UI - 1);
        }
        // Button background with gradient
        if (this.disabled) {
            renderer.fillRoundRect(drawX, drawY, drawWidth, drawHeight, this.borderRadius, this.disabledBgColor, constants_1.LAYERS.UI);
        }
        else if (this.pressed) {
            // Pressed state: darken gradient
            renderer.fillGradientRoundRect(drawX, drawY, drawWidth, drawHeight, this.borderRadius, this.pressedBgColor, this.bgColor, true, constants_1.LAYERS.UI);
        }
        else {
            // Normal state: gradient from bgColor to gradientEnd
            renderer.fillGradientRoundRect(drawX, drawY, drawWidth, drawHeight, this.borderRadius, this.bgColor, this.gradientEnd, true, constants_1.LAYERS.UI);
        }
        // Disabled overlay (desaturated + lower opacity)
        if (this.disabled) {
            renderer.setAlpha(0.5, constants_1.LAYERS.UI, (ctx) => {
                ctx.fillStyle = color_1.DesignTokens.colors.neutral100;
                ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
            });
        }
        // Shimmer sweep animation for loading state
        if (this.loading) {
            this.renderShimmer(renderer, drawX, drawY, drawWidth, drawHeight);
        }
        if (this.loading) {
            // Loading spinner dots
            this.renderSpinnerDots(renderer, cx, cy);
        }
        else {
            // Button text with optional icon
            this.renderContent(renderer, cx, cy);
        }
    }
    renderShimmer(renderer, drawX, drawY, drawWidth, drawHeight) {
        const shimmerX = drawX + this.shimmerOffset;
        const shimmerWidth = 80;
        if (shimmerX + shimmerWidth > drawX && shimmerX < drawX + drawWidth) {
            renderer.setAlpha(0.15, constants_1.LAYERS.UI, (ctx) => {
                const gradient = ctx.createLinearGradient(shimmerX, drawY, shimmerX + shimmerWidth, drawY);
                gradient.addColorStop(0, 'rgba(255,255,255,0)');
                gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = gradient;
                const r = Math.min(this.borderRadius, drawWidth / 2, drawHeight / 2);
                ctx.beginPath();
                ctx.moveTo(drawX + r, drawY);
                ctx.lineTo(drawX + drawWidth - r, drawY);
                ctx.arcTo(drawX + drawWidth, drawY, drawX + drawWidth, drawY + r, r);
                ctx.lineTo(drawX + drawWidth, drawY + drawHeight - r);
                ctx.arcTo(drawX + drawWidth, drawY + drawHeight, drawX + drawWidth - r, drawY + drawHeight, r);
                ctx.lineTo(drawX + r, drawY + drawHeight);
                ctx.arcTo(drawX, drawY + drawHeight, drawX, drawY + drawHeight - r, r);
                ctx.lineTo(drawX, drawY + r);
                ctx.arcTo(drawX, drawY, drawX + r, drawY, r);
                ctx.closePath();
                ctx.fill();
            });
        }
    }
    renderSpinnerDots(renderer, cx, cy) {
        const dotCount = 3;
        const dotSpacing = 10;
        const startX = cx - (dotCount - 1) * dotSpacing / 2;
        for (let i = 0; i < dotCount; i++) {
            const dot = this.shimmerDots[i];
            const phase = (this.spinnerAngle * dot.speed + dot.offset * Math.PI * 2) % (Math.PI * 2);
            const alpha = 0.3 + 0.7 * Math.max(0, Math.sin(phase));
            const scale = 0.7 + 0.3 * Math.max(0, Math.sin(phase));
            const dotX = startX + i * dotSpacing;
            const dotY = cy;
            renderer.setAlpha(alpha, constants_1.LAYERS.UI, (ctx) => {
                ctx.fillStyle = this.textColor;
                ctx.beginPath();
                ctx.arc(dotX, dotY, dot.size * scale, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
    renderContent(renderer, cx, cy) {
        let textX = cx;
        let textAlign = 'center';
        if (this.icon) {
            // Icon + text layout
            const iconWidth = this.fontSize + 4;
            const totalWidth = iconWidth + this.text.length * this.fontSize * 0.55;
            const startX = cx - totalWidth / 2;
            // Icon
            renderer.drawText(this.icon, startX + iconWidth / 2, cy, this.disabled ? color_1.DesignTokens.colors.neutral400 : this.textColor, this.fontSize + 2, 'center', 'middle', constants_1.LAYERS.UI);
            textX = startX + iconWidth + totalWidth / 2 - iconWidth / 2;
        }
        // Text with subtle shadow
        renderer.fillTextWithShadow(this.text, textX, cy, this.disabled ? color_1.DesignTokens.colors.neutral400 : this.textColor, 'rgba(0,0,0,0.1)', this.fontSize, 2, 1, textAlign, 'middle', constants_1.LAYERS.UI);
    }
    handleTouchStart(x, y) {
        if (this.disabled || this.loading)
            return false;
        if ((0, math_1.pointInRect)(x, y, this.x, this.y, this.width, this.height)) {
            this.pressed = true;
            this.targetScale = constants_1.ANIMATION.BUTTON_PRESS_SCALE;
            this.bounceProgress = 1;
            return true;
        }
        return false;
    }
    handleTouchEnd(x, y) {
        var _a;
        if (this.pressed) {
            this.pressed = false;
            // Trigger bounce animation
            this.bounceProgress = 0;
            this.bounceStartTime = Date.now();
            this.targetScale = constants_1.ANIMATION.BUTTON_RELEASE_SCALE;
            if (!this.disabled && !this.loading && (0, math_1.pointInRect)(x, y, this.x, this.y, this.width, this.height)) {
                (_a = this.onTap) === null || _a === void 0 ? void 0 : _a.call(this);
                return true;
            }
        }
        return false;
    }
    handleTouchMove(x, y) {
        if (this.pressed && !(0, math_1.pointInRect)(x, y, this.x, this.y, this.width, this.height)) {
            this.pressed = false;
            this.targetScale = 1;
            this.bounceProgress = 1;
        }
    }
    getTouchTarget() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            id: `btn_${this.x}_${this.y}`,
            onTouchStart: (touch) => this.handleTouchStart(touch.x, touch.y),
            onTouchEnd: (touch) => this.handleTouchEnd(touch.x, touch.y),
            onTouchMove: (touch) => this.handleTouchMove(touch.x, touch.y),
        };
    }
    setLoading(loading) {
        this.loading = loading;
        if (loading) {
            this.shimmerOffset = -120;
        }
    }
    setDisabled(disabled) {
        this.disabled = disabled;
    }
    setText(text) {
        this.text = text;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    containsPoint(px, py) {
        return (0, math_1.pointInRect)(px, py, this.x, this.y, this.width, this.height);
    }
}
exports.Button = Button;
//# sourceMappingURL=Button.js.map