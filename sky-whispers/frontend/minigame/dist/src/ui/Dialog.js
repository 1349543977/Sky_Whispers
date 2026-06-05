"use strict";
// ============================================================
// Dialog - Modal dialog with fade animation
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dialog = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const Button_1 = require("./Button");
class Dialog {
    constructor(options) {
        var _a, _b;
        this.visible = false;
        this.fadeProgress = 0;
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
            onTap: () => this.confirm(),
        });
        if (this.cancelText) {
            this.cancelButton = new Button_1.Button({
                x: 0,
                y: 0,
                width: 100,
                height: 36,
                text: this.cancelText,
                bgColor: color_1.DesignTokens.colors.textLight,
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
        // Overlay
        renderer.setAlpha(this.fadeProgress * 0.5, constants_1.LAYERS.OVERLAY, (ctx) => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, screenW, screenH);
        });
        // Dialog body
        renderer.setAlpha(this.fadeProgress, constants_1.LAYERS.UI, (ctx) => {
            ctx.fillStyle = color_1.DesignTokens.colors.surface;
        });
        renderer.fillRoundRect(dx, dy, this.dialogWidth, this.dialogHeight, color_1.DesignTokens.borderRadius.lg, color_1.DesignTokens.colors.surface, constants_1.LAYERS.UI);
        // Title
        renderer.drawText(this.title, dx + this.dialogWidth / 2, dy + 20, color_1.DesignTokens.colors.text, color_1.DesignTokens.fontSize.lg, 'center', 'top', constants_1.LAYERS.UI);
        // Content
        renderer.drawText(this.content, dx + 20, dy + 55, color_1.DesignTokens.colors.textSecondary, color_1.DesignTokens.fontSize.md, 'left', 'top', constants_1.LAYERS.UI);
        // Buttons
        const buttonY = dy + this.dialogHeight - 50;
        if (this.cancelButton) {
            this.cancelButton.setPosition(dx + 20, buttonY);
            this.cancelButton.render(renderer);
        }
        this.confirmButton.setPosition(dx + this.dialogWidth - 120, buttonY);
        this.confirmButton.render(renderer);
    }
    show() {
        this.visible = true;
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