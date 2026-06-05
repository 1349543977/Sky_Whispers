// ============================================================
// Skeleton - Loading skeleton with Cloud Whisper aesthetic
// Shimmer sweep, pulse opacity, soft rounded shapes
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
  private pulsePhase: number = 0;

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

    // Shimmer sweep animation
    this.shimmerOffset += dt * 200;
    if (this.shimmerOffset > this.width + 100) {
      this.shimmerOffset = -100;
    }

    // Pulse phase for subtle opacity variation
    this.pulsePhase += dt * 2;
  }

  render(renderer: Renderer): void {
    if (!this.active) return;

    // Subtle pulse opacity
    const pulseAlpha = 0.85 + Math.sin(this.pulsePhase) * 0.08;

    for (let i = 0; i < this.rows; i++) {
      const rowY = this.y + i * (this.rowHeight + this.rowGap);
      const rowWidth = i === this.rows - 1 ? this.width * 0.6 : this.width;

      // Base shape with soft color
      renderer.setAlpha(pulseAlpha, LAYERS.UI, (ctx) => {
        ctx.fillStyle = DesignTokens.colors.neutral200;
        const r = Math.min(DesignTokens.borderRadius.md, rowWidth / 2, this.rowHeight / 2);
        ctx.beginPath();
        ctx.moveTo(this.x + r, rowY);
        ctx.lineTo(this.x + rowWidth - r, rowY);
        ctx.arcTo(this.x + rowWidth, rowY, this.x + rowWidth, rowY + r, r);
        ctx.lineTo(this.x + rowWidth, rowY + this.rowHeight - r);
        ctx.arcTo(this.x + rowWidth, rowY + this.rowHeight, this.x + rowWidth - r, rowY + this.rowHeight, r);
        ctx.lineTo(this.x + r, rowY + this.rowHeight);
        ctx.arcTo(this.x, rowY + this.rowHeight, this.x, rowY + this.rowHeight - r, r);
        ctx.lineTo(this.x, rowY + r);
        ctx.arcTo(this.x, rowY, this.x + r, rowY, r);
        ctx.closePath();
        ctx.fill();
      });

      // Shimmer highlight sweep
      const shimmerX = this.x + this.shimmerOffset;
      const shimmerWidth = 60;
      if (shimmerX + shimmerWidth > this.x && shimmerX < this.x + rowWidth) {
        renderer.setAlpha(0.3 * pulseAlpha, LAYERS.UI, (ctx) => {
          const gradient = ctx.createLinearGradient(shimmerX, rowY, shimmerX + shimmerWidth, rowY);
          gradient.addColorStop(0, 'rgba(255,255,255,0)');
          gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
          gradient.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gradient;
          const r = Math.min(DesignTokens.borderRadius.md, rowWidth / 2, this.rowHeight / 2);
          ctx.beginPath();
          ctx.moveTo(this.x + r, rowY);
          ctx.lineTo(this.x + rowWidth - r, rowY);
          ctx.arcTo(this.x + rowWidth, rowY, this.x + rowWidth, rowY + r, r);
          ctx.lineTo(this.x + rowWidth, rowY + this.rowHeight - r);
          ctx.arcTo(this.x + rowWidth, rowY + this.rowHeight, this.x + rowWidth - r, rowY + this.rowHeight, r);
          ctx.lineTo(this.x + r, rowY + this.rowHeight);
          ctx.arcTo(this.x, rowY + this.rowHeight, this.x, rowY + this.rowHeight - r, r);
          ctx.lineTo(this.x, rowY + r);
          ctx.arcTo(this.x, rowY, this.x + r, rowY, r);
          ctx.closePath();
          ctx.fill();
        });
      }
    }
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
