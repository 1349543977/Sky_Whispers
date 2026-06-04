// ============================================================
// Panel - Info panel with slide-in animation
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { Button } from './Button';

export interface PanelOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  titleColor?: string;
  bgColor?: string;
  borderRadius?: number;
  showClose?: boolean;
  onClose?: () => void;
}

export class Panel {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private title: string;
  private titleColor: string;
  private bgColor: string;
  private borderRadius: number;
  private showClose: boolean;
  private onClose?: () => void;
  private visible: boolean = false;
  private slideProgress: number = 0;
  private targetSlideProgress: number = 0;
  private closeButton: Button | null = null;

  constructor(options: PanelOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.title = options.title;
    this.titleColor = options.titleColor ?? DesignTokens.colors.text;
    this.bgColor = options.bgColor ?? DesignTokens.colors.surface;
    this.borderRadius = options.borderRadius ?? DesignTokens.borderRadius.lg;
    this.showClose = options.showClose ?? true;
    this.onClose = options.onClose;

    if (this.showClose) {
      this.closeButton = new Button({
        x: this.x + this.width - 36,
        y: this.y + 8,
        width: 28,
        height: 28,
        text: '✕',
        fontSize: 16,
        bgColor: 'transparent',
        textColor: DesignTokens.colors.textSecondary,
        borderRadius: 14,
        onTap: () => this.hide(),
      });
    }
  }

  update(dt: number): void {
    this.slideProgress += (this.targetSlideProgress - this.slideProgress) * 0.15;

    if (this.closeButton) {
      this.closeButton.update(dt);
    }
  }

  render(renderer: Renderer): void {
    if (!this.visible && this.slideProgress < 0.01) return;

    const offsetY = (1 - this.slideProgress) * 50;

    // Overlay backdrop
    renderer.setAlpha(this.slideProgress * 0.4, LAYERS.OVERLAY, (ctx) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, renderer.width, renderer.height);
    });

    // Panel body
    renderer.fillRoundRect(
      this.x,
      this.y + offsetY,
      this.width,
      this.height,
      this.borderRadius,
      this.bgColor,
      LAYERS.UI,
    );

    // Title bar
    renderer.fillRoundRect(
      this.x,
      this.y + offsetY,
      this.width,
      44,
      this.borderRadius,
      DesignTokens.colors.primary,
      LAYERS.UI,
    );
    // Cover bottom corners of title bar
    renderer.fillRect(
      this.x,
      this.y + offsetY + 30,
      this.width,
      14,
      DesignTokens.colors.primary,
      LAYERS.UI,
    );

    // Title text
    renderer.drawText(
      this.title,
      this.x + 16,
      this.y + offsetY + 14,
      '#FFFFFF',
      DesignTokens.fontSize.lg,
      'left',
      'top',
      LAYERS.UI,
    );

    // Close button
    if (this.closeButton) {
      this.closeButton.setPosition(this.x + this.width - 36, this.y + offsetY + 8);
      this.closeButton.render(renderer);
    }
  }

  show(): void {
    this.visible = true;
    this.targetSlideProgress = 1;
  }

  hide(): void {
    this.targetSlideProgress = 0;
    setTimeout(() => {
      this.visible = false;
      this.onClose?.();
    }, 300);
  }

  isVisible(): boolean {
    return this.visible;
  }

  getCloseButton(): Button | null {
    return this.closeButton;
  }

  getContentArea(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x + 12,
      y: this.y + 52,
      width: this.width - 24,
      height: this.height - 64,
    };
  }
}
