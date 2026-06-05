"use strict";
// ============================================================
// Plant - Plant entity with growth stages and animations
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plant = void 0;
const types_1 = require("../types");
const constants_1 = require("../utils/constants");
const math_1 = require("../utils/math");
class Plant {
    constructor(data, type, x, y) {
        this.time = 0;
        this.swayOffset = 0;
        this.sparkleTime = 0;
        this.highlightAlpha = 0;
        this.width = 36;
        this.height = 36;
        this.data = data;
        this.type = type;
        this.x = x;
        this.y = y;
    }
    update(dt) {
        this.time += dt * 1000;
        this.swayOffset = Math.sin(this.time * constants_1.ANIMATION.PLANT_SWAY_SPEED) * constants_1.ANIMATION.PLANT_SWAY_AMPLITUDE;
        if (this.data.growth_stage === types_1.PlantGrowthStage.Mature) {
            this.sparkleTime += dt * 1000;
        }
        // Decay highlight
        if (this.highlightAlpha > 0) {
            this.highlightAlpha = Math.max(0, this.highlightAlpha - dt * 3);
        }
    }
    render(renderer) {
        const stageVisual = this.type.stages.find((s) => s.stage === this.data.growth_stage);
        if (!stageVisual)
            return;
        const cx = this.x + this.width / 2 + this.swayOffset;
        const cy = this.y + this.height / 2;
        // Highlight effect
        if (this.highlightAlpha > 0) {
            renderer.drawCircle(cx, cy, this.width / 2 + 4, `rgba(255,255,255,${this.highlightAlpha * 0.5})`, true, constants_1.LAYERS.ENTITIES);
        }
        // Draw based on growth stage
        switch (this.data.growth_stage) {
            case types_1.PlantGrowthStage.Seed:
                this.renderSeed(renderer, cx, cy);
                break;
            case types_1.PlantGrowthStage.Sprout:
                this.renderSprout(renderer, cx, cy);
                break;
            case types_1.PlantGrowthStage.Growing:
                this.renderGrowing(renderer, cx, cy);
                break;
            case types_1.PlantGrowthStage.Mature:
                this.renderMature(renderer, cx, cy);
                break;
        }
        // Growth progress bar
        if (this.data.growth_stage < types_1.PlantGrowthStage.Mature) {
            this.renderProgressBar(renderer);
        }
        // Sparkle effect for mature plants
        if (this.data.growth_stage === types_1.PlantGrowthStage.Mature) {
            this.renderSparkle(renderer, cx, cy);
        }
        // Watered indicator
        if (this.data.is_watered) {
            renderer.drawCircle(cx + this.width / 2 - 2, cy - this.height / 2 + 2, 3, constants_1.COLORS.WATER, true, constants_1.LAYERS.ENTITIES);
        }
    }
    renderSeed(renderer, cx, cy) {
        // Small seed mound
        renderer.fillRoundRect(cx - 6, cy + 4, 12, 8, 4, constants_1.COLORS.PLANT_SEED, constants_1.LAYERS.ENTITIES);
        // Seed dot
        renderer.drawCircle(cx, cy + 6, 3, constants_1.COLORS.ISLAND_DIRT, true, constants_1.LAYERS.ENTITIES);
    }
    renderSprout(renderer, cx, cy) {
        // Stem
        renderer.fillRect(cx - 1.5, cy - 4, 3, 14, constants_1.COLORS.PLANT_SPROUT, constants_1.LAYERS.ENTITIES);
        // Two small leaves
        renderer.fillRoundRect(cx - 8, cy - 6, 8, 5, 2, constants_1.COLORS.PLANT_SPROUT, constants_1.LAYERS.ENTITIES);
        renderer.fillRoundRect(cx + 1, cy - 6, 8, 5, 2, constants_1.COLORS.PLANT_SPROUT, constants_1.LAYERS.ENTITIES);
    }
    renderGrowing(renderer, cx, cy) {
        // Taller stem
        renderer.fillRect(cx - 2, cy - 12, 4, 22, constants_1.COLORS.PLANT_GROWING, constants_1.LAYERS.ENTITIES);
        // Larger leaves
        renderer.fillRoundRect(cx - 12, cy - 8, 10, 7, 3, constants_1.COLORS.PLANT_GROWING, constants_1.LAYERS.ENTITIES);
        renderer.fillRoundRect(cx + 3, cy - 8, 10, 7, 3, constants_1.COLORS.PLANT_GROWING, constants_1.LAYERS.ENTITIES);
        // Top bud
        renderer.drawCircle(cx, cy - 14, 5, constants_1.COLORS.PLANT_GROWING, true, constants_1.LAYERS.ENTITIES);
    }
    renderMature(renderer, cx, cy) {
        var _a, _b;
        // Full stem
        renderer.fillRect(cx - 2.5, cy - 16, 5, 26, constants_1.COLORS.PLANT_MATURE, constants_1.LAYERS.ENTITIES);
        // Full leaves
        renderer.fillRoundRect(cx - 14, cy - 4, 12, 8, 4, constants_1.COLORS.PLANT_GROWING, constants_1.LAYERS.ENTITIES);
        renderer.fillRoundRect(cx + 3, cy - 4, 12, 8, 4, constants_1.COLORS.PLANT_GROWING, constants_1.LAYERS.ENTITIES);
        // Flower/bloom
        const bloomColor = (_b = (_a = this.type.stages[3]) === null || _a === void 0 ? void 0 : _a.color_primary) !== null && _b !== void 0 ? _b : '#FF6B6B';
        renderer.drawCircle(cx, cy - 18, 8, bloomColor, true, constants_1.LAYERS.ENTITIES);
        // Flower center
        renderer.drawCircle(cx, cy - 18, 3, '#FFE082', true, constants_1.LAYERS.ENTITIES);
    }
    renderProgressBar(renderer) {
        const barWidth = this.width - 4;
        const barHeight = 4;
        const barX = this.x + 2;
        const barY = this.y + this.height + 2;
        const progress = (0, math_1.clamp)(this.data.growth_progress, 0, 1);
        // Background
        renderer.fillRoundRect(barX, barY, barWidth, barHeight, 2, 'rgba(0,0,0,0.2)', constants_1.LAYERS.ENTITIES);
        // Fill
        if (progress > 0) {
            renderer.fillRoundRect(barX, barY, barWidth * progress, barHeight, 2, constants_1.COLORS.PLANT_GROWING, constants_1.LAYERS.ENTITIES);
        }
    }
    renderSparkle(renderer, cx, cy) {
        const sparkleCount = 3;
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (this.sparkleTime * 0.002 + (i * Math.PI * 2) / sparkleCount) % (Math.PI * 2);
            const radius = 14 + Math.sin(this.sparkleTime * 0.003 + i) * 4;
            const sx = cx + Math.cos(angle) * radius;
            const sy = cy - 8 + Math.sin(angle) * radius * 0.6;
            const alpha = 0.5 + Math.sin(this.sparkleTime * 0.005 + i * 2) * 0.3;
            renderer.setAlpha(alpha, constants_1.LAYERS.EFFECTS, (ctx) => {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
    setHighlight() {
        this.highlightAlpha = 1;
    }
    containsPoint(px, py) {
        return (px >= this.x &&
            px <= this.x + this.width &&
            py >= this.y &&
            py <= this.y + this.height);
    }
    getData() {
        return this.data;
    }
    updateData(data) {
        this.data = data;
    }
    getType() {
        return this.type;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
exports.Plant = Plant;
//# sourceMappingURL=Plant.js.map