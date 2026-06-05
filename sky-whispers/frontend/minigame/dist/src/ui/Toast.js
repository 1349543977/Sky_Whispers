"use strict";
// ============================================================
// Toast - Auto-dismiss notification with Cloud Whisper aesthetic
// Rounded pill, gradient tint, slide animation, type-based colors
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastManager = exports.Toast = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
/** Color config per toast type */
const TOAST_TYPE_COLORS = {
    success: {
        bg: color_1.DesignTokens.colors.success,
        gradientEnd: color_1.DesignTokens.colors.successLight,
        icon: '✓',
    },
    warning: {
        bg: color_1.DesignTokens.colors.warning,
        gradientEnd: color_1.DesignTokens.colors.warningLight,
        icon: '⚠',
    },
    error: {
        bg: color_1.DesignTokens.colors.danger,
        gradientEnd: color_1.DesignTokens.colors.dangerLight,
        icon: '✕',
    },
    info: {
        bg: color_1.DesignTokens.colors.info,
        gradientEnd: color_1.DesignTokens.colors.infoLight,
        icon: 'ℹ',
    },
};
class Toast {
    constructor(options, screenWidth) {
        var _a, _b, _c, _d, _e, _f;
        this.visible = false;
        this.elapsed = 0;
        this.slideProgress = 0;
        this.screenWidth = 375;
        this.text = options.text;
        this.type = (_a = options.type) !== null && _a !== void 0 ? _a : 'info';
        this.duration = (_b = options.duration) !== null && _b !== void 0 ? _b : constants_1.ANIMATION.TOAST_DURATION;
        this.screenWidth = screenWidth;
        const typeColors = TOAST_TYPE_COLORS[this.type];
        this.bgColor = (_c = options.bgColor) !== null && _c !== void 0 ? _c : typeColors.bg;
        this.gradientEnd = typeColors.gradientEnd;
        this.icon = (_d = options.icon) !== null && _d !== void 0 ? _d : typeColors.icon;
        this.textColor = (_e = options.textColor) !== null && _e !== void 0 ? _e : '#FFFFFF';
        this.fontSize = (_f = options.fontSize) !== null && _f !== void 0 ? _f : color_1.DesignTokens.fontSize.md;
    }
    update(dt) {
        if (!this.visible)
            return;
        this.elapsed += dt * 1000;
        // Slide in animation
        if (this.elapsed < constants_1.ANIMATION.TOAST_SLIDE_DURATION) {
            this.slideProgress = this.elapsed / constants_1.ANIMATION.TOAST_SLIDE_DURATION;
        }
        else if (this.elapsed > this.duration - 300) {
            // Fade out
            this.slideProgress = Math.max(0, (this.duration - this.elapsed) / 300);
        }
        else {
            this.slideProgress = 1;
        }
        if (this.elapsed >= this.duration) {
            this.visible = false;
        }
    }
    render(renderer) {
        if (!this.visible || this.slideProgress <= 0)
            return;
        // Slide down from top with easeOutBack
        const easedProgress = this.slideProgress < 1
            ? 1 - Math.pow(1 - this.slideProgress, 3)
            : this.slideProgress;
        const offsetY = (1 - easedProgress) * -50;
        const toastWidth = Math.min(this.screenWidth - 40, 300);
        const toastHeight = 44;
        const x = (this.screenWidth - toastWidth) / 2;
        const y = 60 + offsetY;
        // Shadow
        renderer.drawSoftShadow(x + toastWidth / 2, y + toastHeight + 2, toastWidth * 0.4, 3, 6, 'rgba(26, 39, 56, 0.1)', constants_1.LAYERS.OVERLAY - 1);
        // Background with gradient tint
        renderer.fillGradientRoundRect(x, y, toastWidth, toastHeight, toastHeight / 2, this.bgColor, this.gradientEnd, true, constants_1.LAYERS.OVERLAY);
        // Subtle white overlay for glass effect
        renderer.setAlpha(0.1, constants_1.LAYERS.OVERLAY, (ctx) => {
            ctx.fillStyle = '#FFFFFF';
            const r = toastHeight / 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + toastWidth - r, y);
            ctx.arcTo(x + toastWidth, y, x + toastWidth, y + r, r);
            ctx.lineTo(x + toastWidth, y + toastHeight - r);
            ctx.arcTo(x + toastWidth, y + toastHeight, x + toastWidth - r, y + toastHeight, r);
            ctx.lineTo(x + r, y + toastHeight);
            ctx.arcTo(x, y + toastHeight, x, y + toastHeight - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
            ctx.fill();
        });
        // Icon circle
        const iconCx = x + 22;
        const iconCy = y + toastHeight / 2;
        renderer.setAlpha(0.25, constants_1.LAYERS.OVERLAY, (ctx) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(iconCx, iconCy, 10, 0, Math.PI * 2);
            ctx.fill();
        });
        renderer.drawText(this.icon, iconCx, iconCy, '#FFFFFF', this.fontSize - 2, 'center', 'middle', constants_1.LAYERS.OVERLAY);
        // Text
        renderer.fillTextWithShadow(this.text, x + 40, y + toastHeight / 2, this.textColor, 'rgba(0,0,0,0.1)', this.fontSize, 2, 1, 'left', 'middle', constants_1.LAYERS.OVERLAY);
    }
    show() {
        this.visible = true;
        this.elapsed = 0;
        this.slideProgress = 0;
    }
    hide() {
        this.visible = false;
    }
    isVisible() {
        return this.visible;
    }
}
exports.Toast = Toast;
// Toast Manager - manages multiple toasts
class ToastManager {
    constructor(screenWidth) {
        this.toasts = [];
        this.screenWidth = screenWidth;
    }
    show(options) {
        const toast = new Toast(options, this.screenWidth);
        toast.show();
        this.toasts.push(toast);
        // Limit to 3 toasts
        if (this.toasts.length > 3) {
            this.toasts[0].hide();
            this.toasts.shift();
        }
    }
    update(dt) {
        for (let i = this.toasts.length - 1; i >= 0; i--) {
            this.toasts[i].update(dt);
            if (!this.toasts[i].isVisible()) {
                this.toasts.splice(i, 1);
            }
        }
    }
    render(renderer) {
        for (const toast of this.toasts) {
            toast.render(renderer);
        }
    }
}
exports.ToastManager = ToastManager;
//# sourceMappingURL=Toast.js.map