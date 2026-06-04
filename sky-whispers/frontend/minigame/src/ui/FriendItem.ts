// ============================================================
// FriendItem - Friend list item
// ============================================================

import { Renderer } from '../core/Renderer';
import { Friendship, User } from '../types';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { Button } from './Button';

export interface FriendItemOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  friendship: Friendship;
  onVisit?: (friendId: string) => void;
  onGift?: (friendId: string) => void;
}

export class FriendItem {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private friendship: Friendship;
  private visitButton: Button;
  private giftButton: Button;

  constructor(options: FriendItemOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.friendship = options.friendship;

    this.visitButton = new Button({
      x: this.x + this.width - 140,
      y: this.y + 8,
      width: 60,
      height: 28,
      text: '拜访',
      fontSize: DesignTokens.fontSize.xs,
      bgColor: DesignTokens.colors.primary,
      borderRadius: 14,
      onTap: () => options.onVisit?.(this.friendship.friend_id),
    });

    this.giftButton = new Button({
      x: this.x + this.width - 72,
      y: this.y + 8,
      width: 60,
      height: 28,
      text: '送礼',
      fontSize: DesignTokens.fontSize.xs,
      bgColor: DesignTokens.colors.accent,
      borderRadius: 14,
      onTap: () => options.onGift?.(this.friendship.friend_id),
    });
  }

  update(dt: number): void {
    this.visitButton.update(dt);
    this.giftButton.update(dt);
  }

  render(renderer: Renderer): void {
    // Background
    renderer.fillRoundRect(
      this.x,
      this.y,
      this.width,
      this.height,
      DesignTokens.borderRadius.md,
      DesignTokens.colors.surface,
      LAYERS.UI,
    );

    // Avatar placeholder
    renderer.drawCircle(
      this.x + 28,
      this.y + this.height / 2,
      18,
      DesignTokens.colors.primaryLight,
      true,
      LAYERS.UI,
    );
    renderer.drawText(
      this.friendship.friend_info.nickname.charAt(0),
      this.x + 28,
      this.y + this.height / 2,
      '#FFFFFF',
      DesignTokens.fontSize.lg,
      'center',
      'middle',
      LAYERS.UI,
    );

    // Online indicator
    renderer.drawCircle(
      this.x + 40,
      this.y + this.height / 2 + 12,
      4,
      DesignTokens.colors.success,
      true,
      LAYERS.UI,
    );

    // Name
    renderer.drawText(
      this.friendship.friend_info.nickname,
      this.x + 54,
      this.y + 14,
      DesignTokens.colors.text,
      DesignTokens.fontSize.md,
      'left',
      'top',
      LAYERS.UI,
    );

    // Level
    renderer.drawText(
      `Lv.${this.friendship.friend_info.level}`,
      this.x + 54,
      this.y + 32,
      DesignTokens.colors.textSecondary,
      DesignTokens.fontSize.xs,
      'left',
      'top',
      LAYERS.UI,
    );

    // Buttons
    this.visitButton.render(renderer);
    this.giftButton.render(renderer);
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.visitButton.setPosition(x + this.width - 140, y + 8);
    this.giftButton.setPosition(x + this.width - 72, y + 8);
  }

  getButtons(): Button[] {
    return [this.visitButton, this.giftButton];
  }
}
