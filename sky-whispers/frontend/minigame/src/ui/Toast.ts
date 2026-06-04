// ============================================================
// Toast - Auto-dismiss notification
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export interface ToastOptions {
  text: string;
  icon?: string;
  duration?: number;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
}

export class Toast {
  private text: string;
  private icon: string;
  private duration: number;
  private bgColor: string;
  private textColor: string;
  private fontSize: number;

  private visible: boolean = false;
  private elapsed: number = 0;
  private slideProgress: number = 0;
  private screenWidth: number = 375;

  constructor(options: ToastOptions, screenWidth: number) {
    this.text = options.text;
    this.icon = options.icon ?? '';
    this.duration = options.duration ?? 2000;
    this.bgColor = options.bgColor ?? 'rgba(0,0,0,0.75)';
    this.textColor = options.textColor ?? '#FFFFFF';
    this.fontSize = options.fontSize ?? DesignTokens.fontSize.md;
    this.screenWidth = screenWidth;
  }

  update(dt: number): void {
    if (!this.visible) return;

    this.elapsed += dt * 1000;

    // Slide in
    if (this.elapsed < 200) {
      this.slideProgress = this.elapsed / 200;
    } else if (this.elapsed > this.duration - 300) {
      // Slide out
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

    const offsetY = (1 - this.slideProgress) * -40;
    const toastWidth = Math.min(this.screenWidth - 40, 300);
    const toastHeight = 44;
    const x = (this.screenWidth - toastWidth) / 2;
    const y = 60 + offsetY;

    // Background
    renderer.fillRoundRect(x, y, toastWidth, toastHeight, DesignTokens.borderRadius.lg, this.bgColor, LAYERS.OVERLAY);

    // Icon
    let textX = x + toastWidth / 2;
    if (this.icon) {
      renderer.drawText(
        this.icon,
        x + 16,
        y + toastHeight / 2,
        this.textColor,
        this.fontSize + 2,
        'left',
        'middle',
        LAYERS.OVERLAY,
      );
      textX = x + 40;
    }

    // Text
    renderer.drawText(
      this.text,
      textX,
      y + toastHeight / 2,
      this.textColor,
      this.fontSize,
      'center',
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
