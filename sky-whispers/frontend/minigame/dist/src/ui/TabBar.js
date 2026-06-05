"use strict";
// ============================================================
// TabBar - Bottom tab navigation with Cloud Whisper aesthetic
// Frosted glass, animated indicator, badge, safe area
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabBar = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const math_1 = require("../utils/math");
class TabBar {
    constructor(tabs, screenWidth, screenHeight, onTabChange) {
        var _a, _b, _c;
        // Animation state
        this.indicatorProgress = 0;
        this.previousTabIndex = 0;
        this.currentTabIndex = 0;
        this.indicatorAnimStart = 0;
        this.bounceScale = 1;
        this.bounceStartTime = 0;
        this.safeAreaBottom = 0;
        this.tabs = tabs;
        this.activeTabId = (_b = (_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        this.width = screenWidth;
        this.height = 56;
        this.x = 0;
        this.y = screenHeight - this.height;
        this.onTabChange = onTabChange;
        // Safe area for iPhone notch
        try {
            const systemInfo = wx.getSystemInfoSync();
            this.safeAreaBottom = ((_c = systemInfo.safeArea) === null || _c === void 0 ? void 0 : _c.bottom)
                ? screenHeight - systemInfo.safeArea.bottom
                : 0;
        }
        catch (_d) {
            this.safeAreaBottom = 0;
        }
        this.currentTabIndex = 0;
        this.previousTabIndex = 0;
        this.indicatorProgress = 1;
    }
    update(_dt) {
        // Animate indicator slide
        if (this.indicatorProgress < 1) {
            const elapsed = (Date.now() - this.indicatorAnimStart) / constants_1.ANIMATION.TAB_INDICATOR_DURATION;
            this.indicatorProgress = Math.min(1, elapsed);
        }
        // Bounce animation on tab switch
        if (this.bounceScale < 1) {
            const elapsed = (Date.now() - this.bounceStartTime) / 300;
            this.bounceScale = (0, math_1.easeOutBack)(Math.min(1, elapsed));
        }
    }
    render(renderer) {
        const totalHeight = this.height + this.safeAreaBottom;
        const tabWidth = this.width / this.tabs.length;
        // Frosted glass background
        renderer.setAlpha(0.92, constants_1.LAYERS.UI, (ctx) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x, this.y, this.width, totalHeight);
        });
        // Subtle top border with gradient
        renderer.fillGradientRoundRect(this.x, this.y, this.width, 1, 0, 'rgba(0,0,0,0.04)', 'rgba(0,0,0,0.02)', false, constants_1.LAYERS.UI);
        // Animated indicator position
        const easedProgress = (0, math_1.easeOutBack)(Math.min(1, this.indicatorProgress));
        const indicatorTab = this.previousTabIndex + (this.currentTabIndex - this.previousTabIndex) * easedProgress;
        const indicatorX = this.x + indicatorTab * tabWidth + tabWidth / 2;
        for (let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            const tabX = this.x + i * tabWidth;
            const isActive = tab.id === this.activeTabId;
            const tabCx = tabX + tabWidth / 2;
            // Active tab: filled circle behind icon
            if (isActive) {
                const circleRadius = 16 * this.bounceScale;
                renderer.drawRadialGlow(tabCx, this.y + 18, 0, circleRadius + 4, 'rgba(126, 181, 214, 0.15)', 'rgba(126, 181, 214, 0)', constants_1.LAYERS.UI);
                renderer.fillRoundRect(tabCx - circleRadius, this.y + 18 - circleRadius, circleRadius * 2, circleRadius * 2, circleRadius, color_1.DesignTokens.colors.primarySubtle, constants_1.LAYERS.UI);
            }
            // Icon
            const icon = isActive ? tab.activeIcon : tab.icon;
            const iconScale = isActive ? this.bounceScale : 1;
            const iconAlpha = isActive ? 1 : 0.5;
            renderer.setAlpha(iconAlpha, constants_1.LAYERS.UI, (ctx) => {
                ctx.font = `${isActive ? 20 : 18}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = isActive ? color_1.DesignTokens.colors.primary : color_1.DesignTokens.colors.textTertiary;
                ctx.fillText(icon, tabCx, this.y + 18);
            });
            // Label
            renderer.drawText(tab.label, tabCx, this.y + 38, isActive ? color_1.DesignTokens.colors.primary : color_1.DesignTokens.colors.textTertiary, isActive ? color_1.DesignTokens.fontSize.xs : color_1.DesignTokens.fontSize.micro, 'center', 'middle', constants_1.LAYERS.UI);
            // Badge
            if (tab.badge && tab.badge > 0) {
                const badgeX = tabCx + 14;
                const badgeY = this.y + 10;
                const badgeRadius = tab.badge > 9 ? 9 : 7;
                // Badge glow
                renderer.drawRadialGlow(badgeX, badgeY, 0, badgeRadius + 3, 'rgba(224, 145, 145, 0.3)', 'rgba(224, 145, 145, 0)', constants_1.LAYERS.UI);
                renderer.drawCircle(badgeX, badgeY, badgeRadius, color_1.DesignTokens.colors.danger, true, constants_1.LAYERS.UI);
                renderer.drawText(tab.badge > 99 ? '99+' : String(tab.badge), badgeX, badgeY, '#FFFFFF', tab.badge > 9 ? 7 : 8, 'center', 'middle', constants_1.LAYERS.UI);
            }
        }
        // Safe area padding (bottom fill)
        if (this.safeAreaBottom > 0) {
            renderer.fillRect(this.x, this.y + this.height, this.width, this.safeAreaBottom, '#FFFFFF', constants_1.LAYERS.UI);
        }
    }
    handleTap(x, y) {
        var _a;
        const totalHeight = this.height + this.safeAreaBottom;
        if (!(0, math_1.pointInRect)(x, y, this.x, this.y, this.width, totalHeight))
            return false;
        const tabWidth = this.width / this.tabs.length;
        const tabIndex = Math.floor((x - this.x) / tabWidth);
        if (tabIndex >= 0 && tabIndex < this.tabs.length) {
            const tab = this.tabs[tabIndex];
            if (tab.id !== this.activeTabId) {
                this.previousTabIndex = this.currentTabIndex;
                this.currentTabIndex = tabIndex;
                this.indicatorProgress = 0;
                this.indicatorAnimStart = Date.now();
                this.bounceScale = 0;
                this.bounceStartTime = Date.now();
                this.activeTabId = tab.id;
                (_a = this.onTabChange) === null || _a === void 0 ? void 0 : _a.call(this, tab.id);
            }
            return true;
        }
        return false;
    }
    setActiveTab(tabId) {
        const index = this.tabs.findIndex((t) => t.id === tabId);
        if (index >= 0) {
            this.previousTabIndex = this.currentTabIndex;
            this.currentTabIndex = index;
            this.indicatorProgress = 0;
            this.indicatorAnimStart = Date.now();
            this.bounceScale = 0;
            this.bounceStartTime = Date.now();
            this.activeTabId = tabId;
        }
    }
    getActiveTab() {
        return this.activeTabId;
    }
    setBadge(tabId, count) {
        const tab = this.tabs.find((t) => t.id === tabId);
        if (tab) {
            tab.badge = count;
        }
    }
    getHeight() {
        return this.height + this.safeAreaBottom;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
exports.TabBar = TabBar;
//# sourceMappingURL=TabBar.js.map