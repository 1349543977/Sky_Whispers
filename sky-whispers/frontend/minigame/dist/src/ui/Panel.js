"use strict";
// ============================================================
// Panel - Glass-morphism panel with Cloud Whisper aesthetic
// Semi-transparent background, slide-in animation, accent line
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Panel = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const Button_1 = require("./Button");
const math_1 = require("../utils/math");
class Panel {
    constructor(options) {
        var _a, _b, _c, _d;
        this.visible = false;
        this.slideProgress = 0;
        this.slideStartTime = 0;
        this.isShowing = false;
        this.closeButton = null;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.title = options.title;
        this.titleColor = (_a = options.titleColor) !== null && _a !== void 0 ? _a : color_1.DesignTokens.colors.textPrimary;
        this.bgColor = (_b = options.bgColor) !== null && _b !== void 0 ? _b : 'rgba(255,255,255,0.85)';
        this.borderRadius = (_c = options.borderRadius) !== null && _c !== void 0 ? _c : color_1.DesignTokens.borderRadius.xl;
        this.showClose = (_d = options.showClose) !== null && _d !== void 0 ? _d : true;
        this.onClose = options.onClose;
        if (this.showClose) {
            this.closeButton = new Button_1.Button({
                x: this.x + this.width - 40,
                y: this.y + 10,
                width: 28,
                height: 28,
                text: '✕',
                fontSize: 14,
                bgColor: 'rgba(0,0,0,0.05)',
                textColor: color_1.DesignTokens.colors.textTertiary,
                borderRadius: 14,
                onTap: () => this.hide(),
            });
        }
    }
    update(dt) {
        // Animate slide with easeOutBack
        if (this.isShowing) {
            const elapsed = (Date.now() - this.slideStartTime) / constants_1.ANIMATION.PANEL_SLIDE_DURATION;
            if (elapsed >= 1) {
                this.slideProgress = 1;
            }
            else {
                this.slideProgress = (0, math_1.easeOutBack)(Math.min(1, elapsed));
            }
        }
        else if (!this.visible) {
            this.slideProgress *= 0.85;
            if (this.slideProgress < 0.005) {
                this.slideProgress = 0;
            }
        }
        if (this.closeButton) {
            this.closeButton.update(dt);
        }
    }
    render(renderer) {
        if (!this.visible && this.slideProgress < 0.01)
            return;
        const offsetY = (1 - this.slideProgress) * 80;
        // Overlay backdrop with dimming
        const backdropAlpha = this.slideProgress * 0.4;
        renderer.setAlpha(backdropAlpha, constants_1.LAYERS.OVERLAY, (ctx) => {
            ctx.fillStyle = '#1A2738';
            ctx.fillRect(0, 0, renderer.width, renderer.height);
        });
        const panelY = this.y + offsetY;
        // Panel shadow
        renderer.drawSoftShadow(this.x + this.width / 2, panelY + this.height / 2 + 8, this.width * 0.48, this.height * 0.45, 16, 'rgba(26, 39, 56, 0.12)', constants_1.LAYERS.UI - 1);
        // Glass-morphism panel body
        renderer.fillRoundRect(this.x, panelY, this.width, this.height, this.borderRadius, this.bgColor, constants_1.LAYERS.UI);
        // Subtle border for glass effect
        renderer.setAlpha(0.15, constants_1.LAYERS.UI, (ctx) => {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            const r = Math.min(this.borderRadius, this.width / 2, this.height / 2);
            ctx.beginPath();
            ctx.moveTo(this.x + r, panelY);
            ctx.lineTo(this.x + this.width - r, panelY);
            ctx.arcTo(this.x + this.width, panelY, this.x + this.width, panelY + r, r);
            ctx.lineTo(this.x + this.width, panelY + this.height - r);
            ctx.arcTo(this.x + this.width, panelY + this.height, this.x + this.width - r, panelY + this.height, r);
            ctx.lineTo(this.x + r, panelY + this.height);
            ctx.arcTo(this.x, panelY + this.height, this.x, panelY + this.height - r, r);
            ctx.lineTo(this.x, panelY + r);
            ctx.arcTo(this.x, panelY, this.x + r, panelY, r);
            ctx.closePath();
            ctx.stroke();
        });
        // Gradient accent line at top
        renderer.fillGradientRoundRect(this.x + 16, panelY + 4, this.width - 32, 3, 1.5, color_1.DesignTokens.colors.primary, color_1.DesignTokens.colors.accent, false, constants_1.LAYERS.UI);
        // Title text
        renderer.fillTextWithShadow(this.title, this.x + 20, panelY + 22, this.titleColor, 'rgba(0,0,0,0.05)', color_1.DesignTokens.fontSize.lg, 2, 1, 'left', 'top', constants_1.LAYERS.UI);
        // Close button
        if (this.closeButton) {
            this.closeButton.setPosition(this.x + this.width - 40, panelY + 10);
            this.closeButton.render(renderer);
        }
    }
    show() {
        this.visible = true;
        this.isShowing = true;
        this.slideStartTime = Date.now();
        this.slideProgress = 0;
    }
    hide() {
        this.isShowing = false;
        setTimeout(() => {
            var _a;
            this.visible = false;
            (_a = this.onClose) === null || _a === void 0 ? void 0 : _a.call(this);
        }, constants_1.ANIMATION.PANEL_SLIDE_DURATION);
    }
    isVisible() {
        return this.visible;
    }
    getCloseButton() {
        return this.closeButton;
    }
    getContentArea() {
        return {
            x: this.x + color_1.DesignTokens.spacing.lg,
            y: this.y + 52,
            width: this.width - color_1.DesignTokens.spacing.lg * 2,
            height: this.height - 64,
        };
    }
}
exports.Panel = Panel;
//# sourceMappingURL=Panel.js.map