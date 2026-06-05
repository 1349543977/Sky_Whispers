"use strict";
// ============================================================
// FogEffect - Fog overlay with drifting layers
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.FogEffect = void 0;
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
class FogEffect {
    constructor(screenWidth, screenHeight) {
        this.layers = [];
        this.active = true;
        this.globalAlpha = 0.4;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.initLayers();
    }
    initLayers() {
        this.layers = [];
        for (let i = 0; i < 5; i++) {
            this.layers.push({
                x: (0, math_1.randomRange)(-this.screenWidth * 0.3, this.screenWidth),
                y: (0, math_1.randomRange)(this.screenHeight * 0.2, this.screenHeight * 0.8),
                width: (0, math_1.randomRange)(this.screenWidth * 0.6, this.screenWidth * 1.2),
                height: (0, math_1.randomRange)(60, 120),
                speed: (0, math_1.randomRange)(5, 15) * (i % 2 === 0 ? 1 : -1),
                alpha: (0, math_1.randomRange)(0.15, 0.35),
            });
        }
    }
    update(dt) {
        if (!this.active)
            return;
        for (const layer of this.layers) {
            layer.x += layer.speed * dt;
            // Wrap around
            if (layer.speed > 0 && layer.x > this.screenWidth) {
                layer.x = -layer.width;
            }
            else if (layer.speed < 0 && layer.x + layer.width < 0) {
                layer.x = this.screenWidth;
            }
        }
    }
    render(renderer) {
        if (!this.active)
            return;
        for (const layer of this.layers) {
            renderer.setAlpha(layer.alpha * this.globalAlpha, constants_1.LAYERS.EFFECTS, (ctx) => {
                ctx.fillStyle = constants_1.COLORS.FOG;
                // Draw fog as a soft ellipse
                ctx.beginPath();
                ctx.ellipse(layer.x + layer.width / 2, layer.y + layer.height / 2, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
    setGlobalAlpha(alpha) {
        this.globalAlpha = alpha;
    }
    setActive(active) {
        this.active = active;
        if (active && this.layers.length === 0) {
            this.initLayers();
        }
    }
    get isActive() {
        return this.active;
    }
}
exports.FogEffect = FogEffect;
//# sourceMappingURL=FogEffect.js.map