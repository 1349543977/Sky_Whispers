// ============================================================
// ProgressBar - Animated progress bar with gradient
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
  private bgColor: string;
  private borderColor: string;
  private borderRadius: number;
  private showText: boolean;
  private textColor: string;
  private fontSize: number;

  constructor(options: ProgressBarOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.min = options.min ?? 0;
    this.max = options.max ?? 100;
    this.value = options.value;
    this.displayValue = options.value;
    this.fillColor = options.fillColor ?? DesignTokens.colors.primary;
    this.bgColor = options.bgColor ?? 'rgba(0,0,0,0.1)';
    this.borderColor = options.borderColor ?? 'transparent';
    this.borderRadius = options.borderRadius ?? DesignTokens.borderRadius.sm;
    this.showText = options.showText ?? false;
    this.textColor = options.textColor ?? DesignTokens.colors.text;
    this.fontSize = options.fontSize ?? DesignTokens.fontSize.xs;
  }

  update(dt: number): void {
    // Smooth animation
    this.displayValue = lerp(this.displayValue, this.value, 0.1);
  }

  render(renderer: Renderer): void {
    const progress = clamp(
      (this.displayValue - this.min) / (this.max - this.min),
      0,
      1,
    );

    // Background
    renderer.fillRoundRect(this.x, this.y, this.width, this.height, this.borderRadius, this.bgColor, LAYERS.UI);

    // Fill
    const fillWidth = this.width * progress;
    if (fillWidth > 0) {
      renderer.fillRoundRect(
        this.x,
        this.y,
        Math.max(fillWidth, this.borderRadius * 2),
        this.height,
        this.borderRadius,
        this.fillColor,
        LAYERS.UI,
      );
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
      renderer.drawText(
        `${percent}%`,
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.textColor,
        this.fontSize,
        'center',
        'middle',
        LAYERS.UI,
      );
    }
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
