// ============================================================
// Dialog - Modal dialog with fade animation
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { Button, ButtonOptions } from './Button';

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
      onTap: () => this.confirm(),
    });

    if (this.cancelText) {
      this.cancelButton = new Button({
        x: 0,
        y: 0,
        width: 100,
        height: 36,
        text: this.cancelText,
        bgColor: DesignTokens.colors.textLight,
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

    // Overlay
    renderer.setAlpha(this.fadeProgress * 0.5, LAYERS.OVERLAY, (ctx) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, screenW, screenH);
    });

    // Dialog body
    renderer.setAlpha(this.fadeProgress, LAYERS.UI, (ctx) => {
      ctx.fillStyle = DesignTokens.colors.surface;
    });
    renderer.fillRoundRect(dx, dy, this.dialogWidth, this.dialogHeight, DesignTokens.borderRadius.lg, DesignTokens.colors.surface, LAYERS.UI);

    // Title
    renderer.drawText(
      this.title,
      dx + this.dialogWidth / 2,
      dy + 20,
      DesignTokens.colors.text,
      DesignTokens.fontSize.lg,
      'center',
      'top',
      LAYERS.UI,
    );

    // Content
    renderer.drawText(
      this.content,
      dx + 20,
      dy + 55,
      DesignTokens.colors.textSecondary,
      DesignTokens.fontSize.md,
      'left',
      'top',
      LAYERS.UI,
    );

    // Buttons
    const buttonY = dy + this.dialogHeight - 50;
    if (this.cancelButton) {
      this.cancelButton.setPosition(dx + 20, buttonY);
      this.cancelButton.render(renderer);
    }
    this.confirmButton.setPosition(dx + this.dialogWidth - 120, buttonY);
    this.confirmButton.render(renderer);
  }

  show(): void {
    this.visible = true;
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
