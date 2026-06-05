"use strict";
// ============================================================
// SpriteCard - Sprite info card for codex
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteCard = void 0;
const types_1 = require("../types");
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
class SpriteCard {
    constructor(options) {
        var _a, _b;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.spriteType = options.spriteType;
        this.discovered = options.discovered;
        this.level = (_a = options.level) !== null && _a !== void 0 ? _a : 1;
        this.happiness = (_b = options.happiness) !== null && _b !== void 0 ? _b : 100;
        this.onTap = options.onTap;
    }
    update(_dt) {
        // No continuous updates needed
    }
    render(renderer) {
        var _a;
        // Card background
        const bgColor = this.discovered ? color_1.DesignTokens.colors.surface : '#E0E0E0';
        renderer.fillRoundRect(this.x, this.y, this.width, this.height, color_1.DesignTokens.borderRadius.md, bgColor, constants_1.LAYERS.UI);
        // Border
        const rarityColor = (_a = constants_1.RARITY_COLORS[this.spriteType.rarity]) !== null && _a !== void 0 ? _a : constants_1.RARITY_COLORS[types_1.Rarity.Common];
        renderer.strokeRoundRect(this.x, this.y, this.width, this.height, color_1.DesignTokens.borderRadius.md, rarityColor, 2, constants_1.LAYERS.UI);
        if (this.discovered) {
            // Sprite visual area
            const spriteArea = this.width - 16;
            renderer.fillRoundRect(this.x + 8, this.y + 8, spriteArea, spriteArea, color_1.DesignTokens.borderRadius.sm, 'rgba(0,0,0,0.05)', constants_1.LAYERS.UI);
            // Sprite body (colored circle)
            const cx = this.x + this.width / 2;
            const cy = this.y + 8 + spriteArea / 2;
            renderer.drawCircle(cx, cy, spriteArea / 3, this.spriteType.color_primary, true, constants_1.LAYERS.UI);
            // Eyes
            renderer.drawCircle(cx - 5, cy - 3, 3, '#FFFFFF', true, constants_1.LAYERS.UI);
            renderer.drawCircle(cx + 5, cy - 3, 3, '#FFFFFF', true, constants_1.LAYERS.UI);
            renderer.drawCircle(cx - 5, cy - 3, 1.5, '#2C3E50', true, constants_1.LAYERS.UI);
            renderer.drawCircle(cx + 5, cy - 3, 1.5, '#2C3E50', true, constants_1.LAYERS.UI);
            // Name
            renderer.drawText(this.spriteType.name, this.x + this.width / 2, this.y + spriteArea + 16, color_1.DesignTokens.colors.textPrimary, color_1.DesignTokens.fontSize.xs, 'center', 'top', constants_1.LAYERS.UI);
            // Level badge
            renderer.fillRoundRect(this.x + 4, this.y + 4, 28, 14, 7, rarityColor, constants_1.LAYERS.UI);
            renderer.drawText(`Lv${this.level}`, this.x + 18, this.y + 11, '#FFFFFF', 8, 'center', 'middle', constants_1.LAYERS.UI);
            // Happiness indicator
            const heartColor = this.happiness > 60 ? '#E74C3C' : this.happiness > 30 ? '#F39C12' : '#95A5A6';
            renderer.drawText('❤', this.x + this.width - 14, this.y + 10, heartColor, 10, 'center', 'middle', constants_1.LAYERS.UI);
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
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.SpriteCard = SpriteCard;
//# sourceMappingURL=SpriteCard.js.map