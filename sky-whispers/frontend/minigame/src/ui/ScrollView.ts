// ============================================================
// ScrollView - Scrollable content area with momentum
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { clamp } from '../utils/math';

export interface ScrollViewOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  contentHeight: number;
  bgColor?: string;
  scrollbarColor?: string;
  scrollbarWidth?: number;
  momentum?: boolean;
  onPullRefresh?: () => void;
}

export class ScrollView {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private contentHeight: number;
  private bgColor: string;
  private scrollbarColor: string;
  private scrollbarWidth: number;
  private momentum: boolean;
  private onPullRefresh?: () => void;

  private scrollY: number = 0;
  private velocity: number = 0;
  private lastTouchY: number = 0;
  private isDragging: boolean = false;
  private isRefreshing: boolean = false;
  private refreshProgress: number = 0;
  private friction: number = 0.95;

  constructor(options: ScrollViewOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.contentHeight = options.contentHeight;
    this.bgColor = options.bgColor ?? 'transparent';
    this.scrollbarColor = options.scrollbarColor ?? 'rgba(0,0,0,0.2)';
    this.scrollbarWidth = options.scrollbarWidth ?? 3;
    this.momentum = options.momentum ?? true;
    this.onPullRefresh = options.onPullRefresh;
  }

  update(dt: number): void {
    if (!this.isDragging && this.momentum) {
      this.scrollY += this.velocity * dt * 60;
      this.velocity *= this.friction;

      if (Math.abs(this.velocity) < 0.1) {
        this.velocity = 0;
      }
    }

    // Clamp scroll
    const maxScroll = Math.max(0, this.contentHeight - this.height);
    this.scrollY = clamp(this.scrollY, -60, maxScroll);

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

  render(renderer: Renderer): void {
    // Clip area (simulated - we draw content within bounds)
    // Background
    if (this.bgColor !== 'transparent') {
      renderer.fillRoundRect(this.x, this.y, this.width, this.height, 0, this.bgColor, LAYERS.UI);
    }

    // Scrollbar
    const maxScroll = Math.max(0, this.contentHeight - this.height);
    if (maxScroll > 0) {
      const scrollbarHeight = Math.max(20, (this.height / this.contentHeight) * this.height);
      const scrollbarY = this.y + (this.scrollY / maxScroll) * (this.height - scrollbarHeight);
      renderer.fillRoundRect(
        this.x + this.width - this.scrollbarWidth - 2,
        scrollbarY,
        this.scrollbarWidth,
        scrollbarHeight,
        this.scrollbarWidth / 2,
        this.scrollbarColor,
        LAYERS.UI,
      );
    }

    // Pull refresh indicator
    if (this.scrollY < 0) {
      const progress = Math.min(Math.abs(this.scrollY) / 40, 1);
      renderer.drawText(
        this.isRefreshing ? '刷新中...' : '下拉刷新',
        this.x + this.width / 2,
        this.y + 20,
        DesignTokens.colors.textSecondary,
        DesignTokens.fontSize.sm,
        'center',
        'middle',
        LAYERS.UI,
      );
    }
  }

  handleTouchStart(x: number, y: number): boolean {
    if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.height) {
      return false;
    }
    this.isDragging = true;
    this.lastTouchY = y;
    this.velocity = 0;
    return true;
  }

  handleTouchMove(x: number, y: number): void {
    if (!this.isDragging) return;
    const dy = y - this.lastTouchY;
    this.scrollY -= dy;
    this.velocity = -dy;
    this.lastTouchY = y;
  }

  handleTouchEnd(): void {
    this.isDragging = false;
  }

  setContentHeight(height: number): void {
    this.contentHeight = height;
  }

  getScrollY(): number {
    return this.scrollY;
  }

  scrollTo(y: number): void {
    const maxScroll = Math.max(0, this.contentHeight - this.height);
    this.scrollY = clamp(y, 0, maxScroll);
    this.velocity = 0;
  }

  containsPoint(px: number, py: number): boolean {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }
}
