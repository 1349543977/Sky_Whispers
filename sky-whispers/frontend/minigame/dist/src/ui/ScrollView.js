"use strict";
// ============================================================
// ScrollView - Scrollable content area with momentum
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollView = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const math_1 = require("../utils/math");
class ScrollView {
    constructor(options) {
        var _a, _b, _c, _d;
        this.scrollY = 0;
        this.velocity = 0;
        this.lastTouchY = 0;
        this.isDragging = false;
        this.isRefreshing = false;
        this.refreshProgress = 0;
        this.friction = 0.95;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.contentHeight = options.contentHeight;
        this.bgColor = (_a = options.bgColor) !== null && _a !== void 0 ? _a : 'transparent';
        this.scrollbarColor = (_b = options.scrollbarColor) !== null && _b !== void 0 ? _b : 'rgba(0,0,0,0.2)';
        this.scrollbarWidth = (_c = options.scrollbarWidth) !== null && _c !== void 0 ? _c : 3;
        this.momentum = (_d = options.momentum) !== null && _d !== void 0 ? _d : true;
        this.onPullRefresh = options.onPullRefresh;
    }
    update(dt) {
        if (!this.isDragging && this.momentum) {
            this.scrollY += this.velocity * dt * 60;
            this.velocity *= this.friction;
            if (Math.abs(this.velocity) < 0.1) {
                this.velocity = 0;
            }
        }
        // Clamp scroll
        const maxScroll = Math.max(0, this.contentHeight - this.height);
        this.scrollY = (0, math_1.clamp)(this.scrollY, -60, maxScroll);
        // Pull refresh
        if (this.scrollY < -40 && !this.isRefreshing && this.onPullRefresh) {
            this.isRefreshing = true;
            this.refreshProgress = 1;
            this.onPullRefresh();
        }
        if (this.isRefreshing) {
            this.refreshProgress -= dt * 2;
            if (this.refreshProgress <= 0) {
                this.isRefreshing = false;
                this.refreshProgress = 0;
            }
        }
    }
    render(renderer) {
        // Clip area (simulated - we draw content within bounds)
        // Background
        if (this.bgColor !== 'transparent') {
            renderer.fillRoundRect(this.x, this.y, this.width, this.height, 0, this.bgColor, constants_1.LAYERS.UI);
        }
        // Scrollbar
        const maxScroll = Math.max(0, this.contentHeight - this.height);
        if (maxScroll > 0) {
            const scrollbarHeight = Math.max(20, (this.height / this.contentHeight) * this.height);
            const scrollbarY = this.y + (this.scrollY / maxScroll) * (this.height - scrollbarHeight);
            renderer.fillRoundRect(this.x + this.width - this.scrollbarWidth - 2, scrollbarY, this.scrollbarWidth, scrollbarHeight, this.scrollbarWidth / 2, this.scrollbarColor, constants_1.LAYERS.UI);
        }
        // Pull refresh indicator
        if (this.scrollY < 0) {
            const progress = Math.min(Math.abs(this.scrollY) / 40, 1);
            renderer.drawText(this.isRefreshing ? '刷新中...' : '下拉刷新', this.x + this.width / 2, this.y + 20, color_1.DesignTokens.colors.textSecondary, color_1.DesignTokens.fontSize.sm, 'center', 'middle', constants_1.LAYERS.UI);
        }
    }
    handleTouchStart(x, y) {
        if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.height) {
            return false;
        }
        this.isDragging = true;
        this.lastTouchY = y;
        this.velocity = 0;
        return true;
    }
    handleTouchMove(x, y) {
        if (!this.isDragging)
            return;
        const dy = y - this.lastTouchY;
        this.scrollY -= dy;
        this.velocity = -dy;
        this.lastTouchY = y;
    }
    handleTouchEnd() {
        this.isDragging = false;
    }
    setContentHeight(height) {
        this.contentHeight = height;
    }
    getScrollY() {
        return this.scrollY;
    }
    scrollTo(y) {
        const maxScroll = Math.max(0, this.contentHeight - this.height);
        this.scrollY = (0, math_1.clamp)(y, 0, maxScroll);
        this.velocity = 0;
    }
    containsPoint(px, py) {
        return (px >= this.x &&
            px <= this.x + this.width &&
            py >= this.y &&
            py <= this.y + this.height);
    }
}
exports.ScrollView = ScrollView;
//# sourceMappingURL=ScrollView.js.map