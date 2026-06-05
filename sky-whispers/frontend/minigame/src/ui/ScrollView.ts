// ============================================================
// ScrollView - Scrollable content with Cloud Whisper aesthetic
// Momentum scrolling, custom scrollbar, pull-to-refresh
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { clamp, easeOutCubic } from '../utils/math';

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

  // Animation state
  private scrollbarAlpha: number = 0;
  private scrollbarFadeTimer: number = 0;
  private pullArrowRotation: number = 0;
  private pullDistance: number = 0;

  constructor(options: ScrollViewOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.contentHeight = options.contentHeight;
    this.bgColor = options.bgColor ?? 'transparent';
    this.scrollbarColor = options.scrollbarColor ?? 'rgba(0,0,0,0.15)';
    this.scrollbarWidth = options.scrollbarWidth ?? 3;
    this.momentum = options.momentum ?? true;
    this.onPullRefresh = options.onPullRefresh;
  }

  update(dt: number): void {
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

    // Scrollbar fade
    if (this.isDragging || Math.abs(this.velocity) > 0.5) {
      this.scrollbarAlpha = Math.min(1, this.scrollbarAlpha + dt * 8);
      this.scrollbarFadeTimer = 0;
    } else {
      this.scrollbarFadeTimer += dt;
      if (this.scrollbarFadeTimer > 1) {
        this.scrollbarAlpha = Math.max(0, this.scrollbarAlpha - dt * 3);
      }
    }

    // Pull arrow rotation
    if (this.scrollY < 0) {
      this.pullDistance = Math.min(Math.abs(this.scrollY), 40);
      this.pullArrowRotation = easeOutCubic(this.pullDistance / 40) * 180;
    } else {
      this.pullDistance = 0;
      this.pullArrowRotation = 0;
    }
  }

  render(renderer: Renderer): void {
    // Background
    if (this.bgColor !== 'transparent') {
      renderer.fillRoundRect(this.x, this.y, this.width, this.height, 0, this.bgColor, LAYERS.UI);
    }

    // Custom scrollbar (thin rounded pill that fades)
    const maxScroll = Math.max(0, this.contentHeight - this.height);
    if (maxScroll > 0 && this.scrollbarAlpha > 0.01) {
      const scrollbarHeight = Math.max(20, (this.height / this.contentHeight) * this.height);
      const scrollbarY = this.y + (this.scrollY / maxScroll) * (this.height - scrollbarHeight);
      const scrollbarX = this.x + this.width - this.scrollbarWidth - 3;

      renderer.setAlpha(this.scrollbarAlpha * 0.6, LAYERS.UI, (ctx) => {
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
      renderer.setAlpha(Math.min(1, this.pullDistance / 20), LAYERS.UI, (ctx) => {
        ctx.save();
        ctx.translate(centerX, indicatorY);
        ctx.rotate((this.pullArrowRotation * Math.PI) / 180);

        // Arrow
        ctx.strokeStyle = this.isRefreshing ? DesignTokens.colors.primary : DesignTokens.colors.textTertiary;
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
        renderer.drawText(
          '刷新中...',
          centerX,
          indicatorY + 16,
          DesignTokens.colors.primary,
          DesignTokens.fontSize.xs,
          'center',
          'middle',
          LAYERS.UI,
        );
      } else if (this.pullDistance > 25) {
        renderer.drawText(
          '释放刷新',
          centerX,
          indicatorY + 16,
          DesignTokens.colors.primary,
          DesignTokens.fontSize.xs,
          'center',
          'middle',
          LAYERS.UI,
        );
      } else {
        renderer.drawText(
          '下拉刷新',
          centerX,
          indicatorY + 16,
          DesignTokens.colors.textTertiary,
          DesignTokens.fontSize.xs,
          'center',
          'middle',
          LAYERS.UI,
        );
      }
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
