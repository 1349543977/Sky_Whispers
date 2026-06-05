"use strict";
// ============================================================
// Dialog - Modal dialog with Cloud Whisper aesthetic
// Glass-morphism, gradient confirm button, scale animation
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dialog = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const Button_1 = require("./Button");
const math_1 = require("../utils/math");
class Dialog {
    constructor(options) {
        var _a, _b;
        this.visible = false;
        this.fadeProgress = 0;
        this.animStartTime = 0;
        this.cancelButton = null;
        this.dialogWidth = 280;
        this.dialogHeight = 180;
        this.title = options.title;
        this.content = options.content;
        this.confirmText = (_a = options.confirmText) !== null && _a !== void 0 ? _a : '确定';
        this.cancelText = (_b = options.cancelText) !== null && _b !== void 0 ? _b : '取消';
        this.onConfirm = options.onConfirm;
        this.onCancel = options.onCancel;
        this.confirmButton = new Button_1.Button({
            x: 0,
            y: 0,
            width: 100,
            height: 36,
            text: this.confirmText,
            bgColor: color_1.DesignTokens.colors.primary,
            gradientEnd: color_1.DesignTokens.colors.primaryLight,
            borderRadius: color_1.DesignTokens.borderRadius.lg,
            onTap: () => this.confirm(),
        });
        if (this.cancelText) {
            this.cancelButton = new Button_1.Button({
                x: 0,
                y: 0,
                width: 100,
                height: 36,
                text: this.cancelText,
                bgColor: 'transparent',
                textColor: color_1.DesignTokens.colors.textSecondary,
                borderRadius: color_1.DesignTokens.borderRadius.lg,
                onTap: () => this.cancel(),
            });
        }
    }
    update(dt) {
        var _a;
        if (this.visible) {
            this.fadeProgress = Math.min(this.fadeProgress + dt * 5, 1);
        }
        else {
            this.fadeProgress = Math.max(this.fadeProgress - dt * 5, 0);
        }
        this.confirmButton.update(dt);
        (_a = this.cancelButton) === null || _a === void 0 ? void 0 : _a.update(dt);
    }
    render(renderer) {
        if (this.fadeProgress <= 0)
            return;
        const screenW = renderer.width;
        const screenH = renderer.height;
        const dx = (screenW - this.dialogWidth) / 2;
        const dy = (screenH - this.dialogHeight) / 2;
        // Eased animation progress
        const easedProgress = (0, math_1.easeOutBack)(Math.min(1, this.fadeProgress));
        const scaleValue = 0.9 + 0.1 * easedProgress;
        // Backdrop dimming overlay
        renderer.setAlpha(this.fadeProgress * 0.5, constants_1.LAYERS.OVERLAY, (ctx) => {
            ctx.fillStyle = '#1A2738';
            ctx.fillRect(0, 0, screenW, screenH);
        });
        // Dialog shadow
        renderer.drawSoftShadow(dx + this.dialogWidth / 2, dy + this.dialogHeight / 2 + 6, this.dialogWidth * 0.45, this.dialogHeight * 0.4, 16, 'rgba(26, 39, 56, 0.15)', constants_1.LAYERS.UI - 1);
        // Scale transform for dialog
        const cx = dx + this.dialogWidth / 2;
        const cy = dy + this.dialogHeight / 2;
        const scaledW = this.dialogWidth * scaleValue;
        const scaledH = this.dialogHeight * scaleValue;
        const scaledX = cx - scaledW / 2;
        const scaledY = cy - scaledH / 2;
        // Glass-morphism dialog body
        renderer.fillRoundRect(scaledX, scaledY, scaledW, scaledH, color_1.DesignTokens.borderRadius.xl, 'rgba(255,255,255,0.92)', constants_1.LAYERS.UI);
        // Subtle border for glass effect
        renderer.setAlpha(0.15, constants_1.LAYERS.UI, (ctx) => {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            const r = color_1.DesignTokens.borderRadius.xl;
            ctx.beginPath();
            ctx.moveTo(scaledX + r, scaledY);
            ctx.lineTo(scaledX + scaledW - r, scaledY);
            ctx.arcTo(scaledX + scaledW, scaledY, scaledX + scaledW, scaledY + r, r);
            ctx.lineTo(scaledX + scaledW, scaledY + scaledH - r);
            ctx.arcTo(scaledX + scaledW, scaledY + scaledH, scaledX + scaledW - r, scaledY + scaledH, r);
            ctx.lineTo(scaledX + r, scaledY + scaledH);
            ctx.arcTo(scaledX, scaledY + scaledH, scaledX, scaledY + scaledH - r, r);
            ctx.lineTo(scaledX, scaledY + r);
            ctx.arcTo(scaledX, scaledY, scaledX + r, scaledY, r);
            ctx.closePath();
            ctx.stroke();
        });
        // Gradient accent line at top
        renderer.fillGradientRoundRect(scaledX + 20, scaledY + 6, scaledW - 40, 3, 1.5, color_1.DesignTokens.colors.primary, color_1.DesignTokens.colors.accent, false, constants_1.LAYERS.UI);
        // Title with accent color
        renderer.fillTextWithShadow(this.title, scaledX + scaledW / 2, scaledY + 24, color_1.DesignTokens.colors.textPrimary, 'rgba(0,0,0,0.05)', color_1.DesignTokens.fontSize.lg, 2, 1, 'center', 'top', constants_1.LAYERS.UI);
        // Content text
        renderer.drawText(this.content, scaledX + 20, scaledY + 55, color_1.DesignTokens.colors.textSecondary, color_1.DesignTokens.fontSize.md, 'left', 'top', constants_1.LAYERS.UI);
        // Buttons
        const buttonY = scaledY + scaledH - 50;
        // Cancel button (outline style)
        if (this.cancelButton) {
            this.cancelButton.setPosition(scaledX + 16, buttonY);
            // Draw outline for cancel button
            renderer.strokeRoundRect(scaledX + 16, buttonY, 100, 36, color_1.DesignTokens.borderRadius.lg, color_1.DesignTokens.colors.neutral300, 1.5, constants_1.LAYERS.UI);
            this.cancelButton.render(renderer);
        }
        // Confirm button (filled gradient)
        this.confirmButton.setPosition(scaledX + scaledW - 116, buttonY);
        this.confirmButton.render(renderer);
    }
    show() {
        this.visible = true;
        this.fadeProgress = 0;
        this.animStartTime = Date.now();
    }
    hide() {
        this.visible = false;
    }
    confirm() {
        var _a;
        this.hide();
        (_a = this.onConfirm) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    cancel() {
        var _a;
        this.hide();
        (_a = this.onCancel) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    isVisible() {
        return this.visible || this.fadeProgress > 0;
    }
    getButtons() {
        const buttons = [this.confirmButton];
        if (this.cancelButton)
            buttons.push(this.cancelButton);
        return buttons;
    }
}
exports.Dialog = Dialog;
//# sourceMappingURL=Dialog.js.map