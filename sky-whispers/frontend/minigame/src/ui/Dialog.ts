// ============================================================
// Dialog - Modal dialog with Cloud Whisper aesthetic
// Glass-morphism, gradient confirm button, scale animation
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { Button, ButtonOptions } from './Button';
import { easeOutBack } from '../utils/math';

export interface DialogOptions {
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export class Dialog {
  private title: string;
  private content: string;
  private confirmText: string;
  private cancelText: string;
  private onConfirm?: () => void;
  private onCancel?: () => void;

  private visible: boolean = false;
  private fadeProgress: number = 0;
  private animStartTime: number = 0;
  private confirmButton: Button;
  private cancelButton: Button | null = null;

  private dialogWidth: number = 280;
  private dialogHeight: number = 180;

  constructor(options: DialogOptions) {
    this.title = options.title;
    this.content = options.content;
    this.confirmText = options.confirmText ?? '确定';
    this.cancelText = options.cancelText ?? '取消';
    this.onConfirm = options.onConfirm;
    this.onCancel = options.onCancel;

    this.confirmButton = new Button({
      x: 0,
      y: 0,
      width: 100,
      height: 36,
      text: this.confirmText,
      bgColor: DesignTokens.colors.primary,
      gradientEnd: DesignTokens.colors.primaryLight,
      borderRadius: DesignTokens.borderRadius.lg,
      onTap: () => this.confirm(),
    });

    if (this.cancelText) {
      this.cancelButton = new Button({
        x: 0,
        y: 0,
        width: 100,
        height: 36,
        text: this.cancelText,
        bgColor: 'transparent',
        textColor: DesignTokens.colors.textSecondary,
        borderRadius: DesignTokens.borderRadius.lg,
        onTap: () => this.cancel(),
      });
    }
  }

  update(dt: number): void {
    if (this.visible) {
      this.fadeProgress = Math.min(this.fadeProgress + dt * 5, 1);
    } else {
      this.fadeProgress = Math.max(this.fadeProgress - dt * 5, 0);
    }

    this.confirmButton.update(dt);
    this.cancelButton?.update(dt);
  }

  render(renderer: Renderer): void {
    if (this.fadeProgress <= 0) return;

    const screenW = renderer.width;
    const screenH = renderer.height;
    const dx = (screenW - this.dialogWidth) / 2;
    const dy = (screenH - this.dialogHeight) / 2;

    // Eased animation progress
    const easedProgress = easeOutBack(Math.min(1, this.fadeProgress));
    const scaleValue = 0.9 + 0.1 * easedProgress;

    // Backdrop dimming overlay
    renderer.setAlpha(this.fadeProgress * 0.5, LAYERS.OVERLAY, (ctx) => {
      ctx.fillStyle = '#1A2738';
      ctx.fillRect(0, 0, screenW, screenH);
    });

    // Dialog shadow
    renderer.drawSoftShadow(
      dx + this.dialogWidth / 2, dy + this.dialogHeight / 2 + 6,
      this.dialogWidth * 0.45, this.dialogHeight * 0.4,
      16, 'rgba(26, 39, 56, 0.15)',
      LAYERS.UI - 1,
    );

    // Scale transform for dialog
    const cx = dx + this.dialogWidth / 2;
    const cy = dy + this.dialogHeight / 2;
    const scaledW = this.dialogWidth * scaleValue;
    const scaledH = this.dialogHeight * scaleValue;
    const scaledX = cx - scaledW / 2;
    const scaledY = cy - scaledH / 2;

    // Glass-morphism dialog body
    renderer.fillRoundRect(
      scaledX, scaledY, scaledW, scaledH,
      DesignTokens.borderRadius.xl,
      'rgba(255,255,255,0.92)',
      LAYERS.UI,
    );

    // Subtle border for glass effect
    renderer.setAlpha(0.15, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      const r = DesignTokens.borderRadius.xl;
      ctx.beginPath();
      ctx.moveTo(scaledX + r, scaledY);
      ctx.lineTo(scaledX + scaledW - r, scaledY);
      ctx.arcTo(scaledX + scaledW, scaledY, scaledX + scaledW, scaledY + r, r);
      ctx.lineTo(scaledX + scaledW, scaledY + scaledH - r);
      ctx.arcTo(scaledX + scaledW, scaledY + scaledH, scaledX + scaledW - r, scaledY + scaledH, r);
      ctx.lineTo(scaledX + r, scaledY + scaledH);
      ctx.arcTo(scaledX, scaledY + scaledH, scaledX, scaledY + scaledH - r, r);
      ctx.lineTo(scaledX, scaledY + r);
      ctx.arcTo(scaledX, scaledY, scaledX + r, scaledY, r);
      ctx.closePath();
      ctx.stroke();
    });

    // Gradient accent line at top
    renderer.fillGradientRoundRect(
      scaledX + 20, scaledY + 6, scaledW - 40, 3, 1.5,
      DesignTokens.colors.primary, DesignTokens.colors.accent, false, LAYERS.UI,
    );

    // Title with accent color
    renderer.fillTextWithShadow(
      this.title,
      scaledX + scaledW / 2,
      scaledY + 24,
      DesignTokens.colors.textPrimary,
      'rgba(0,0,0,0.05)',
      DesignTokens.fontSize.lg,
      2,
      1,
      'center',
      'top',
      LAYERS.UI,
    );

    // Content text
    renderer.drawText(
      this.content,
      scaledX + 20,
      scaledY + 55,
      DesignTokens.colors.textSecondary,
      DesignTokens.fontSize.md,
      'left',
      'top',
      LAYERS.UI,
    );

    // Buttons
    const buttonY = scaledY + scaledH - 50;

    // Cancel button (outline style)
    if (this.cancelButton) {
      this.cancelButton.setPosition(scaledX + 16, buttonY);
      // Draw outline for cancel button
      renderer.strokeRoundRect(
        scaledX + 16, buttonY, 100, 36,
        DesignTokens.borderRadius.lg,
        DesignTokens.colors.neutral300,
        1.5,
        LAYERS.UI,
      );
      this.cancelButton.render(renderer);
    }

    // Confirm button (filled gradient)
    this.confirmButton.setPosition(scaledX + scaledW - 116, buttonY);
    this.confirmButton.render(renderer);
  }

  show(): void {
    this.visible = true;
    this.fadeProgress = 0;
    this.animStartTime = Date.now();
  }

  hide(): void {
    this.visible = false;
  }

  private confirm(): void {
    this.hide();
    this.onConfirm?.();
  }

  private cancel(): void {
    this.hide();
    this.onCancel?.();
  }

  isVisible(): boolean {
    return this.visible || this.fadeProgress > 0;
  }

  getButtons(): Button[] {
    const buttons = [this.confirmButton];
    if (this.cancelButton) buttons.push(this.cancelButton);
    return buttons;
  }
}
