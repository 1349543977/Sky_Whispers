// ============================================================
// Skeleton - Loading skeleton with shimmer animation
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export interface SkeletonOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  rows?: number;
  rowHeight?: number;
  rowGap?: number;
}

export class Skeleton {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private rows: number;
  private rowHeight: number;
  private rowGap: number;
  private shimmerOffset: number = 0;
  private active: boolean = true;

  constructor(options: SkeletonOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.rows = options.rows ?? 4;
    this.rowHeight = options.rowHeight ?? 16;
    this.rowGap = options.rowGap ?? 12;
  }

  update(dt: number): void {
    if (!this.active) return;
    this.shimmerOffset += dt * 200;
    if (this.shimmerOffset > this.width + 100) {
      this.shimmerOffset = -100;
    }
  }

  render(renderer: Renderer): void {
    if (!this.active) return;

    for (let i = 0; i < this.rows; i++) {
      const rowY = this.y + i * (this.rowHeight + this.rowGap);
      const rowWidth = i === this.rows - 1 ? this.width * 0.6 : this.width;

      // Base
      renderer.fillRoundRect(
        this.x,
        rowY,
        rowWidth,
        this.rowHeight,
        DesignTokens.borderRadius.sm,
        '#E8E8E8',
        LAYERS.UI,
      );

      // Shimmer highlight
      const shimmerX = this.x + this.shimmerOffset;
      const shimmerWidth = 60;
      if (shimmerX + shimmerWidth > this.x && shimmerX < this.x + rowWidth) {
        renderer.setAlpha(0.3, LAYERS.UI, (ctx) => {
          const gradient = ctx.createLinearGradient(shimmerX, rowY, shimmerX + shimmerWidth, rowY);
          gradient.addColorStop(0, 'rgba(255,255,255,0)');
          gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
          gradient.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gradient;
          this.drawRoundRectPath(ctx, this.x, rowY, rowWidth, this.rowHeight, DesignTokens.borderRadius.sm);
          ctx.fill();
        });
      }
    }
  }

  private drawRoundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
  ): void {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
