"use strict";
// ============================================================
// TabBar - Bottom tab navigation
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabBar = void 0;
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const math_1 = require("../utils/math");
class TabBar {
    constructor(tabs, screenWidth, screenHeight, onTabChange) {
        var _a, _b;
        this.tabs = tabs;
        this.activeTabId = (_b = (_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        this.width = screenWidth;
        this.height = 56;
        this.x = 0;
        this.y = screenHeight - this.height;
        this.onTabChange = onTabChange;
    }
    update(_dt) {
        // No continuous updates needed
    }
    render(renderer) {
        // Background
        renderer.fillRect(this.x, this.y, this.width, this.height, color_1.DesignTokens.colors.surface, constants_1.LAYERS.UI);
        // Top border
        renderer.fillRect(this.x, this.y, this.width, 1, color_1.DesignTokens.colors.border, constants_1.LAYERS.UI);
        const tabWidth = this.width / this.tabs.length;
        for (let i = 0; i < this.tabs.length; i++) {
            const tab = this.tabs[i];
            const tabX = this.x + i * tabWidth;
            const isActive = tab.id === this.activeTabId;
            // Active indicator
            if (isActive) {
                renderer.fillRect(tabX + tabWidth / 2 - 16, this.y, 32, 3, color_1.DesignTokens.colors.primary, constants_1.LAYERS.UI);
            }
            // Icon
            const icon = isActive ? tab.activeIcon : tab.icon;
            renderer.drawText(icon, tabX + tabWidth / 2, this.y + 18, isActive ? color_1.DesignTokens.colors.primary : color_1.DesignTokens.colors.textSecondary, 20, 'center', 'middle', constants_1.LAYERS.UI);
            // Label
            renderer.drawText(tab.label, tabX + tabWidth / 2, this.y + 38, isActive ? color_1.DesignTokens.colors.primary : color_1.DesignTokens.colors.textSecondary, color_1.DesignTokens.fontSize.xs, 'center', 'middle', constants_1.LAYERS.UI);
            // Badge
            if (tab.badge && tab.badge > 0) {
                const badgeX = tabX + tabWidth / 2 + 14;
                const badgeY = this.y + 12;
                renderer.drawCircle(badgeX, badgeY, 8, color_1.DesignTokens.colors.danger, true, constants_1.LAYERS.UI);
                renderer.drawText(tab.badge > 99 ? '99+' : String(tab.badge), badgeX, badgeY, '#FFFFFF', 8, 'center', 'middle', constants_1.LAYERS.UI);
            }
        }
    }
    handleTap(x, y) {
        var _a;
        if (!(0, math_1.pointInRect)(x, y, this.x, this.y, this.width, this.height))
            return false;
        const tabWidth = this.width / this.tabs.length;
        const tabIndex = Math.floor((x - this.x) / tabWidth);
        if (tabIndex >= 0 && tabIndex < this.tabs.length) {
            const tab = this.tabs[tabIndex];
            if (tab.id !== this.activeTabId) {
                this.activeTabId = tab.id;
                (_a = this.onTabChange) === null || _a === void 0 ? void 0 : _a.call(this, tab.id);
            }
            return true;
        }
        return false;
    }
    setActiveTab(tabId) {
        this.activeTabId = tabId;
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
        return this.height;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
exports.TabBar = TabBar;
//# sourceMappingURL=TabBar.js.map