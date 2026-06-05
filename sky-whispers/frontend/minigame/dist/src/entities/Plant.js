"use strict";
// ============================================================
// Plant - Plant entity with Cloud Whisper aesthetic
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
        this.swayAngle = 0;
        this.sparkleTime = 0;
        this.highlightAlpha = 0;
        this.bounceOffset = 0;
        this.bounceVelocity = 0;
        this.prevGrowthStage = types_1.PlantGrowthStage.Seed;
        this.width = 36;
        this.height = 36;
        this.data = data;
        this.type = type;
        this.x = x;
        this.y = y;
        this.prevGrowthStage = data.growth_stage;
    }
    update(dt) {
        this.time += dt * 1000;
        this.swayOffset = Math.sin(this.time * constants_1.ANIMATION.PLANT_SWAY_SPEED) * constants_1.ANIMATION.PLANT_SWAY_AMPLITUDE;
        this.swayAngle = Math.sin(this.time * constants_1.ANIMATION.PLANT_SWAY_SPEED) * 0.06;
        if (this.data.growth_stage === types_1.PlantGrowthStage.Mature) {
            this.sparkleTime += dt * 1000;
        }
        // Decay highlight
        if (this.highlightAlpha > 0) {
            this.highlightAlpha = Math.max(0, this.highlightAlpha - dt * 3);
        }
        // Bounce effect when growth stage changes
        if (this.data.growth_stage !== this.prevGrowthStage) {
            this.bounceVelocity = -constants_1.ANIMATION.PLANT_GROW_BOUNCE * 60;
            this.prevGrowthStage = this.data.growth_stage;
        }
        // Spring physics for bounce
        if (Math.abs(this.bounceOffset) > 0.01 || Math.abs(this.bounceVelocity) > 0.01) {
            const springK = 300;
            const damping = 8;
            this.bounceVelocity += (-springK * this.bounceOffset - damping * this.bounceVelocity) * dt;
            this.bounceOffset += this.bounceVelocity * dt;
        }
        else {
            this.bounceOffset = 0;
            this.bounceVelocity = 0;
        }
    }
    render(renderer) {
        const stageVisual = this.type.stages.find((s) => s.stage === this.data.growth_stage);
        if (!stageVisual)
            return;
        const cx = this.x + this.width / 2 + this.swayOffset;
        const cy = this.y + this.height / 2 + this.bounceOffset;
        // Highlight glow effect
        if (this.highlightAlpha > 0) {
            renderer.drawRadialGlow(cx, cy, 0, this.width / 2 + 6, `rgba(255, 255, 255, ${this.highlightAlpha * 0.4})`, `rgba(255, 255, 255, 0)`, constants_1.LAYERS.EFFECTS);
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
            this.renderWaterDrop(renderer, cx, cy);
        }
    }
    renderSeed(renderer, cx, cy) {
        // Soft glow beneath seed
        renderer.drawRadialGlow(cx, cy + 6, 0, 10, 'rgba(196, 168, 130, 0.15)', 'rgba(196, 168, 130, 0)', constants_1.LAYERS.EFFECTS);
        // Small mound with gradient
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                const gradient = ctx.createRadialGradient(cx, cy + 6, 0, cx, cy + 6, 8);
                gradient.addColorStop(0, constants_1.COLORS.ISLAND_DIRT);
                gradient.addColorStop(1, constants_1.COLORS.PLANT_SEED_DARK);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.ellipse(cx, cy + 6, 8, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
        });
        // Seed dot with highlight
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                const gradient = ctx.createRadialGradient(cx - 1, cy + 4, 0, cx, cy + 5, 4);
                gradient.addColorStop(0, '#8B7355');
                gradient.addColorStop(1, '#6B5335');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(cx, cy + 5, 3, 0, Math.PI * 2);
                ctx.fill();
                // Tiny highlight
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.arc(cx - 1, cy + 4, 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
        });
    }
    renderSprout(renderer, cx, cy) {
        // Curved stem with gradient
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(this.swayAngle * 0.5);
                const gradient = ctx.createLinearGradient(0, -4, 0, 10);
                gradient.addColorStop(0, constants_1.COLORS.PLANT_SPROUT);
                gradient.addColorStop(1, constants_1.COLORS.PLANT_GROWING);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(0, 10);
                ctx.quadraticCurveTo(1, 3, 0, -4);
                ctx.stroke();
                ctx.restore();
            },
        });
        // Two soft leaves using bezier curves
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(this.swayAngle * 0.5);
                const leafGradient = ctx.createLinearGradient(-8, -6, 8, -2);
                leafGradient.addColorStop(0, constants_1.COLORS.PLANT_SPROUT);
                leafGradient.addColorStop(1, '#C8ECD8');
                ctx.fillStyle = leafGradient;
                // Left leaf
                ctx.beginPath();
                ctx.moveTo(0, -4);
                ctx.bezierCurveTo(-4, -8, -10, -7, -8, -3);
                ctx.bezierCurveTo(-6, -1, -2, -2, 0, -4);
                ctx.fill();
                // Right leaf
                ctx.beginPath();
                ctx.moveTo(0, -4);
                ctx.bezierCurveTo(4, -8, 10, -7, 8, -3);
                ctx.bezierCurveTo(6, -1, 2, -2, 0, -4);
                ctx.fill();
                ctx.restore();
            },
        });
    }
    renderGrowing(renderer, cx, cy) {
        // Taller curved stem with gradient
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(this.swayAngle);
                const gradient = ctx.createLinearGradient(0, -14, 0, 10);
                gradient.addColorStop(0, constants_1.COLORS.PLANT_GROWING);
                gradient.addColorStop(1, constants_1.COLORS.PLANT_MATURE);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(0, 10);
                ctx.quadraticCurveTo(2, 0, 0, -12);
                ctx.stroke();
                ctx.restore();
            },
        });
        // Multiple leaves with bezier curves
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(this.swayAngle);
                const leafGradient = ctx.createLinearGradient(-12, -8, 12, -2);
                leafGradient.addColorStop(0, constants_1.COLORS.PLANT_GROWING);
                leafGradient.addColorStop(1, '#B8DCC8');
                ctx.fillStyle = leafGradient;
                // Left leaf
                ctx.beginPath();
                ctx.moveTo(-1, -4);
                ctx.bezierCurveTo(-6, -10, -14, -8, -12, -3);
                ctx.bezierCurveTo(-10, 0, -3, -2, -1, -4);
                ctx.fill();
                // Right leaf
                ctx.beginPath();
                ctx.moveTo(1, -4);
                ctx.bezierCurveTo(6, -10, 14, -8, 12, -3);
                ctx.bezierCurveTo(10, 0, 3, -2, 1, -4);
                ctx.fill();
                // Lower left leaf
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(-1, 0);
                ctx.bezierCurveTo(-5, -4, -10, -3, -8, 0);
                ctx.bezierCurveTo(-6, 2, -2, 1, -1, 0);
                ctx.fill();
                ctx.restore();
            },
        });
        // Top bud with glow
        renderer.drawRadialGlow(cx + this.swayOffset, cy - 14 + this.bounceOffset, 0, 10, 'rgba(140, 198, 165, 0.2)', 'rgba(140, 198, 165, 0)', constants_1.LAYERS.EFFECTS);
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(this.swayAngle);
                const budGradient = ctx.createRadialGradient(0, -14, 0, 0, -14, 6);
                budGradient.addColorStop(0, '#A8DCC0');
                budGradient.addColorStop(1, constants_1.COLORS.PLANT_GROWING);
                ctx.fillStyle = budGradient;
                ctx.beginPath();
                ctx.arc(0, -14, 5, 0, Math.PI * 2);
                ctx.fill();
                // Bud highlight
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.arc(-1.5, -15.5, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
        });
    }
    renderMature(renderer, cx, cy) {
        var _a, _b, _c, _d;
        const bloomColor = (_b = (_a = this.type.stages[3]) === null || _a === void 0 ? void 0 : _a.color_primary) !== null && _b !== void 0 ? _b : '#FF6B6B';
        const bloomColorSecondary = (_d = (_c = this.type.stages[3]) === null || _c === void 0 ? void 0 : _c.color_secondary) !== null && _d !== void 0 ? _d : '#FFB3B3';
        // Full stem with gradient
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(this.swayAngle);
                const gradient = ctx.createLinearGradient(0, -18, 0, 10);
                gradient.addColorStop(0, constants_1.COLORS.PLANT_MATURE);
                gradient.addColorStop(1, '#5A9876');
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(0, 10);
                ctx.quadraticCurveTo(2, -2, 0, -16);
                ctx.stroke();
                ctx.restore();
            },
        });
        // Full leaves with bezier curves
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(this.swayAngle);
                const leafGradient = ctx.createLinearGradient(-14, -4, 14, 4);
                leafGradient.addColorStop(0, constants_1.COLORS.PLANT_GROWING);
                leafGradient.addColorStop(1, '#A0D4B8');
                ctx.fillStyle = leafGradient;
                // Left leaf
                ctx.beginPath();
                ctx.moveTo(-1, -2);
                ctx.bezierCurveTo(-8, -8, -16, -6, -14, -1);
                ctx.bezierCurveTo(-12, 3, -3, 1, -1, -2);
                ctx.fill();
                // Right leaf
                ctx.beginPath();
                ctx.moveTo(1, -2);
                ctx.bezierCurveTo(8, -8, 16, -6, 14, -1);
                ctx.bezierCurveTo(12, 3, 3, 1, 1, -2);
                ctx.fill();
                // Lower leaves
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.moveTo(-1, 2);
                ctx.bezierCurveTo(-6, -2, -12, -1, -10, 3);
                ctx.bezierCurveTo(-8, 5, -2, 4, -1, 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(1, 2);
                ctx.bezierCurveTo(6, -2, 12, -1, 10, 3);
                ctx.bezierCurveTo(8, 5, 2, 4, 1, 2);
                ctx.fill();
                ctx.restore();
            },
        });
        // Flower/bloom with radial gradient
        renderer.drawRadialGlow(cx + this.swayOffset, cy - 18 + this.bounceOffset, 0, 16, `rgba(255, 200, 200, 0.15)`, `rgba(255, 200, 200, 0)`, constants_1.LAYERS.EFFECTS);
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(this.swayAngle);
                // Petals with gradient
                const petalGradient = ctx.createRadialGradient(0, -18, 0, 0, -18, 10);
                petalGradient.addColorStop(0, bloomColor);
                petalGradient.addColorStop(1, bloomColorSecondary);
                ctx.fillStyle = petalGradient;
                // Draw 5 petals
                const petalCount = 5;
                for (let i = 0; i < petalCount; i++) {
                    const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
                    ctx.save();
                    ctx.translate(0, -18);
                    ctx.rotate(angle);
                    ctx.beginPath();
                    ctx.ellipse(0, -5, 3.5, 6, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                // Flower center
                const centerGradient = ctx.createRadialGradient(0, -18, 0, 0, -18, 4);
                centerGradient.addColorStop(0, '#FFE882');
                centerGradient.addColorStop(1, '#F2C57C');
                ctx.fillStyle = centerGradient;
                ctx.beginPath();
                ctx.arc(0, -18, 3.5, 0, Math.PI * 2);
                ctx.fill();
                // Center highlight
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.arc(-1, -19, 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
        });
    }
    renderProgressBar(renderer) {
        const barWidth = this.width - 4;
        const barHeight = 5;
        const barX = this.x + 2;
        const barY = this.y + this.height + 3;
        const progress = (0, math_1.clamp)(this.data.growth_progress, 0, 1);
        // Background with rounded ends
        renderer.fillGradientRoundRect(barX, barY, barWidth, barHeight, barHeight / 2, 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.15)', true, constants_1.LAYERS.ENTITIES);
        // Fill with gradient and rounded ends
        if (progress > 0) {
            const fillWidth = Math.max(barHeight, barWidth * progress);
            renderer.fillGradientRoundRect(barX, barY, fillWidth, barHeight, barHeight / 2, constants_1.COLORS.PLANT_GROWING, '#A8DCC0', true, constants_1.LAYERS.ENTITIES);
            // Shimmer highlight on progress bar
            const shimmerX = barX + fillWidth - barHeight;
            renderer.addCommand({
                layer: constants_1.LAYERS.EFFECTS,
                draw: (ctx) => {
                    ctx.save();
                    ctx.globalAlpha = 0.4;
                    const shimmerGradient = ctx.createLinearGradient(shimmerX - 4, barY, shimmerX + 4, barY);
                    shimmerGradient.addColorStop(0, 'rgba(255,255,255,0)');
                    shimmerGradient.addColorStop(0.5, 'rgba(255,255,255,0.6)');
                    shimmerGradient.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.fillStyle = shimmerGradient;
                    ctx.beginPath();
                    ctx.arc(shimmerX, barY + barHeight / 2, barHeight / 2 + 1, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                },
            });
        }
    }
    renderSparkle(renderer, cx, cy) {
        const sparkleCount = constants_1.ANIMATION.PLANT_SPARKLE_COUNT;
        for (let i = 0; i < sparkleCount; i++) {
            const angle = (this.sparkleTime * constants_1.ANIMATION.PLANT_SPARKLE_SPEED + (i * Math.PI * 2) / sparkleCount) % (Math.PI * 2);
            const radius = 14 + Math.sin(this.sparkleTime * 0.003 + i) * 4;
            const sx = cx + Math.cos(angle) * radius;
            const sy = cy - 8 + Math.sin(angle) * radius * 0.6;
            const alpha = 0.4 + Math.sin(this.sparkleTime * 0.005 + i * 2) * 0.3;
            const size = 2 + Math.sin(this.sparkleTime * 0.004 + i) * 1;
            renderer.drawSparkle(sx, sy, size, '#FFD700', alpha, constants_1.LAYERS.EFFECTS);
        }
    }
    /** Render a water droplet with glow for watered indicator */
    renderWaterDrop(renderer, cx, cy) {
        const dropX = cx + this.width / 2 - 3;
        const dropY = cy - this.height / 2 + 2;
        const pulse = Math.sin(this.time * 0.004) * 0.15 + 0.85;
        // Glow around droplet
        renderer.drawRadialGlow(dropX, dropY, 0, 8, 'rgba(126, 181, 214, 0.25)', 'rgba(126, 181, 214, 0)', constants_1.LAYERS.EFFECTS);
        // Teardrop shape
        renderer.addCommand({
            layer: constants_1.LAYERS.ENTITIES,
            draw: (ctx) => {
                ctx.save();
                ctx.globalAlpha = pulse;
                const dropGradient = ctx.createRadialGradient(dropX - 1, dropY, 0, dropX, dropY, 4);
                dropGradient.addColorStop(0, constants_1.COLORS.WATER_LIGHT);
                dropGradient.addColorStop(1, constants_1.COLORS.WATER);
                ctx.fillStyle = dropGradient;
                ctx.beginPath();
                ctx.moveTo(dropX, dropY - 4);
                ctx.bezierCurveTo(dropX - 3, dropY, dropX - 3, dropY + 2, dropX, dropY + 3);
                ctx.bezierCurveTo(dropX + 3, dropY + 2, dropX + 3, dropY, dropX, dropY - 4);
                ctx.fill();
                // Highlight
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.beginPath();
                ctx.arc(dropX - 0.8, dropY - 1, 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            },
        });
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