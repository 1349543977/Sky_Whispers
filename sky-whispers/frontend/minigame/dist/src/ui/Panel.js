"use strict";
// ============================================================
// Panel - Info panel with slide-in animation
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Panel = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const Button_1 = require("./Button");
class Panel {
    constructor(options) {
        var _a, _b, _c, _d;
        this.visible = false;
        this.slideProgress = 0;
        this.targetSlideProgress = 0;
        this.closeButton = null;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.title = options.title;
        this.titleColor = (_a = options.titleColor) !== null && _a !== void 0 ? _a : color_1.DesignTokens.colors.text;
        this.bgColor = (_b = options.bgColor) !== null && _b !== void 0 ? _b : color_1.DesignTokens.colors.surface;
        this.borderRadius = (_c = options.borderRadius) !== null && _c !== void 0 ? _c : color_1.DesignTokens.borderRadius.lg;
        this.showClose = (_d = options.showClose) !== null && _d !== void 0 ? _d : true;
        this.onClose = options.onClose;
        if (this.showClose) {
            this.closeButton = new Button_1.Button({
                x: this.x + this.width - 36,
                y: this.y + 8,
                width: 28,
                height: 28,
                text: '✕',
                fontSize: 16,
                bgColor: 'transparent',
                textColor: color_1.DesignTokens.colors.textSecondary,
                borderRadius: 14,
                onTap: () => this.hide(),
            });
        }
    }
    update(dt) {
        this.slideProgress += (this.targetSlideProgress - this.slideProgress) * 0.15;
        if (this.closeButton) {
            this.closeButton.update(dt);
        }
    }
    render(renderer) {
        if (!this.visible && this.slideProgress < 0.01)
            return;
        const offsetY = (1 - this.slideProgress) * 50;
        // Overlay backdrop
        renderer.setAlpha(this.slideProgress * 0.4, constants_1.LAYERS.OVERLAY, (ctx) => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, renderer.width, renderer.height);
        });
        // Panel body
        renderer.fillRoundRect(this.x, this.y + offsetY, this.width, this.height, this.borderRadius, this.bgColor, constants_1.LAYERS.UI);
        // Title bar
        renderer.fillRoundRect(this.x, this.y + offsetY, this.width, 44, this.borderRadius, color_1.DesignTokens.colors.primary, constants_1.LAYERS.UI);
        // Cover bottom corners of title bar
        renderer.fillRect(this.x, this.y + offsetY + 30, this.width, 14, color_1.DesignTokens.colors.primary, constants_1.LAYERS.UI);
        // Title text
        renderer.drawText(this.title, this.x + 16, this.y + offsetY + 14, '#FFFFFF', color_1.DesignTokens.fontSize.lg, 'left', 'top', constants_1.LAYERS.UI);
        // Close button
        if (this.closeButton) {
            this.closeButton.setPosition(this.x + this.width - 36, this.y + offsetY + 8);
            this.closeButton.render(renderer);
        }
    }
    show() {
        this.visible = true;
        this.targetSlideProgress = 1;
    }
    hide() {
        this.targetSlideProgress = 0;
        setTimeout(() => {
            var _a;
            this.visible = false;
            (_a = this.onClose) === null || _a === void 0 ? void 0 : _a.call(this);
        }, 300);
    }
    isVisible() {
        return this.visible;
    }
    getCloseButton() {
        return this.closeButton;
    }
    getContentArea() {
        return {
            x: this.x + 12,
            y: this.y + 52,
            width: this.width - 24,
            height: this.height - 64,
        };
    }
}
exports.Panel = Panel;
//# sourceMappingURL=Panel.js.map