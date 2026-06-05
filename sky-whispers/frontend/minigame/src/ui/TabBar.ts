// ============================================================
// TabBar - Bottom tab navigation with Cloud Whisper aesthetic
// Frosted glass, animated indicator, badge, safe area
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { TabConfig } from '../types';
import { pointInRect, lerp, easeOutBack } from '../utils/math';

export class TabBar {
  private tabs: TabConfig[];
  private activeTabId: string;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private onTabChange?: (tabId: string) => void;

  // Animation state
  private indicatorProgress: number = 0;
  private previousTabIndex: number = 0;
  private currentTabIndex: number = 0;
  private indicatorAnimStart: number = 0;
  private bounceScale: number = 1;
  private bounceStartTime: number = 0;
  private safeAreaBottom: number = 0;

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

    // Safe area for iPhone notch
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.safeAreaBottom = systemInfo.safeArea?.bottom
        ? screenHeight - systemInfo.safeArea.bottom
        : 0;
    } catch {
      this.safeAreaBottom = 0;
    }

    this.currentTabIndex = 0;
    this.previousTabIndex = 0;
    this.indicatorProgress = 1;
  }

  update(_dt: number): void {
    // Animate indicator slide
    if (this.indicatorProgress < 1) {
      const elapsed = (Date.now() - this.indicatorAnimStart) / ANIMATION.TAB_INDICATOR_DURATION;
      this.indicatorProgress = Math.min(1, elapsed);
    }

    // Bounce animation on tab switch
    if (this.bounceScale < 1) {
      const elapsed = (Date.now() - this.bounceStartTime) / 300;
      this.bounceScale = easeOutBack(Math.min(1, elapsed));
    }
  }

  render(renderer: Renderer): void {
    const totalHeight = this.height + this.safeAreaBottom;
    const tabWidth = this.width / this.tabs.length;

    // Frosted glass background
    renderer.setAlpha(0.92, LAYERS.UI, (ctx) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(this.x, this.y, this.width, totalHeight);
    });

    // Subtle top border with gradient
    renderer.fillGradientRoundRect(
      this.x, this.y, this.width, 1, 0,
      'rgba(0,0,0,0.04)', 'rgba(0,0,0,0.02)', false, LAYERS.UI,
    );

    // Animated indicator position
    const easedProgress = easeOutBack(Math.min(1, this.indicatorProgress));
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
        renderer.drawRadialGlow(
          tabCx, this.y + 18,
          0, circleRadius + 4,
          'rgba(126, 181, 214, 0.15)', 'rgba(126, 181, 214, 0)',
          LAYERS.UI,
        );
        renderer.fillRoundRect(
          tabCx - circleRadius, this.y + 18 - circleRadius,
          circleRadius * 2, circleRadius * 2,
          circleRadius,
          DesignTokens.colors.primarySubtle,
          LAYERS.UI,
        );
      }

      // Icon
      const icon = isActive ? tab.activeIcon : tab.icon;
      const iconScale = isActive ? this.bounceScale : 1;
      const iconAlpha = isActive ? 1 : 0.5;

      renderer.setAlpha(iconAlpha, LAYERS.UI, (ctx) => {
        ctx.font = `${isActive ? 20 : 18}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isActive ? DesignTokens.colors.primary : DesignTokens.colors.textTertiary;
        ctx.fillText(icon, tabCx, this.y + 18);
      });

      // Label
      renderer.drawText(
        tab.label,
        tabCx,
        this.y + 38,
        isActive ? DesignTokens.colors.primary : DesignTokens.colors.textTertiary,
        isActive ? DesignTokens.fontSize.xs : DesignTokens.fontSize.micro,
        'center',
        'middle',
        LAYERS.UI,
      );

      // Badge
      if (tab.badge && tab.badge > 0) {
        const badgeX = tabCx + 14;
        const badgeY = this.y + 10;
        const badgeRadius = tab.badge > 9 ? 9 : 7;

        // Badge glow
        renderer.drawRadialGlow(
          badgeX, badgeY, 0, badgeRadius + 3,
          'rgba(224, 145, 145, 0.3)', 'rgba(224, 145, 145, 0)',
          LAYERS.UI,
        );

        renderer.drawCircle(badgeX, badgeY, badgeRadius, DesignTokens.colors.danger, true, LAYERS.UI);
        renderer.drawText(
          tab.badge > 99 ? '99+' : String(tab.badge),
          badgeX,
          badgeY,
          '#FFFFFF',
          tab.badge > 9 ? 7 : 8,
          'center',
          'middle',
          LAYERS.UI,
        );
      }
    }

    // Safe area padding (bottom fill)
    if (this.safeAreaBottom > 0) {
      renderer.fillRect(
        this.x, this.y + this.height,
        this.width, this.safeAreaBottom,
        '#FFFFFF', LAYERS.UI,
      );
    }
  }

  handleTap(x: number, y: number): boolean {
    const totalHeight = this.height + this.safeAreaBottom;
    if (!pointInRect(x, y, this.x, this.y, this.width, totalHeight)) return false;

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
        this.onTabChange?.(tab.id);
      }
      return true;
    }
    return false;
  }

  setActiveTab(tabId: string): void {
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
    return this.height + this.safeAreaBottom;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
