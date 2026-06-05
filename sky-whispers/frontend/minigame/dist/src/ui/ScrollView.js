"use strict";
// ============================================================
// ScrollView - Scrollable content with Cloud Whisper aesthetic
// Momentum scrolling, custom scrollbar, pull-to-refresh
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
        // Animation state
        this.scrollbarAlpha = 0;
        this.scrollbarFadeTimer = 0;
        this.pullArrowRotation = 0;
        this.pullDistance = 0;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.contentHeight = options.contentHeight;
        this.bgColor = (_a = options.bgColor) !== null && _a !== void 0 ? _a : 'transparent';
        this.scrollbarColor = (_b = options.scrollbarColor) !== null && _b !== void 0 ? _b : 'rgba(0,0,0,0.15)';
        this.scrollbarWidth = (_c = options.scrollbarWidth) !== null && _c !== void 0 ? _c : 3;
        this.momentum = (_d = options.momentum) !== null && _d !== void 0 ? _d : true;
        this.onPullRefresh = options.onPullRefresh;
    }
    update(dt) {
        // Momentum scrolling with deceleration
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
        // Scrollbar fade
        if (this.isDragging || Math.abs(this.velocity) > 0.5) {
            this.scrollbarAlpha = Math.min(1, this.scrollbarAlpha + dt * 8);
            this.scrollbarFadeTimer = 0;
        }
        else {
            this.scrollbarFadeTimer += dt;
            if (this.scrollbarFadeTimer > 1) {
                this.scrollbarAlpha = Math.max(0, this.scrollbarAlpha - dt * 3);
            }
        }
        // Pull arrow rotation
        if (this.scrollY < 0) {
            this.pullDistance = Math.min(Math.abs(this.scrollY), 40);
            this.pullArrowRotation = (0, math_1.easeOutCubic)(this.pullDistance / 40) * 180;
        }
        else {
            this.pullDistance = 0;
            this.pullArrowRotation = 0;
        }
    }
    render(renderer) {
        // Background
        if (this.bgColor !== 'transparent') {
            renderer.fillRoundRect(this.x, this.y, this.width, this.height, 0, this.bgColor, constants_1.LAYERS.UI);
        }
        // Custom scrollbar (thin rounded pill that fades)
        const maxScroll = Math.max(0, this.contentHeight - this.height);
        if (maxScroll > 0 && this.scrollbarAlpha > 0.01) {
            const scrollbarHeight = Math.max(20, (this.height / this.contentHeight) * this.height);
            const scrollbarY = this.y + (this.scrollY / maxScroll) * (this.height - scrollbarHeight);
            const scrollbarX = this.x + this.width - this.scrollbarWidth - 3;
            renderer.setAlpha(this.scrollbarAlpha * 0.6, constants_1.LAYERS.UI, (ctx) => {
                // Scrollbar with gradient
                const gradient = ctx.createLinearGradient(scrollbarX, scrollbarY, scrollbarX, scrollbarY + scrollbarHeight);
                gradient.addColorStop(0, 'rgba(126, 181, 214, 0.3)');
                gradient.addColorStop(0.5, 'rgba(126, 181, 214, 0.5)');
                gradient.addColorStop(1, 'rgba(126, 181, 214, 0.3)');
                ctx.fillStyle = gradient;
                const r = this.scrollbarWidth / 2;
                ctx.beginPath();
                ctx.moveTo(scrollbarX + r, scrollbarY);
                ctx.lineTo(scrollbarX + this.scrollbarWidth - r, scrollbarY);
                ctx.arcTo(scrollbarX + this.scrollbarWidth, scrollbarY, scrollbarX + this.scrollbarWidth, scrollbarY + r, r);
                ctx.lineTo(scrollbarX + this.scrollbarWidth, scrollbarY + scrollbarHeight - r);
                ctx.arcTo(scrollbarX + this.scrollbarWidth, scrollbarY + scrollbarHeight, scrollbarX + this.scrollbarWidth - r, scrollbarY + scrollbarHeight, r);
                ctx.lineTo(scrollbarX + r, scrollbarY + scrollbarHeight);
                ctx.arcTo(scrollbarX, scrollbarY + scrollbarHeight, scrollbarX, scrollbarY + scrollbarHeight - r, r);
                ctx.lineTo(scrollbarX, scrollbarY + r);
                ctx.arcTo(scrollbarX, scrollbarY, scrollbarX + r, scrollbarY, r);
                ctx.closePath();
                ctx.fill();
            });
        }
        // Pull-to-refresh indicator
        if (this.scrollY < 0) {
            const centerX = this.x + this.width / 2;
            const indicatorY = this.y + 20;
            // Downward arrow that rotates when pulled enough
            renderer.setAlpha(Math.min(1, this.pullDistance / 20), constants_1.LAYERS.UI, (ctx) => {
                ctx.save();
                ctx.translate(centerX, indicatorY);
                ctx.rotate((this.pullArrowRotation * Math.PI) / 180);
                // Arrow
                ctx.strokeStyle = this.isRefreshing ? color_1.DesignTokens.colors.primary : color_1.DesignTokens.colors.textTertiary;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(-8, -4);
                ctx.lineTo(0, 4);
                ctx.lineTo(8, -4);
                ctx.stroke();
                ctx.restore();
            });
            // Refresh text
            if (this.isRefreshing) {
                renderer.drawText('刷新中...', centerX, indicatorY + 16, color_1.DesignTokens.colors.primary, color_1.DesignTokens.fontSize.xs, 'center', 'middle', constants_1.LAYERS.UI);
            }
            else if (this.pullDistance > 25) {
                renderer.drawText('释放刷新', centerX, indicatorY + 16, color_1.DesignTokens.colors.primary, color_1.DesignTokens.fontSize.xs, 'center', 'middle', constants_1.LAYERS.UI);
            }
            else {
                renderer.drawText('下拉刷新', centerX, indicatorY + 16, color_1.DesignTokens.colors.textTertiary, color_1.DesignTokens.fontSize.xs, 'center', 'middle', constants_1.LAYERS.UI);
            }
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