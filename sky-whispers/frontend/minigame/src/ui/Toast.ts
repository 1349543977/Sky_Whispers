// ============================================================
// Toast - Auto-dismiss notification with Cloud Whisper aesthetic
// Rounded pill, gradient tint, slide animation, type-based colors
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastOptions {
  text: string;
  icon?: string;
  type?: ToastType;
  duration?: number;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
}

/** Color config per toast type */
const TOAST_TYPE_COLORS: Record<ToastType, { bg: string; gradientEnd: string; icon: string }> = {
  success: {
    bg: DesignTokens.colors.success,
    gradientEnd: DesignTokens.colors.successLight,
    icon: '✓',
  },
  warning: {
    bg: DesignTokens.colors.warning,
    gradientEnd: DesignTokens.colors.warningLight,
    icon: '⚠',
  },
  error: {
    bg: DesignTokens.colors.danger,
    gradientEnd: DesignTokens.colors.dangerLight,
    icon: '✕',
  },
  info: {
    bg: DesignTokens.colors.info,
    gradientEnd: DesignTokens.colors.infoLight,
    icon: 'ℹ',
  },
};

export class Toast {
  private text: string;
  private icon: string;
  private type: ToastType;
  private duration: number;
  private bgColor: string;
  private gradientEnd: string;
  private textColor: string;
  private fontSize: number;

  private visible: boolean = false;
  private elapsed: number = 0;
  private slideProgress: number = 0;
  private screenWidth: number = 375;

  constructor(options: ToastOptions, screenWidth: number) {
    this.text = options.text;
    this.type = options.type ?? 'info';
    this.duration = options.duration ?? ANIMATION.TOAST_DURATION;
    this.screenWidth = screenWidth;

    const typeColors = TOAST_TYPE_COLORS[this.type];
    this.bgColor = options.bgColor ?? typeColors.bg;
    this.gradientEnd = typeColors.gradientEnd;
    this.icon = options.icon ?? typeColors.icon;
    this.textColor = options.textColor ?? '#FFFFFF';
    this.fontSize = options.fontSize ?? DesignTokens.fontSize.md;
  }

  update(dt: number): void {
    if (!this.visible) return;

    this.elapsed += dt * 1000;

    // Slide in animation
    if (this.elapsed < ANIMATION.TOAST_SLIDE_DURATION) {
      this.slideProgress = this.elapsed / ANIMATION.TOAST_SLIDE_DURATION;
    } else if (this.elapsed > this.duration - 300) {
      // Fade out
      this.slideProgress = Math.max(0, (this.duration - this.elapsed) / 300);
    } else {
      this.slideProgress = 1;
    }

    if (this.elapsed >= this.duration) {
      this.visible = false;
    }
  }

  render(renderer: Renderer): void {
    if (!this.visible || this.slideProgress <= 0) return;

    // Slide down from top with easeOutBack
    const easedProgress = this.slideProgress < 1
      ? 1 - Math.pow(1 - this.slideProgress, 3)
      : this.slideProgress;
    const offsetY = (1 - easedProgress) * -50;
    const toastWidth = Math.min(this.screenWidth - 40, 300);
    const toastHeight = 44;
    const x = (this.screenWidth - toastWidth) / 2;
    const y = 60 + offsetY;

    // Shadow
    renderer.drawSoftShadow(
      x + toastWidth / 2, y + toastHeight + 2,
      toastWidth * 0.4, 3,
      6, 'rgba(26, 39, 56, 0.1)',
      LAYERS.OVERLAY - 1,
    );

    // Background with gradient tint
    renderer.fillGradientRoundRect(
      x, y, toastWidth, toastHeight, toastHeight / 2,
      this.bgColor, this.gradientEnd, true, LAYERS.OVERLAY,
    );

    // Subtle white overlay for glass effect
    renderer.setAlpha(0.1, LAYERS.OVERLAY, (ctx) => {
      ctx.fillStyle = '#FFFFFF';
      const r = toastHeight / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + toastWidth - r, y);
      ctx.arcTo(x + toastWidth, y, x + toastWidth, y + r, r);
      ctx.lineTo(x + toastWidth, y + toastHeight - r);
      ctx.arcTo(x + toastWidth, y + toastHeight, x + toastWidth - r, y + toastHeight, r);
      ctx.lineTo(x + r, y + toastHeight);
      ctx.arcTo(x, y + toastHeight, x, y + toastHeight - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      ctx.fill();
    });

    // Icon circle
    const iconCx = x + 22;
    const iconCy = y + toastHeight / 2;
    renderer.setAlpha(0.25, LAYERS.OVERLAY, (ctx) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(iconCx, iconCy, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    renderer.drawText(
      this.icon,
      iconCx,
      iconCy,
      '#FFFFFF',
      this.fontSize - 2,
      'center',
      'middle',
      LAYERS.OVERLAY,
    );

    // Text
    renderer.fillTextWithShadow(
      this.text,
      x + 40,
      y + toastHeight / 2,
      this.textColor,
      'rgba(0,0,0,0.1)',
      this.fontSize,
      2,
      1,
      'left',
      'middle',
      LAYERS.OVERLAY,
    );
  }

  show(): void {
    this.visible = true;
    this.elapsed = 0;
    this.slideProgress = 0;
  }

  hide(): void {
    this.visible = false;
  }

  isVisible(): boolean {
    return this.visible;
  }
}

// Toast Manager - manages multiple toasts
export class ToastManager {
  private toasts: Toast[] = [];
  private screenWidth: number;

  constructor(screenWidth: number) {
    this.screenWidth = screenWidth;
  }

  show(options: ToastOptions): void {
    const toast = new Toast(options, this.screenWidth);
    toast.show();
    this.toasts.push(toast);

    // Limit to 3 toasts
    if (this.toasts.length > 3) {
      this.toasts[0].hide();
      this.toasts.shift();
    }
  }

  update(dt: number): void {
    for (let i = this.toasts.length - 1; i >= 0; i--) {
      this.toasts[i].update(dt);
      if (!this.toasts[i].isVisible()) {
        this.toasts.splice(i, 1);
      }
    }
  }

  render(renderer: Renderer): void {
    for (const toast of this.toasts) {
      toast.render(renderer);
    }
  }
}
