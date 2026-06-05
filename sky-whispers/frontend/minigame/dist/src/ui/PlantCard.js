"use strict";
// ============================================================
// PlantCard - Plant info card for codex/inventory
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlantCard = void 0;
const types_1 = require("../types");
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const ProgressBar_1 = require("./ProgressBar");
class PlantCard {
    constructor(options) {
        var _a;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.plantType = options.plantType;
        this.discovered = options.discovered;
        this.growthProgress = (_a = options.growthProgress) !== null && _a !== void 0 ? _a : 0;
        this.onTap = options.onTap;
        this.progressBar = new ProgressBar_1.ProgressBar({
            x: this.x + 8,
            y: this.y + this.height - 16,
            width: this.width - 16,
            height: 4,
            min: 0,
            max: 1,
            value: this.growthProgress,
            fillColor: color_1.DesignTokens.colors.secondary,
            borderRadius: 2,
        });
    }
    update(dt) {
        this.progressBar.update(dt);
    }
    render(renderer) {
        var _a, _b;
        // Card background
        const bgColor = this.discovered ? color_1.DesignTokens.colors.surface : '#E0E0E0';
        renderer.fillRoundRect(this.x, this.y, this.width, this.height, color_1.DesignTokens.borderRadius.md, bgColor, constants_1.LAYERS.UI);
        // Border
        const rarityColor = (_a = constants_1.RARITY_COLORS[this.plantType.rarity]) !== null && _a !== void 0 ? _a : constants_1.RARITY_COLORS[types_1.Rarity.Common];
        renderer.strokeRoundRect(this.x, this.y, this.width, this.height, color_1.DesignTokens.borderRadius.md, rarityColor, 2, constants_1.LAYERS.UI);
        if (this.discovered) {
            // Plant sprite area
            const spriteArea = this.width - 16;
            renderer.fillRoundRect(this.x + 8, this.y + 8, spriteArea, spriteArea, color_1.DesignTokens.borderRadius.sm, 'rgba(0,0,0,0.05)', constants_1.LAYERS.UI);
            // Plant icon (using emoji as placeholder)
            const stageVisual = this.plantType.stages[this.plantType.stages.length - 1];
            renderer.drawText('🌱', this.x + this.width / 2, this.y + 8 + spriteArea / 2, (_b = stageVisual === null || stageVisual === void 0 ? void 0 : stageVisual.color_primary) !== null && _b !== void 0 ? _b : color_1.DesignTokens.colors.secondary, 24, 'center', 'middle', constants_1.LAYERS.UI);
            // Name
            renderer.drawText(this.plantType.name, this.x + this.width / 2, this.y + this.width + 4, color_1.DesignTokens.colors.textPrimary, color_1.DesignTokens.fontSize.xs, 'center', 'top', constants_1.LAYERS.UI);
            // Rarity badge
            renderer.fillRoundRect(this.x + 4, this.y + 4, 24, 14, 7, rarityColor, constants_1.LAYERS.UI);
            renderer.drawText(this.plantType.rarity.charAt(0).toUpperCase(), this.x + 16, this.y + 11, '#FFFFFF', 8, 'center', 'middle', constants_1.LAYERS.UI);
            // Progress bar
            this.progressBar.render(renderer);
        }
        else {
            // Silhouette
            renderer.setAlpha(0.3, constants_1.LAYERS.UI, (ctx) => {
                ctx.fillStyle = '#000000';
                ctx.font = '24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', this.x + this.width / 2, this.y + this.width / 2);
            });
            renderer.drawText('???', this.x + this.width / 2, this.y + this.width + 4, color_1.DesignTokens.colors.textTertiary, color_1.DesignTokens.fontSize.xs, 'center', 'top', constants_1.LAYERS.UI);
        }
    }
    handleTap(x, y) {
        var _a;
        if (x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height) {
            (_a = this.onTap) === null || _a === void 0 ? void 0 : _a.call(this);
            return true;
        }
        return false;
    }
    setGrowthProgress(progress) {
        this.growthProgress = progress;
        this.progressBar.setValue(progress);
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.progressBar.setPosition(x + 8, y + this.height - 16);
    }
}
exports.PlantCard = PlantCard;
//# sourceMappingURL=PlantCard.js.map