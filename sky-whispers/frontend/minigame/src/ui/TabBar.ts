// ============================================================
// TabBar - Bottom tab navigation
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { TabConfig } from '../types';
import { pointInRect } from '../utils/math';

export class TabBar {
  private tabs: TabConfig[];
  private activeTabId: string;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private onTabChange?: (tabId: string) => void;

  constructor(
    tabs: TabConfig[],
    screenWidth: number,
    screenHeight: number,
    onTabChange?: (tabId: string) => void,
  ) {
    this.tabs = tabs;
    this.activeTabId = tabs[0]?.id ?? '';
    this.width = screenWidth;
    this.height = 56;
    this.x = 0;
    this.y = screenHeight - this.height;
    this.onTabChange = onTabChange;
  }

  update(_dt: number): void {
    // No continuous updates needed
  }

  render(renderer: Renderer): void {
    // Background
    renderer.fillRect(this.x, this.y, this.width, this.height, DesignTokens.colors.surface, LAYERS.UI);

    // Top border
    renderer.fillRect(this.x, this.y, this.width, 1, DesignTokens.colors.border, LAYERS.UI);

    const tabWidth = this.width / this.tabs.length;

    for (let i = 0; i < this.tabs.length; i++) {
      const tab = this.tabs[i];
      const tabX = this.x + i * tabWidth;
      const isActive = tab.id === this.activeTabId;

      // Active indicator
      if (isActive) {
        renderer.fillRect(
          tabX + tabWidth / 2 - 16,
          this.y,
          32,
          3,
          DesignTokens.colors.primary,
          LAYERS.UI,
        );
      }

      // Icon
      const icon = isActive ? tab.activeIcon : tab.icon;
      renderer.drawText(
        icon,
        tabX + tabWidth / 2,
        this.y + 18,
        isActive ? DesignTokens.colors.primary : DesignTokens.colors.textSecondary,
        20,
        'center',
        'middle',
        LAYERS.UI,
      );

      // Label
      renderer.drawText(
        tab.label,
        tabX + tabWidth / 2,
        this.y + 38,
        isActive ? DesignTokens.colors.primary : DesignTokens.colors.textSecondary,
        DesignTokens.fontSize.xs,
        'center',
        'middle',
        LAYERS.UI,
      );

      // Badge
      if (tab.badge && tab.badge > 0) {
        const badgeX = tabX + tabWidth / 2 + 14;
        const badgeY = this.y + 12;
        renderer.drawCircle(badgeX, badgeY, 8, DesignTokens.colors.danger, true, LAYERS.UI);
        renderer.drawText(
          tab.badge > 99 ? '99+' : String(tab.badge),
          badgeX,
          badgeY,
          '#FFFFFF',
          8,
          'center',
          'middle',
          LAYERS.UI,
        );
      }
    }
  }

  handleTap(x: number, y: number): boolean {
    if (!pointInRect(x, y, this.x, this.y, this.width, this.height)) return false;

    const tabWidth = this.width / this.tabs.length;
    const tabIndex = Math.floor((x - this.x) / tabWidth);

    if (tabIndex >= 0 && tabIndex < this.tabs.length) {
      const tab = this.tabs[tabIndex];
      if (tab.id !== this.activeTabId) {
        this.activeTabId = tab.id;
        this.onTabChange?.(tab.id);
      }
      return true;
    }
    return false;
  }

  setActiveTab(tabId: string): void {
    this.activeTabId = tabId;
  }

  getActiveTab(): string {
    return this.activeTabId;
  }

  setBadge(tabId: string, count: number): void {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.badge = count;
    }
  }

  getHeight(): number {
    return this.height;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
