// ============================================================
// ProgressBar - Animated progress bar with Cloud Whisper aesthetic
// Gradient fill, shimmer sweep, glow on leading edge
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { clamp, lerp } from '../utils/math';

export interface ProgressBarOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  min?: number;
  max?: number;
  value: number;
  fillColor?: string;
  fillGradientEnd?: string;
  bgColor?: string;
  borderColor?: string;
  borderRadius?: number;
  showText?: boolean;
  textColor?: string;
  fontSize?: number;
}

export class ProgressBar {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private min: number;
  private max: number;
  private value: number;
  private displayValue: number;
  private fillColor: string;
  private fillGradientEnd: string;
  private bgColor: string;
  private borderColor: string;
  private borderRadius: number;
  private showText: boolean;
  private textColor: string;
  private fontSize: number;

  // Animation state
  private shimmerOffset: number = 0;
  private glowPulse: number = 0;

  constructor(options: ProgressBarOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.value = options.value;
    this.displayValue = options.value;
    this.fillColor = options.fillColor ?? DesignTokens.colors.secondary;
    this.fillGradientEnd = options.fillGradientEnd ?? DesignTokens.colors.secondaryLight;
    this.bgColor = options.bgColor ?? 'rgba(0,0,0,0.08)';
    this.borderColor = options.borderColor ?? 'transparent';
    this.borderRadius = options.borderRadius ?? DesignTokens.borderRadius.md;
    this.showText = options.showText ?? false;
    this.textColor = options.textColor ?? DesignTokens.colors.textPrimary;
    this.fontSize = options.fontSize ?? DesignTokens.fontSize.xs;
  }

  update(dt: number): void {
    // Smooth animation
    this.displayValue = lerp(this.displayValue, this.value, 0.1);

    // Shimmer sweep
    this.shimmerOffset += dt * 150;
    if (this.shimmerOffset > this.width + 60) {
      this.shimmerOffset = -60;
    }

    // Glow pulse
    this.glowPulse = (Math.sin(Date.now() * 0.004) + 1) / 2;
  }

  render(renderer: Renderer): void {
    const progress = clamp(
      (this.displayValue - this.min) / (this.max - this.min),
      0,
      1,
    );

    // Track shadow
    renderer.drawSoftShadow(
      this.x + this.width / 2, this.y + this.height + 2,
      this.width * 0.48, 2,
      4, 'rgba(26, 39, 56, 0.06)',
      LAYERS.UI - 1,
    );

    // Background track
    renderer.fillRoundRect(this.x, this.y, this.width, this.height, this.borderRadius, this.bgColor, LAYERS.UI);

    // Gradient fill
    const fillWidth = this.width * progress;
    if (fillWidth > 0) {
      const clampedFillWidth = Math.max(fillWidth, this.borderRadius * 2);
      renderer.fillGradientRoundRect(
        this.x, this.y, clampedFillWidth, this.height, this.borderRadius,
        this.fillColor, this.fillGradientEnd, false, LAYERS.UI,
      );

      // Shimmer highlight across filled portion
      this.renderShimmer(renderer, clampedFillWidth);

      // Glow effect on leading edge
      this.renderLeadingGlow(renderer, clampedFillWidth, progress);
    }

    // Border
    if (this.borderColor !== 'transparent') {
      renderer.strokeRoundRect(
        this.x,
        this.y,
        this.width,
        this.height,
        this.borderRadius,
        this.borderColor,
        1,
        LAYERS.UI,
      );
    }

    // Text overlay
    if (this.showText) {
      const percent = Math.round(progress * 100);
      renderer.fillTextWithShadow(
        `${percent}%`,
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.textColor,
        'rgba(0,0,0,0.08)',
        this.fontSize,
        1,
        1,
        'center',
        'middle',
        LAYERS.UI,
      );
    }
  }

  private renderShimmer(renderer: Renderer, fillWidth: number): void {
    const shimmerX = this.x + this.shimmerOffset;
    const shimmerWidth = 40;
    if (shimmerX + shimmerWidth > this.x && shimmerX < this.x + fillWidth) {
      renderer.setAlpha(0.2, LAYERS.UI, (ctx) => {
        const gradient = ctx.createLinearGradient(shimmerX, this.y, shimmerX + shimmerWidth, this.y);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        const r = Math.min(this.borderRadius, this.width / 2, this.height / 2);
        ctx.beginPath();
        ctx.moveTo(this.x + r, this.y);
        ctx.lineTo(this.x + fillWidth - r, this.y);
        ctx.arcTo(this.x + fillWidth, this.y, this.x + fillWidth, this.y + r, r);
        ctx.lineTo(this.x + fillWidth, this.y + this.height - r);
        ctx.arcTo(this.x + fillWidth, this.y + this.height, this.x + fillWidth - r, this.y + this.height, r);
        ctx.lineTo(this.x + r, this.y + this.height);
        ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - r, r);
        ctx.lineTo(this.x, this.y + r);
        ctx.arcTo(this.x, this.y, this.x + r, this.y, r);
        ctx.closePath();
        ctx.fill();
      });
    }
  }

  private renderLeadingGlow(renderer: Renderer, fillWidth: number, progress: number): void {
    if (progress <= 0 || progress >= 1) return;
    const glowX = this.x + fillWidth;
    const glowY = this.y + this.height / 2;
    const glowRadius = 6 + this.glowPulse * 3;
    const glowAlpha = 0.3 + this.glowPulse * 0.2;

    renderer.setAlpha(glowAlpha, LAYERS.UI, (ctx) => {
      const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
      gradient.addColorStop(0, this.fillGradientEnd);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  setValue(value: number): void {
    this.value = clamp(value, this.min, this.max);
  }

  getValue(): number {
    return this.value;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setFillColor(color: string): void {
    this.fillColor = color;
  }
}
