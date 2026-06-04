// ============================================================
// Button - Touch button with feedback states
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { TouchTarget } from '../core/Input';
import { pointInRect } from '../utils/math';

export interface ButtonOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  textColor?: string;
  bgColor?: string;
  pressedBgColor?: string;
  disabledBgColor?: string;
  borderRadius?: number;
  disabled?: boolean;
  loading?: boolean;
  onTap?: () => void;
}

export class Button {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private text: string;
  private fontSize: number;
  private textColor: string;
  private bgColor: string;
  private pressedBgColor: string;
  private disabledBgColor: string;
  private borderRadius: number;
  private disabled: boolean;
  private loading: boolean;
  private pressed: boolean = false;
  private onTap?: () => void;
  private scale: number = 1;
  private targetScale: number = 1;

  constructor(options: ButtonOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.text = options.text;
    this.fontSize = options.fontSize ?? DesignTokens.fontSize.md;
    this.textColor = options.textColor ?? '#FFFFFF';
    this.bgColor = options.bgColor ?? DesignTokens.colors.primary;
    this.pressedBgColor = options.pressedBgColor ?? DesignTokens.colors.primaryDark;
    this.disabledBgColor = options.disabledBgColor ?? DesignTokens.colors.textLight;
    this.borderRadius = options.borderRadius ?? DesignTokens.borderRadius.md;
    this.disabled = options.disabled ?? false;
    this.loading = options.loading ?? false;
    this.onTap = options.onTap;
  }

  update(dt: number): void {
    // Smooth scale transition
    this.scale += (this.targetScale - this.scale) * 0.2;
  }

  render(renderer: Renderer): void {
    const currentBgColor = this.disabled
      ? this.disabledBgColor
      : this.pressed
        ? this.pressedBgColor
        : this.bgColor;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const drawWidth = this.width * this.scale;
    const drawHeight = this.height * this.scale;
    const drawX = cx - drawWidth / 2;
    const drawY = cy - drawHeight / 2;

    // Button background
    renderer.fillRoundRect(drawX, drawY, drawWidth, drawHeight, this.borderRadius, currentBgColor, LAYERS.UI);

    if (this.loading) {
      // Loading spinner
      this.renderSpinner(renderer, cx, cy);
    } else {
      // Button text
      renderer.drawText(
        this.text,
        cx,
        cy,
        this.disabled ? '#B0B0B0' : this.textColor,
        this.fontSize,
        'center',
        'middle',
        LAYERS.UI,
      );
    }
  }

  private renderSpinner(renderer: Renderer, cx: number, cy: number): void {
    const radius = 6;
    const time = Date.now() * 0.005;
    renderer.setAlpha(1, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = this.textColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, time, time + Math.PI * 1.5);
      ctx.stroke();
    });
  }

  handleTouchStart(x: number, y: number): boolean {
    if (this.disabled || this.loading) return false;
    if (pointInRect(x, y, this.x, this.y, this.width, this.height)) {
      this.pressed = true;
      this.targetScale = 0.95;
      return true;
    }
    return false;
  }

  handleTouchEnd(x: number, y: number): boolean {
    if (this.pressed) {
      this.pressed = false;
      this.targetScale = 1;
      if (!this.disabled && !this.loading && pointInRect(x, y, this.x, this.y, this.width, this.height)) {
        this.onTap?.();
        return true;
      }
    }
    return false;
  }

  handleTouchMove(x: number, y: number): void {
    if (this.pressed && !pointInRect(x, y, this.x, this.y, this.width, this.height)) {
      this.pressed = false;
      this.targetScale = 1;
    }
  }

  getTouchTarget(): TouchTarget {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      id: `btn_${this.x}_${this.y}`,
      onTouchStart: (touch) => this.handleTouchStart(touch.x, touch.y),
      onTouchEnd: (touch) => this.handleTouchEnd(touch.x, touch.y),
      onTouchMove: (touch) => this.handleTouchMove(touch.x, touch.y),
    };
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  setText(text: string): void {
    this.text = text;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  containsPoint(px: number, py: number): boolean {
    return pointInRect(px, py, this.x, this.y, this.width, this.height);
  }
}
