"use strict";
// ============================================================
// CoinDisplay - Animated coin counter
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinDisplay = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
class CoinDisplay {
    constructor(x, y) {
        this.coins = 0;
        this.displayCoins = 0;
        this.width = 100;
        this.height = 28;
        this.x = x;
        this.y = y;
    }
    update(dt) {
        // Smooth number animation
        const diff = this.coins - this.displayCoins;
        if (Math.abs(diff) < 1) {
            this.displayCoins = this.coins;
        }
        else {
            this.displayCoins += diff * 0.15;
        }
    }
    render(renderer) {
        // Background pill
        renderer.fillRoundRect(this.x, this.y, this.width, this.height, this.height / 2, 'rgba(0,0,0,0.3)', constants_1.LAYERS.UI);
        // Coin icon
        renderer.drawCircle(this.x + 14, this.y + this.height / 2, 9, constants_1.COLORS.COIN_GOLD, true, constants_1.LAYERS.UI);
        renderer.drawText('$', this.x + 14, this.y + this.height / 2, '#8B6914', 10, 'center', 'middle', constants_1.LAYERS.UI);
        // Coin count
        renderer.drawText(this.formatNumber(Math.floor(this.displayCoins)), this.x + 28, this.y + this.height / 2, '#FFFFFF', color_1.DesignTokens.fontSize.md, 'left', 'middle', constants_1.LAYERS.UI);
    }
    formatNumber(num) {
        if (num >= 1000000)
            return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 10000)
            return `${(num / 10000).toFixed(1)}W`;
        if (num >= 1000)
            return `${(num / 1000).toFixed(1)}K`;
        return String(num);
    }
    setCoins(coins) {
        this.coins = coins;
    }
    getCoins() {
        return this.coins;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.CoinDisplay = CoinDisplay;
//# sourceMappingURL=CoinDisplay.js.map