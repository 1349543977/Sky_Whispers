"use strict";
// ============================================================
// ThunderEffect - Branching lightning with warm glow & gentle shake
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThunderEffect = void 0;
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
class ThunderEffect {
    constructor(screenWidth, screenHeight) {
        this.active = true;
        this.branches = [];
        this.flashAlpha = 0;
        this.shakeOffset = { x: 0, y: 0 };
        this.nextStrikeTimer = 0;
        this.onThunderSound = null;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.nextStrikeTimer = (0, math_1.randomRange)(ThunderEffect.STRIKE_INTERVAL_MIN, ThunderEffect.STRIKE_INTERVAL_MAX);
    }
    update(dt) {
        if (!this.active)
            return;
        // Timer for next strike
        this.nextStrikeTimer -= dt;
        if (this.nextStrikeTimer <= 0) {
            this.strike();
            this.nextStrikeTimer = (0, math_1.randomRange)(ThunderEffect.STRIKE_INTERVAL_MIN, ThunderEffect.STRIKE_INTERVAL_MAX);
        }
        // Update branches
        for (let i = this.branches.length - 1; i >= 0; i--) {
            const branch = this.branches[i];
            branch.life -= dt;
            branch.alpha = Math.max(0, branch.life / branch.maxLife);
            if (branch.life <= 0) {
                this.branches.splice(i, 1);
            }
        }
        // Update flash
        if (this.flashAlpha > 0) {
            this.flashAlpha = Math.max(0, this.flashAlpha - dt / ThunderEffect.FLASH_DURATION);
        }
        // Update shake with dampening
        if (this.shakeOffset.x !== 0 || this.shakeOffset.y !== 0) {
            this.shakeOffset.x *= ThunderEffect.SHAKE_DAMPING;
            this.shakeOffset.y *= ThunderEffect.SHAKE_DAMPING;
            if (Math.abs(this.shakeOffset.x) < ThunderEffect.SHAKE_THRESHOLD)
                this.shakeOffset.x = 0;
            if (Math.abs(this.shakeOffset.y) < ThunderEffect.SHAKE_THRESHOLD)
                this.shakeOffset.y = 0;
        }
    }
    render(renderer) {
        if (!this.active)
            return;
        // Lightning glow (behind the bolt)
        for (const branch of this.branches) {
            if (branch.alpha <= 0)
                continue;
            const midPoint = branch.points[Math.floor(branch.points.length / 2)];
            renderer.drawRadialGlow(midPoint.x, midPoint.y, 0, ThunderEffect.GLOW_RADIUS * (branch.isMain ? 1 : 0.5), `rgba(242, 197, 124, ${branch.alpha * 0.15})`, `rgba(242, 197, 124, 0)`, constants_1.LAYERS.EFFECTS);
        }
        // Lightning branches
        for (const branch of this.branches) {
            if (branch.alpha <= 0 || branch.points.length < 2)
                continue;
            renderer.setAlpha(branch.alpha, constants_1.LAYERS.EFFECTS, (ctx) => {
                // Outer glow line
                ctx.strokeStyle = constants_1.COLORS.THUNDER_BOLT;
                ctx.lineWidth = branch.lineWidth + 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.shadowColor = constants_1.COLORS.THUNDER_BOLT;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.moveTo(branch.points[0].x, branch.points[0].y);
                for (let i = 1; i < branch.points.length; i++) {
                    ctx.lineTo(branch.points[i].x, branch.points[i].y);
                }
                ctx.stroke();
                // Inner bright line
                ctx.shadowBlur = 0;
                ctx.strokeStyle = constants_1.COLORS.THUNDER_FLASH;
                ctx.lineWidth = branch.lineWidth;
                ctx.beginPath();
                ctx.moveTo(branch.points[0].x, branch.points[0].y);
                for (let i = 1; i < branch.points.length; i++) {
                    ctx.lineTo(branch.points[i].x, branch.points[i].y);
                }
                ctx.stroke();
            });
        }
        // Soft warm flash overlay
        if (this.flashAlpha > 0) {
            renderer.setAlpha(this.flashAlpha, constants_1.LAYERS.OVERLAY, (ctx) => {
                ctx.fillStyle = '#FFFBF0';
                ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
            });
        }
    }
    strike() {
        var _a;
        const startX = (0, math_1.randomRange)(this.screenWidth * 0.2, this.screenWidth * 0.8);
        const endX = startX + (0, math_1.randomRange)(-60, 60);
        const endY = this.screenHeight * (0, math_1.randomRange)(0.5, 0.7);
        // Main bolt
        const mainPoints = this.generateBolt(startX, 0, endX, endY, (0, math_1.randomInt)(6, 12));
        this.branches.push({
            points: mainPoints,
            alpha: 1,
            life: ThunderEffect.BOLT_LIFE,
            maxLife: ThunderEffect.BOLT_LIFE,
            lineWidth: 2.5,
            isMain: true,
        });
        // Branches off the main bolt
        const branchCount = (0, math_1.randomInt)(ThunderEffect.BRANCH_COUNT_MIN, ThunderEffect.BRANCH_COUNT_MAX);
        for (let b = 0; b < branchCount; b++) {
            const branchStartIdx = (0, math_1.randomInt)(2, mainPoints.length - 2);
            const origin = mainPoints[branchStartIdx];
            const branchEndX = origin.x + (0, math_1.randomRange)(-80, 80);
            const branchEndY = origin.y + (0, math_1.randomRange)(30, 80);
            const branchPoints = this.generateBolt(origin.x, origin.y, branchEndX, branchEndY, (0, math_1.randomInt)(3, 6));
            this.branches.push({
                points: branchPoints,
                alpha: 0.7,
                life: ThunderEffect.BOLT_LIFE * 0.8,
                maxLife: ThunderEffect.BOLT_LIFE * 0.8,
                lineWidth: 1.2,
                isMain: false,
            });
        }
        // Soft flash
        this.flashAlpha = ThunderEffect.FLASH_MAX_ALPHA;
        // Gentle shake
        this.shakeOffset.x = (0, math_1.randomRange)(-ThunderEffect.SHAKE_INTENSITY, ThunderEffect.SHAKE_INTENSITY);
        this.shakeOffset.y = (0, math_1.randomRange)(-ThunderEffect.SHAKE_INTENSITY, ThunderEffect.SHAKE_INTENSITY);
        // Trigger thunder sound event
        (_a = this.onThunderSound) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    generateBolt(x1, y1, x2, y2, segments) {
        const points = [{ x: x1, y: y1 }];
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;
        for (let i = 1; i < segments; i++) {
            const jitterScale = 1 - (i / segments) * 0.5; // Less jitter near end
            const offsetX = (0, math_1.randomRange)(-25, 25) * jitterScale;
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
            this.branches = [];
            this.flashAlpha = 0;
            this.shakeOffset = { x: 0, y: 0 };
        }
    }
    get isActive() {
        return this.active;
    }
}
exports.ThunderEffect = ThunderEffect;
ThunderEffect.STRIKE_INTERVAL_MIN = 3;
ThunderEffect.STRIKE_INTERVAL_MAX = 8;
ThunderEffect.BOLT_LIFE = 0.25;
ThunderEffect.FLASH_DURATION = 0.2;
ThunderEffect.FLASH_MAX_ALPHA = 0.35;
ThunderEffect.SHAKE_INTENSITY = 4;
ThunderEffect.SHAKE_DAMPING = 0.88;
ThunderEffect.SHAKE_THRESHOLD = 0.3;
ThunderEffect.BRANCH_COUNT_MIN = 2;
ThunderEffect.BRANCH_COUNT_MAX = 3;
ThunderEffect.GLOW_RADIUS = 40;
//# sourceMappingURL=ThunderEffect.js.map