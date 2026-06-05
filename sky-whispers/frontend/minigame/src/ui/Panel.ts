// ============================================================
// Panel - Glass-morphism panel with Cloud Whisper aesthetic
// Semi-transparent background, slide-in animation, accent line
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { Button } from './Button';
import { easeOutBack } from '../utils/math';

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
  private slideStartTime: number = 0;
  private isShowing: boolean = false;
  private closeButton: Button | null = null;

  constructor(options: PanelOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.title = options.title;
    this.titleColor = options.titleColor ?? DesignTokens.colors.textPrimary;
    this.bgColor = options.bgColor ?? 'rgba(255,255,255,0.85)';
    this.borderRadius = options.borderRadius ?? DesignTokens.borderRadius.xl;
    this.showClose = options.showClose ?? true;
    this.onClose = options.onClose;

    if (this.showClose) {
      this.closeButton = new Button({
        x: this.x + this.width - 40,
        y: this.y + 10,
        width: 28,
        height: 28,
        text: '✕',
        fontSize: 14,
        bgColor: 'rgba(0,0,0,0.05)',
        textColor: DesignTokens.colors.textTertiary,
        borderRadius: 14,
        onTap: () => this.hide(),
      });
    }
  }

  update(dt: number): void {
    // Animate slide with easeOutBack
    if (this.isShowing) {
      const elapsed = (Date.now() - this.slideStartTime) / ANIMATION.PANEL_SLIDE_DURATION;
      if (elapsed >= 1) {
        this.slideProgress = 1;
      } else {
        this.slideProgress = easeOutBack(Math.min(1, elapsed));
      }
    } else if (!this.visible) {
      this.slideProgress *= 0.85;
      if (this.slideProgress < 0.005) {
        this.slideProgress = 0;
      }
    }

    if (this.closeButton) {
      this.closeButton.update(dt);
    }
  }

  render(renderer: Renderer): void {
    if (!this.visible && this.slideProgress < 0.01) return;

    const offsetY = (1 - this.slideProgress) * 80;

    // Overlay backdrop with dimming
    const backdropAlpha = this.slideProgress * 0.4;
    renderer.setAlpha(backdropAlpha, LAYERS.OVERLAY, (ctx) => {
      ctx.fillStyle = '#1A2738';
      ctx.fillRect(0, 0, renderer.width, renderer.height);
    });

    const panelY = this.y + offsetY;

    // Panel shadow
    renderer.drawSoftShadow(
      this.x + this.width / 2, panelY + this.height / 2 + 8,
      this.width * 0.48, this.height * 0.45,
      16, 'rgba(26, 39, 56, 0.12)',
      LAYERS.UI - 1,
    );

    // Glass-morphism panel body
    renderer.fillRoundRect(
      this.x, panelY, this.width, this.height,
      this.borderRadius, this.bgColor, LAYERS.UI,
    );

    // Subtle border for glass effect
    renderer.setAlpha(0.15, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      const r = Math.min(this.borderRadius, this.width / 2, this.height / 2);
      ctx.beginPath();
      ctx.moveTo(this.x + r, panelY);
      ctx.lineTo(this.x + this.width - r, panelY);
      ctx.arcTo(this.x + this.width, panelY, this.x + this.width, panelY + r, r);
      ctx.lineTo(this.x + this.width, panelY + this.height - r);
      ctx.arcTo(this.x + this.width, panelY + this.height, this.x + this.width - r, panelY + this.height, r);
      ctx.lineTo(this.x + r, panelY + this.height);
      ctx.arcTo(this.x, panelY + this.height, this.x, panelY + this.height - r, r);
      ctx.lineTo(this.x, panelY + r);
      ctx.arcTo(this.x, panelY, this.x + r, panelY, r);
      ctx.closePath();
      ctx.stroke();
    });

    // Gradient accent line at top
    renderer.fillGradientRoundRect(
      this.x + 16, panelY + 4, this.width - 32, 3, 1.5,
      DesignTokens.colors.primary, DesignTokens.colors.accent, false, LAYERS.UI,
    );

    // Title text
    renderer.fillTextWithShadow(
      this.title,
      this.x + 20,
      panelY + 22,
      this.titleColor,
      'rgba(0,0,0,0.05)',
      DesignTokens.fontSize.lg,
      2,
      1,
      'left',
      'top',
      LAYERS.UI,
    );

    // Close button
    if (this.closeButton) {
      this.closeButton.setPosition(this.x + this.width - 40, panelY + 10);
      this.closeButton.render(renderer);
    }
  }

  show(): void {
    this.visible = true;
    this.isShowing = true;
    this.slideStartTime = Date.now();
    this.slideProgress = 0;
  }

  hide(): void {
    this.isShowing = false;
    setTimeout(() => {
      this.visible = false;
      this.onClose?.();
    }, ANIMATION.PANEL_SLIDE_DURATION);
  }

  isVisible(): boolean {
    return this.visible;
  }

  getCloseButton(): Button | null {
    return this.closeButton;
  }

  getContentArea(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x + DesignTokens.spacing.lg,
      y: this.y + 52,
      width: this.width - DesignTokens.spacing.lg * 2,
      height: this.height - 64,
    };
  }
}
