// ============================================================
// Cloud - Drifting cloud entity with variants
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS, ANIMATION } from '../utils/constants';

export type CloudVariant = 'normal' | 'rain' | 'gift';

export class Cloud {
  private x: number;
  private y: number;
  private speed: number;
  private variant: CloudVariant;
  private width: number;
  private height: number;
  private screenWidth: number;
  private time: number = 0;
  private dripOffset: number = 0;

  constructor(
    x: number,
    y: number,
    speed: number,
    variant: CloudVariant,
    screenWidth: number,
  ) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.variant = variant;
    this.screenWidth = screenWidth;
    this.width = variant === 'gift' ? 70 : 60;
    this.height = variant === 'rain' ? 35 : 30;
  }

  update(dt: number): void {
    this.time += dt * 1000;
    this.x += this.speed * dt;

    // Wrap around screen
    if (this.x > this.screenWidth + this.width) {
      this.x = -this.width;
    }

    if (this.variant === 'rain') {
      this.dripOffset = (this.dripOffset + dt * 30) % 20;
    }
  }

  render(renderer: Renderer): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    switch (this.variant) {
      case 'normal':
        this.renderNormalCloud(renderer, cx, cy);
        break;
      case 'rain':
        this.renderRainCloud(renderer, cx, cy);
        break;
      case 'gift':
        this.renderGiftCloud(renderer, cx, cy);
        break;
    }
  }

  private renderNormalCloud(renderer: Renderer, cx: number, cy: number): void {
    renderer.setAlpha(0.85, LAYERS.ENTITIES, (ctx) => {
      ctx.fillStyle = COLORS.CLOUD_WHITE;
      // Cloud shape using overlapping circles
      ctx.beginPath();
      ctx.arc(cx - 15, cy, 14, 0, Math.PI * 2);
      ctx.arc(cx, cy - 6, 16, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy, 14, 0, Math.PI * 2);
      ctx.arc(cx + 5, cy + 4, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private renderRainCloud(renderer: Renderer, cx: number, cy: number): void {
    renderer.setAlpha(0.9, LAYERS.ENTITIES, (ctx) => {
      ctx.fillStyle = COLORS.CLOUD_RAIN;
      ctx.beginPath();
      ctx.arc(cx - 15, cy, 14, 0, Math.PI * 2);
      ctx.arc(cx, cy - 6, 16, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy, 14, 0, Math.PI * 2);
      ctx.arc(cx + 5, cy + 4, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rain drops
    renderer.setAlpha(0.6, LAYERS.EFFECTS, (ctx) => {
      ctx.fillStyle = COLORS.RAIN;
      for (let i = 0; i < 3; i++) {
        const dx = cx - 12 + i * 12;
        const dy = cy + 14 + (this.dripOffset + i * 7) % 20;
        ctx.fillRect(dx, dy, 1.5, 6);
      }
    });
  }

  private renderGiftCloud(renderer: Renderer, cx: number, cy: number): void {
    renderer.setAlpha(0.9, LAYERS.ENTITIES, (ctx) => {
      ctx.fillStyle = COLORS.CLOUD_GIFT;
      ctx.beginPath();
      ctx.arc(cx - 18, cy, 16, 0, Math.PI * 2);
      ctx.arc(cx, cy - 8, 18, 0, Math.PI * 2);
      ctx.arc(cx + 18, cy, 16, 0, Math.PI * 2);
      ctx.arc(cx + 5, cy + 5, 14, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ribbon
    renderer.setAlpha(1, LAYERS.ENTITIES, (ctx) => {
      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(cx - 2, cy - 12, 4, 24);
      ctx.fillRect(cx - 10, cy - 2, 20, 4);
      // Bow
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 12, 4, 0, Math.PI * 2);
      ctx.arc(cx + 5, cy - 12, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  containsPoint(px: number, py: number): boolean {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const dx = px - cx;
    const dy = py - cy;
    return (dx * dx) / (this.width * this.width / 4) + (dy * dy) / (this.height * this.height / 4) <= 1;
  }

  getVariant(): CloudVariant {
    return this.variant;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
