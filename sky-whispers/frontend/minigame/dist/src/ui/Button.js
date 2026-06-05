"use strict";
// ============================================================
// Button - Touch button with feedback states
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const math_1 = require("../utils/math");
class Button {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.pressed = false;
        this.scale = 1;
        this.targetScale = 1;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.text = options.text;
        this.fontSize = (_a = options.fontSize) !== null && _a !== void 0 ? _a : color_1.DesignTokens.fontSize.md;
        this.textColor = (_b = options.textColor) !== null && _b !== void 0 ? _b : '#FFFFFF';
        this.bgColor = (_c = options.bgColor) !== null && _c !== void 0 ? _c : color_1.DesignTokens.colors.primary;
        this.pressedBgColor = (_d = options.pressedBgColor) !== null && _d !== void 0 ? _d : color_1.DesignTokens.colors.primaryDark;
        this.disabledBgColor = (_e = options.disabledBgColor) !== null && _e !== void 0 ? _e : color_1.DesignTokens.colors.textLight;
        this.borderRadius = (_f = options.borderRadius) !== null && _f !== void 0 ? _f : color_1.DesignTokens.borderRadius.md;
        this.disabled = (_g = options.disabled) !== null && _g !== void 0 ? _g : false;
        this.loading = (_h = options.loading) !== null && _h !== void 0 ? _h : false;
        this.onTap = options.onTap;
    }
    update(dt) {
        // Smooth scale transition
        this.scale += (this.targetScale - this.scale) * 0.2;
    }
    render(renderer) {
        const currentBgColor = this.disabled
            ? this.disabledBgColor
            : this.pressed
                ? this.pressedBgColor
                : this.bgColor;
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const drawWidth = this.width * this.scale;
        const drawHeight = this.height * this.scale;
        const drawX = cx - drawWidth / 2;
        const drawY = cy - drawHeight / 2;
        // Button background
        renderer.fillRoundRect(drawX, drawY, drawWidth, drawHeight, this.borderRadius, currentBgColor, constants_1.LAYERS.UI);
        if (this.loading) {
            // Loading spinner
            this.renderSpinner(renderer, cx, cy);
        }
        else {
            // Button text
            renderer.drawText(this.text, cx, cy, this.disabled ? '#B0B0B0' : this.textColor, this.fontSize, 'center', 'middle', constants_1.LAYERS.UI);
        }
    }
    renderSpinner(renderer, cx, cy) {
        const radius = 6;
        const time = Date.now() * 0.005;
        renderer.setAlpha(1, constants_1.LAYERS.UI, (ctx) => {
            ctx.strokeStyle = this.textColor;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(cx, cy, radius, time, time + Math.PI * 1.5);
            ctx.stroke();
        });
    }
    handleTouchStart(x, y) {
        if (this.disabled || this.loading)
            return false;
        if ((0, math_1.pointInRect)(x, y, this.x, this.y, this.width, this.height)) {
            this.pressed = true;
            this.targetScale = 0.95;
            return true;
        }
        return false;
    }
    handleTouchEnd(x, y) {
        var _a;
        if (this.pressed) {
            this.pressed = false;
            this.targetScale = 1;
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