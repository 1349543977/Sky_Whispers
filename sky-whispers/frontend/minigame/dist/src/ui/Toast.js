"use strict";
// ============================================================
// Toast - Auto-dismiss notification
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastManager = exports.Toast = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
class Toast {
    constructor(options, screenWidth) {
        var _a, _b, _c, _d, _e;
        this.visible = false;
        this.elapsed = 0;
        this.slideProgress = 0;
        this.screenWidth = 375;
        this.text = options.text;
        this.icon = (_a = options.icon) !== null && _a !== void 0 ? _a : '';
        this.duration = (_b = options.duration) !== null && _b !== void 0 ? _b : 2000;
        this.bgColor = (_c = options.bgColor) !== null && _c !== void 0 ? _c : 'rgba(0,0,0,0.75)';
        this.textColor = (_d = options.textColor) !== null && _d !== void 0 ? _d : '#FFFFFF';
        this.fontSize = (_e = options.fontSize) !== null && _e !== void 0 ? _e : color_1.DesignTokens.fontSize.md;
        this.screenWidth = screenWidth;
    }
    update(dt) {
        if (!this.visible)
            return;
        this.elapsed += dt * 1000;
        // Slide in
        if (this.elapsed < 200) {
            this.slideProgress = this.elapsed / 200;
        }
        else if (this.elapsed > this.duration - 300) {
            // Slide out
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
        const offsetY = (1 - this.slideProgress) * -40;
        const toastWidth = Math.min(this.screenWidth - 40, 300);
        const toastHeight = 44;
        const x = (this.screenWidth - toastWidth) / 2;
        const y = 60 + offsetY;
        // Background
        renderer.fillRoundRect(x, y, toastWidth, toastHeight, color_1.DesignTokens.borderRadius.lg, this.bgColor, constants_1.LAYERS.OVERLAY);
        // Icon
        let textX = x + toastWidth / 2;
        if (this.icon) {
            renderer.drawText(this.icon, x + 16, y + toastHeight / 2, this.textColor, this.fontSize + 2, 'left', 'middle', constants_1.LAYERS.OVERLAY);
            textX = x + 40;
        }
        // Text
        renderer.drawText(this.text, textX, y + toastHeight / 2, this.textColor, this.fontSize, 'center', 'middle', constants_1.LAYERS.OVERLAY);
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