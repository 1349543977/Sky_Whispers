// ============================================================
// Button - Touch button with Cloud Whisper aesthetic
// Gradient background, soft shadow, bounce animations
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { TouchTarget } from '../core/Input';
import { pointInRect, easeOutBack } from '../utils/math';

export interface ButtonOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  textColor?: string;
  bgColor?: string;
  gradientEnd?: string;
  pressedBgColor?: string;
  disabledBgColor?: string;
  borderRadius?: number;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  onTap?: () => void;
}

/** Small sparkle particle for loading state */
interface ShimmerDot {
  offset: number;
  speed: number;
  size: number;
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
  private gradientEnd: string;
  private pressedBgColor: string;
  private disabledBgColor: string;
  private borderRadius: number;
  private disabled: boolean;
  private loading: boolean;
  private icon: string;
  private pressed: boolean = false;
  private onTap?: () => void;

  // Animation state
  private scale: number = 1;
  private targetScale: number = 1;
  private bounceProgress: number = 1;
  private bounceStartTime: number = 0;
  private shimmerOffset: number = 0;
  private spinnerAngle: number = 0;
  private shimmerDots: ShimmerDot[];

  constructor(options: ButtonOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.text = options.text;
    this.fontSize = options.fontSize ?? DesignTokens.fontSize.md;
    this.textColor = options.textColor ?? '#FFFFFF';
    this.bgColor = options.bgColor ?? DesignTokens.colors.primary;
    this.gradientEnd = options.gradientEnd ?? DesignTokens.colors.primaryLight;
    this.pressedBgColor = options.pressedBgColor ?? DesignTokens.colors.primaryDark;
    this.disabledBgColor = options.disabledBgColor ?? DesignTokens.colors.neutral300;
    this.borderRadius = options.borderRadius ?? DesignTokens.borderRadius.lg;
    this.disabled = options.disabled ?? false;
    this.loading = options.loading ?? false;
    this.icon = options.icon ?? '';
    this.onTap = options.onTap;

    // Initialize shimmer dots for loading state
    this.shimmerDots = [
      { offset: 0, speed: 1.2, size: 3 },
      { offset: 0.33, speed: 1.0, size: 2.5 },
      { offset: 0.66, speed: 0.8, size: 2 },
    ];
  }

  update(dt: number): void {
    // Smooth scale transition
    this.scale += (this.targetScale - this.scale) * 0.2;

    // Bounce animation on release (easeOutBack)
    if (this.bounceProgress < 1) {
      this.bounceProgress = Math.min(1, (Date.now() - this.bounceStartTime) / ANIMATION.BUTTON_RELEASE_SCALE / 1000 * 3);
      const easedT = easeOutBack(this.bounceProgress);
      this.scale = 0.92 + (1 - 0.92) * easedT;
    }

    // Loading animations
    if (this.loading) {
      this.spinnerAngle += dt * 6;
      this.shimmerOffset += dt * 300;
      if (this.shimmerOffset > this.width + 120) {
        this.shimmerOffset = -120;
      }
    }
  }

  render(renderer: Renderer): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const drawWidth = this.width * this.scale;
    const drawHeight = this.height * this.scale;
    const drawX = cx - drawWidth / 2;
    const drawY = cy - drawHeight / 2;

    // Soft shadow beneath button
    if (!this.disabled) {
      renderer.drawSoftShadow(
        cx, drawY + drawHeight + 3,
        drawWidth * 0.45, 4,
        6, DesignTokens.shadow.md.color,
        LAYERS.UI - 1,
      );
    }

    // Button background with gradient
    if (this.disabled) {
      renderer.fillRoundRect(drawX, drawY, drawWidth, drawHeight, this.borderRadius, this.disabledBgColor, LAYERS.UI);
    } else if (this.pressed) {
      // Pressed state: darken gradient
      renderer.fillGradientRoundRect(
        drawX, drawY, drawWidth, drawHeight, this.borderRadius,
        this.pressedBgColor, this.bgColor, true, LAYERS.UI,
      );
    } else {
      // Normal state: gradient from bgColor to gradientEnd
      renderer.fillGradientRoundRect(
        drawX, drawY, drawWidth, drawHeight, this.borderRadius,
        this.bgColor, this.gradientEnd, true, LAYERS.UI,
      );
    }

    // Disabled overlay (desaturated + lower opacity)
    if (this.disabled) {
      renderer.setAlpha(0.5, LAYERS.UI, (ctx) => {
        ctx.fillStyle = DesignTokens.colors.neutral100;
        ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
      });
    }

    // Shimmer sweep animation for loading state
    if (this.loading) {
      this.renderShimmer(renderer, drawX, drawY, drawWidth, drawHeight);
    }

    if (this.loading) {
      // Loading spinner dots
      this.renderSpinnerDots(renderer, cx, cy);
    } else {
      // Button text with optional icon
      this.renderContent(renderer, cx, cy);
    }
  }

  private renderShimmer(renderer: Renderer, drawX: number, drawY: number, drawWidth: number, drawHeight: number): void {
    const shimmerX = drawX + this.shimmerOffset;
    const shimmerWidth = 80;
    if (shimmerX + shimmerWidth > drawX && shimmerX < drawX + drawWidth) {
      renderer.setAlpha(0.15, LAYERS.UI, (ctx) => {
        const gradient = ctx.createLinearGradient(shimmerX, drawY, shimmerX + shimmerWidth, drawY);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        const r = Math.min(this.borderRadius, drawWidth / 2, drawHeight / 2);
        ctx.beginPath();
        ctx.moveTo(drawX + r, drawY);
        ctx.lineTo(drawX + drawWidth - r, drawY);
        ctx.arcTo(drawX + drawWidth, drawY, drawX + drawWidth, drawY + r, r);
        ctx.lineTo(drawX + drawWidth, drawY + drawHeight - r);
        ctx.arcTo(drawX + drawWidth, drawY + drawHeight, drawX + drawWidth - r, drawY + drawHeight, r);
        ctx.lineTo(drawX + r, drawY + drawHeight);
        ctx.arcTo(drawX, drawY + drawHeight, drawX, drawY + drawHeight - r, r);
        ctx.lineTo(drawX, drawY + r);
        ctx.arcTo(drawX, drawY, drawX + r, drawY, r);
        ctx.closePath();
        ctx.fill();
      });
    }
  }

  private renderSpinnerDots(renderer: Renderer, cx: number, cy: number): void {
    const dotCount = 3;
    const dotSpacing = 10;
    const startX = cx - (dotCount - 1) * dotSpacing / 2;

    for (let i = 0; i < dotCount; i++) {
      const dot = this.shimmerDots[i];
      const phase = (this.spinnerAngle * dot.speed + dot.offset * Math.PI * 2) % (Math.PI * 2);
      const alpha = 0.3 + 0.7 * Math.max(0, Math.sin(phase));
      const scale = 0.7 + 0.3 * Math.max(0, Math.sin(phase));
      const dotX = startX + i * dotSpacing;
      const dotY = cy;

      renderer.setAlpha(alpha, LAYERS.UI, (ctx) => {
        ctx.fillStyle = this.textColor;
        ctx.beginPath();
        ctx.arc(dotX, dotY, dot.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  private renderContent(renderer: Renderer, cx: number, cy: number): void {
    let textX = cx;
    let textAlign: CanvasTextAlign = 'center';

    if (this.icon) {
      // Icon + text layout
      const iconWidth = this.fontSize + 4;
      const totalWidth = iconWidth + this.text.length * this.fontSize * 0.55;
      const startX = cx - totalWidth / 2;

      // Icon
      renderer.drawText(
        this.icon,
        startX + iconWidth / 2,
        cy,
        this.disabled ? DesignTokens.colors.neutral400 : this.textColor,
        this.fontSize + 2,
        'center',
        'middle',
        LAYERS.UI,
      );

      textX = startX + iconWidth + totalWidth / 2 - iconWidth / 2;
    }

    // Text with subtle shadow
    renderer.fillTextWithShadow(
      this.text,
      textX,
      cy,
      this.disabled ? DesignTokens.colors.neutral400 : this.textColor,
      'rgba(0,0,0,0.1)',
      this.fontSize,
      2,
      1,
      textAlign,
      'middle',
      LAYERS.UI,
    );
  }

  handleTouchStart(x: number, y: number): boolean {
    if (this.disabled || this.loading) return false;
    if (pointInRect(x, y, this.x, this.y, this.width, this.height)) {
      this.pressed = true;
      this.targetScale = ANIMATION.BUTTON_PRESS_SCALE;
      this.bounceProgress = 1;
      return true;
    }
    return false;
  }

  handleTouchEnd(x: number, y: number): boolean {
    if (this.pressed) {
      this.pressed = false;
      // Trigger bounce animation
      this.bounceProgress = 0;
      this.bounceStartTime = Date.now();
      this.targetScale = ANIMATION.BUTTON_RELEASE_SCALE;

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
      this.bounceProgress = 1;
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
    if (loading) {
      this.shimmerOffset = -120;
    }
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
