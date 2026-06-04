// ============================================================
// GiftPopup - Gift send/receive popup
// ============================================================

import { Renderer } from '../core/Renderer';
import { GiftType, Friendship } from '../types';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { Button } from './Button';

export interface GiftPopupOptions {
  screenWidth: number;
  screenHeight: number;
  friends: Friendship[];
  onSend?: (friendId: string, giftType: GiftType, message: string) => void;
  onClose?: () => void;
}

const GIFT_TYPES: Array<{ type: GiftType; label: string; icon: string; color: string }> = [
  { type: GiftType.RainCloud, label: '雨云', icon: '🌧️', color: '#64B5F6' },
  { type: GiftType.Breeze, label: '微风', icon: '💨', color: '#81C784' },
  { type: GiftType.Sunlight, label: '阳光', icon: '☀️', color: '#FFD54F' },
  { type: GiftType.Snowflake, label: '雪花', icon: '❄️', color: '#B3E5FC' },
];

export class GiftPopup {
  private screenWidth: number;
  private screenHeight: number;
  private friends: Friendship[];
  private onSend?: (friendId: string, giftType: GiftType, message: string) => void;
  private onClose?: () => void;

  private visible: boolean = false;
  private fadeProgress: number = 0;
  private selectedGiftType: GiftType = GiftType.RainCloud;
  private selectedFriendIndex: number = 0;
  private message: string = '';

  private sendButton: Button;
  private closeButton: Button;
  private giftTypeButtons: Button[] = [];

  private popupWidth: number = 300;
  private popupHeight: number = 380;

  constructor(options: GiftPopupOptions) {
    this.screenWidth = options.screenWidth;
    this.screenHeight = options.screenHeight;
    this.friends = options.friends;
    this.onSend = options.onSend;
    this.onClose = options.onClose;

    this.sendButton = new Button({
      x: 0,
      y: 0,
      width: 120,
      height: 40,
      text: '发送',
      bgColor: DesignTokens.colors.primary,
      borderRadius: 20,
      onTap: () => this.send(),
    });

    this.closeButton = new Button({
      x: 0,
      y: 0,
      width: 28,
      height: 28,
      text: '✕',
      bgColor: 'transparent',
      textColor: DesignTokens.colors.textSecondary,
      borderRadius: 14,
      onTap: () => this.hide(),
    });

    // Gift type selection buttons
    for (let i = 0; i < GIFT_TYPES.length; i++) {
      const gift = GIFT_TYPES[i];
      this.giftTypeButtons.push(
        new Button({
          x: 0,
          y: 0,
          width: 60,
          height: 60,
          text: gift.icon,
          fontSize: 24,
          bgColor: gift.color,
          borderRadius: DesignTokens.borderRadius.md,
          onTap: () => {
            this.selectedGiftType = gift.type;
          },
        }),
      );
    }
  }

  update(dt: number): void {
    if (this.visible) {
      this.fadeProgress = Math.min(this.fadeProgress + dt * 5, 1);
    } else {
      this.fadeProgress = Math.max(this.fadeProgress - dt * 5, 0);
    }

    this.sendButton.update(dt);
    this.closeButton.update(dt);
    for (const btn of this.giftTypeButtons) {
      btn.update(dt);
    }
  }

  render(renderer: Renderer): void {
    if (this.fadeProgress <= 0) return;

    const dx = (this.screenWidth - this.popupWidth) / 2;
    const dy = (this.screenHeight - this.popupHeight) / 2;

    // Overlay
    renderer.setAlpha(this.fadeProgress * 0.5, LAYERS.OVERLAY, (ctx) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    });

    // Popup body
    renderer.fillRoundRect(dx, dy, this.popupWidth, this.popupHeight, DesignTokens.borderRadius.lg, DesignTokens.colors.surface, LAYERS.UI);

    // Title
    renderer.drawText(
      '送出天气礼物',
      dx + this.popupWidth / 2,
      dy + 20,
      DesignTokens.colors.text,
      DesignTokens.fontSize.xl,
      'center',
      'top',
      LAYERS.UI,
    );

    // Close button
    this.closeButton.setPosition(dx + this.popupWidth - 36, dy + 8);
    this.closeButton.render(renderer);

    // Gift type selection
    renderer.drawText(
      '选择礼物',
      dx + 16,
      dy + 56,
      DesignTokens.colors.textSecondary,
      DesignTokens.fontSize.sm,
      'left',
      'top',
      LAYERS.UI,
    );

    const giftStartX = dx + 16;
    const giftY = dy + 78;
    for (let i = 0; i < this.giftTypeButtons.length; i++) {
      const btnX = giftStartX + i * 68;
      this.giftTypeButtons[i].setPosition(btnX, giftY);
      this.giftTypeButtons[i].render(renderer);

      // Label under icon
      renderer.drawText(
        GIFT_TYPES[i].label,
        btnX + 30,
        giftY + 66,
        this.selectedGiftType === GIFT_TYPES[i].type
          ? DesignTokens.colors.primary
          : DesignTokens.colors.textSecondary,
        DesignTokens.fontSize.xs,
        'center',
        'top',
        LAYERS.UI,
      );
    }

    // Friend selection
    renderer.drawText(
      '选择好友',
      dx + 16,
      dy + 160,
      DesignTokens.colors.textSecondary,
      DesignTokens.fontSize.sm,
      'left',
      'top',
      LAYERS.UI,
    );

    const friendY = dy + 182;
    for (let i = 0; i < Math.min(this.friends.length, 3); i++) {
      const friend = this.friends[i];
      const fy = friendY + i * 36;
      const isSelected = i === this.selectedFriendIndex;

      if (isSelected) {
        renderer.fillRoundRect(dx + 12, fy, this.popupWidth - 24, 32, DesignTokens.borderRadius.sm, 'rgba(74,144,217,0.1)', LAYERS.UI);
      }

      renderer.drawText(
        friend.friend_info.nickname,
        dx + 24,
        fy + 16,
        DesignTokens.colors.text,
        DesignTokens.fontSize.md,
        'left',
        'middle',
        LAYERS.UI,
      );
    }

    // Send button
    this.sendButton.setPosition(dx + (this.popupWidth - 120) / 2, dy + this.popupHeight - 56);
    this.sendButton.render(renderer);
  }

  private send(): void {
    if (this.friends.length === 0) return;
    const friend = this.friends[this.selectedFriendIndex];
    if (!friend) return;
    this.onSend?.(friend.friend_id, this.selectedGiftType, this.message);
    this.hide();
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
    this.onClose?.();
  }

  isVisible(): boolean {
    return this.visible || this.fadeProgress > 0;
  }

  setFriends(friends: Friendship[]): void {
    this.friends = friends;
    this.selectedFriendIndex = 0;
  }

  getAllButtons(): Button[] {
    return [this.sendButton, this.closeButton, ...this.giftTypeButtons];
  }
}
