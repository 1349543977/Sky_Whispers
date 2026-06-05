"use strict";
// ============================================================
// ProgressBar - Animated progress bar with gradient
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const math_1 = require("../utils/math");
class ProgressBar {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.min = (_a = options.min) !== null && _a !== void 0 ? _a : 0;
        this.max = (_b = options.max) !== null && _b !== void 0 ? _b : 100;
        this.value = options.value;
        this.displayValue = options.value;
        this.fillColor = (_c = options.fillColor) !== null && _c !== void 0 ? _c : color_1.DesignTokens.colors.primary;
        this.bgColor = (_d = options.bgColor) !== null && _d !== void 0 ? _d : 'rgba(0,0,0,0.1)';
        this.borderColor = (_e = options.borderColor) !== null && _e !== void 0 ? _e : 'transparent';
        this.borderRadius = (_f = options.borderRadius) !== null && _f !== void 0 ? _f : color_1.DesignTokens.borderRadius.sm;
        this.showText = (_g = options.showText) !== null && _g !== void 0 ? _g : false;
        this.textColor = (_h = options.textColor) !== null && _h !== void 0 ? _h : color_1.DesignTokens.colors.text;
        this.fontSize = (_j = options.fontSize) !== null && _j !== void 0 ? _j : color_1.DesignTokens.fontSize.xs;
    }
    update(dt) {
        // Smooth animation
        this.displayValue = (0, math_1.lerp)(this.displayValue, this.value, 0.1);
    }
    render(renderer) {
        const progress = (0, math_1.clamp)((this.displayValue - this.min) / (this.max - this.min), 0, 1);
        // Background
        renderer.fillRoundRect(this.x, this.y, this.width, this.height, this.borderRadius, this.bgColor, constants_1.LAYERS.UI);
        // Fill
        const fillWidth = this.width * progress;
        if (fillWidth > 0) {
            renderer.fillRoundRect(this.x, this.y, Math.max(fillWidth, this.borderRadius * 2), this.height, this.borderRadius, this.fillColor, constants_1.LAYERS.UI);
        }
        // Border
        if (this.borderColor !== 'transparent') {
            renderer.strokeRoundRect(this.x, this.y, this.width, this.height, this.borderRadius, this.borderColor, 1, constants_1.LAYERS.UI);
        }
        // Text overlay
        if (this.showText) {
            const percent = Math.round(progress * 100);
            renderer.drawText(`${percent}%`, this.x + this.width / 2, this.y + this.height / 2, this.textColor, this.fontSize, 'center', 'middle', constants_1.LAYERS.UI);
        }
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