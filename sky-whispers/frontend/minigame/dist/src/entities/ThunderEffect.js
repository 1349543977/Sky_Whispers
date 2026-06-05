"use strict";
// ============================================================
// ThunderEffect - Lightning and screen shake effect
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThunderEffect = void 0;
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
class ThunderEffect {
    constructor(screenWidth, screenHeight) {
        this.active = true;
        this.bolts = [];
        this.flashAlpha = 0;
        this.shakeOffset = { x: 0, y: 0 };
        this.nextStrikeTimer = 0;
        this.strikeInterval = 5; // seconds between strikes
        this.onThunderSound = null;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.nextStrikeTimer = (0, math_1.randomRange)(2, this.strikeInterval);
    }
    update(dt) {
        if (!this.active)
            return;
        // Timer for next strike
        this.nextStrikeTimer -= dt;
        if (this.nextStrikeTimer <= 0) {
            this.strike();
            this.nextStrikeTimer = (0, math_1.randomRange)(3, this.strikeInterval);
        }
        // Update bolts
        for (let i = this.bolts.length - 1; i >= 0; i--) {
            const bolt = this.bolts[i];
            bolt.life -= dt;
            bolt.alpha = Math.max(0, bolt.life / 0.3);
            if (bolt.life <= 0) {
                this.bolts.splice(i, 1);
            }
        }
        // Update flash
        if (this.flashAlpha > 0) {
            this.flashAlpha = Math.max(0, this.flashAlpha - dt * 4);
        }
        // Update shake
        if (this.shakeOffset.x !== 0 || this.shakeOffset.y !== 0) {
            this.shakeOffset.x *= 0.9;
            this.shakeOffset.y *= 0.9;
            if (Math.abs(this.shakeOffset.x) < 0.5)
                this.shakeOffset.x = 0;
            if (Math.abs(this.shakeOffset.y) < 0.5)
                this.shakeOffset.y = 0;
        }
    }
    render(renderer) {
        if (!this.active)
            return;
        // Screen flash
        if (this.flashAlpha > 0) {
            renderer.setAlpha(this.flashAlpha * 0.3, constants_1.LAYERS.OVERLAY, (ctx) => {
                ctx.fillStyle = constants_1.COLORS.THUNDER;
                ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
            });
        }
        // Lightning bolts
        for (const bolt of this.bolts) {
            renderer.setAlpha(bolt.alpha, constants_1.LAYERS.EFFECTS, (ctx) => {
                ctx.strokeStyle = constants_1.COLORS.THUNDER;
                ctx.lineWidth = 3;
                ctx.shadowColor = constants_1.COLORS.THUNDER;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
                for (let i = 1; i < bolt.points.length; i++) {
                    ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
                }
                ctx.stroke();
                // Thinner inner line
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
                for (let i = 1; i < bolt.points.length; i++) {
                    ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            });
        }
    }
    strike() {
        var _a;
        const startX = (0, math_1.randomRange)(this.screenWidth * 0.2, this.screenWidth * 0.8);
        const points = this.generateBolt(startX, 0, startX + (0, math_1.randomRange)(-50, 50), this.screenHeight * 0.6);
        this.bolts.push({
            points,
            alpha: 1,
            life: 0.3,
        });
        // Flash
        this.flashAlpha = 1;
        // Shake
        this.shakeOffset.x = (0, math_1.randomRange)(-8, 8);
        this.shakeOffset.y = (0, math_1.randomRange)(-4, 4);
        // Trigger thunder sound
        (_a = this.onThunderSound) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    generateBolt(x1, y1, x2, y2) {
        const points = [{ x: x1, y: y1 }];
        const segments = (0, math_1.randomInt)(5, 10);
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;
        for (let i = 1; i < segments; i++) {
            const offsetX = (0, math_1.randomRange)(-30, 30);
            points.push({
                x: x1 + dx * i + offsetX,
                y: y1 + dy * i,
            });
        }
        points.push({ x: x2, y: y2 });
        return points;
    }
    setOnThunderSound(callback) {
        this.onThunderSound = callback;
    }
    getShakeOffset() {
        return Object.assign({}, this.shakeOffset);
    }
    setActive(active) {
        this.active = active;
        if (!active) {
            this.bolts = [];
            this.flashAlpha = 0;
            this.shakeOffset = { x: 0, y: 0 };
        }
    }
    get isActive() {
        return this.active;
    }
}
exports.ThunderEffect = ThunderEffect;
//# sourceMappingURL=ThunderEffect.js.map