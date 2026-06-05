// ============================================================
// GiftPopup - Gift send/receive popup with Cloud Whisper aesthetic
// Gift box animation, sparkle burst, gradient send button
// ============================================================

import { Renderer } from '../core/Renderer';
import { GiftType, Friendship } from '../types';
import { LAYERS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { Button } from './Button';
import { easeOutBack } from '../utils/math';

export interface GiftPopupOptions {
  screenWidth: number;
  screenHeight: number;
  friends: Friendship[];
  onSend?: (friendId: string, giftType: GiftType, message: string) => void;
  onClose?: () => void;
}

/** Sparkle particle for gift opening */
interface GiftSparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const GIFT_TYPES: Array<{ type: GiftType; label: string; icon: string; color: string; gradientEnd: string }> = [
  { type: GiftType.RainCloud, label: '雨云', icon: '🌧️', color: '#64B5F6', gradientEnd: '#90CAF9' },
  { type: GiftType.Breeze, label: '微风', icon: '💨', color: '#81C784', gradientEnd: '#A5D6A7' },
  { type: GiftType.Sunlight, label: '阳光', icon: '☀️', color: '#FFD54F', gradientEnd: '#FFE082' },
  { type: GiftType.Snowflake, label: '雪花', icon: '❄️', color: '#B3E5FC', gradientEnd: '#E1F5FE' },
];

export class GiftPopup {
  private screenWidth: number;
  private screenHeight: number;
  private friends: Friendship[];
  private onSend?: (friendId: string, giftType: GiftType, message: string) => void;
  private onClose?: () => void;

  private visible: boolean = false;
  private fadeProgress: number = 0;
  private animStartTime: number = 0;
  private selectedGiftType: GiftType = GiftType.RainCloud;
  private selectedFriendIndex: number = 0;
  private message: string = '';

  private sendButton: Button;
  private closeButton: Button;
  private giftTypeButtons: Button[] = [];

  private popupWidth: number = 300;
  private popupHeight: number = 380;

  // Gift box animation
  private giftShakePhase: number = 0;
  private giftOpened: boolean = false;
  private sparkles: GiftSparkle[] = [];

  constructor(options: GiftPopupOptions) {
    this.screenWidth = options.screenWidth;
    this.screenHeight = options.screenHeight;
    this.friends = options.friends;
    this.onSend = options.onSend;
    this.onClose = options.onClose;

    this.sendButton = new Button({
      x: 0,
      y: 0,
      width: 140,
      height: 40,
      text: '发送礼物',
      bgColor: DesignTokens.colors.primary,
      gradientEnd: DesignTokens.colors.primaryLight,
      borderRadius: DesignTokens.borderRadius.xl,
      icon: '🎁',
      onTap: () => this.send(),
    });

    this.closeButton = new Button({
      x: 0,
      y: 0,
      width: 28,
      height: 28,
      text: '✕',
      bgColor: 'rgba(0,0,0,0.05)',
      textColor: DesignTokens.colors.textTertiary,
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
          gradientEnd: gift.gradientEnd,
          borderRadius: DesignTokens.borderRadius.lg,
          onTap: () => {
            this.selectedGiftType = gift.type;
            this.triggerGiftShake();
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

    // Gift shake animation
    if (this.giftShakePhase > 0) {
      this.giftShakePhase -= dt * 3;
      if (this.giftShakePhase <= 0) {
        this.giftShakePhase = 0;
        this.giftOpened = true;
        this.spawnSparkles();
        setTimeout(() => { this.giftOpened = false; }, 600);
      }
    }

    // Update sparkle particles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const p = this.sparkles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vy += 0.03;
      p.life -= dt * 1000;
      if (p.life <= 0) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  render(renderer: Renderer): void {
    if (this.fadeProgress <= 0) return;

    const easedProgress = easeOutBack(Math.min(1, this.fadeProgress));
    const dx = (this.screenWidth - this.popupWidth) / 2;
    const dy = (this.screenHeight - this.popupHeight) / 2;

    // Slide up offset
    const offsetY = (1 - easedProgress) * 60;

    // Overlay
    renderer.setAlpha(this.fadeProgress * 0.5, LAYERS.OVERLAY, (ctx) => {
      ctx.fillStyle = '#1A2738';
      ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
    });

    const popupY = dy + offsetY;

    // Popup shadow
    renderer.drawSoftShadow(
      dx + this.popupWidth / 2, popupY + this.popupHeight / 2 + 8,
      this.popupWidth * 0.45, this.popupHeight * 0.4,
      16, 'rgba(26, 39, 56, 0.15)',
      LAYERS.UI - 1,
    );

    // Glass-morphism popup body
    renderer.fillRoundRect(dx, popupY, this.popupWidth, this.popupHeight, DesignTokens.borderRadius.xl, 'rgba(255,255,255,0.92)', LAYERS.UI);

    // Subtle border
    renderer.setAlpha(0.15, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      const r = DesignTokens.borderRadius.xl;
      ctx.beginPath();
      ctx.moveTo(dx + r, popupY);
      ctx.lineTo(dx + this.popupWidth - r, popupY);
      ctx.arcTo(dx + this.popupWidth, popupY, dx + this.popupWidth, popupY + r, r);
      ctx.lineTo(dx + this.popupWidth, popupY + this.popupHeight - r);
      ctx.arcTo(dx + this.popupWidth, popupY + this.popupHeight, dx + this.popupWidth - r, popupY + this.popupHeight, r);
      ctx.lineTo(dx + r, popupY + this.popupHeight);
      ctx.arcTo(dx, popupY + this.popupHeight, dx, popupY + this.popupHeight - r, r);
      ctx.lineTo(dx, popupY + r);
      ctx.arcTo(dx, popupY, dx + r, popupY, r);
      ctx.closePath();
      ctx.stroke();
    });

    // Gradient accent line at top
    renderer.fillGradientRoundRect(
      dx + 16, popupY + 4, this.popupWidth - 32, 3, 1.5,
      DesignTokens.colors.primary, DesignTokens.colors.accent, false, LAYERS.UI,
    );

    // Title
    renderer.fillTextWithShadow(
      '送出天气礼物',
      dx + this.popupWidth / 2,
      popupY + 22,
      DesignTokens.colors.textPrimary,
      'rgba(0,0,0,0.05)',
      DesignTokens.fontSize.xl,
      2,
      1,
      'center',
      'top',
      LAYERS.UI,
    );

    // Close button
    this.closeButton.setPosition(dx + this.popupWidth - 40, popupY + 10);
    this.closeButton.render(renderer);

    // Gift type selection
    renderer.drawText(
      '选择礼物',
      dx + 16,
      popupY + 56,
      DesignTokens.colors.textSecondary,
      DesignTokens.fontSize.sm,
      'left',
      'top',
      LAYERS.UI,
    );

    const giftStartX = dx + 16;
    const giftY = popupY + 78;
    for (let i = 0; i < this.giftTypeButtons.length; i++) {
      const btnX = giftStartX + i * 68;
      this.giftTypeButtons[i].setPosition(btnX, giftY);

      // Selection indicator ring
      if (this.selectedGiftType === GIFT_TYPES[i].type) {
        renderer.setAlpha(0.2, LAYERS.UI, (ctx) => {
          ctx.strokeStyle = GIFT_TYPES[i].color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(btnX + 30, giftY + 30, 33, 0, Math.PI * 2);
          ctx.stroke();
        });
      }

      this.giftTypeButtons[i].render(renderer);

      // Label under icon
      renderer.drawText(
        GIFT_TYPES[i].label,
        btnX + 30,
        giftY + 66,
        this.selectedGiftType === GIFT_TYPES[i].type
          ? DesignTokens.colors.primary
          : DesignTokens.colors.textTertiary,
        DesignTokens.fontSize.xs,
        'center',
        'top',
        LAYERS.UI,
      );
    }

    // Gift box animation area
    if (this.giftShakePhase > 0 || this.giftOpened) {
      this.renderGiftBox(renderer, dx + this.popupWidth / 2, popupY + 130);
    }

    // Sparkle particles
    for (const sparkle of this.sparkles) {
      const alpha = sparkle.life / sparkle.maxLife;
      renderer.drawSparkle(sparkle.x, sparkle.y, sparkle.size, sparkle.color, alpha, LAYERS.UI);
    }

    // Friend selection
    renderer.drawText(
      '选择好友',
      dx + 16,
      popupY + 160,
      DesignTokens.colors.textSecondary,
      DesignTokens.fontSize.sm,
      'left',
      'top',
      LAYERS.UI,
    );

    const friendY = popupY + 182;
    for (let i = 0; i < Math.min(this.friends.length, 3); i++) {
      const friend = this.friends[i];
      const fy = friendY + i * 36;
      const isSelected = i === this.selectedFriendIndex;

      if (isSelected) {
        renderer.fillRoundRect(dx + 12, fy, this.popupWidth - 24, 32, DesignTokens.borderRadius.sm, DesignTokens.colors.primarySubtle, LAYERS.UI);
      }

      // Avatar circle
      const avatarCx = dx + 28;
      const avatarCy = fy + 16;
      renderer.drawCircle(avatarCx, avatarCy, 10, isSelected ? DesignTokens.colors.primary : DesignTokens.colors.neutral200, true, LAYERS.UI);
      renderer.drawText(
        friend.friend_info.nickname.charAt(0),
        avatarCx,
        avatarCy,
        isSelected ? '#FFFFFF' : DesignTokens.colors.textSecondary,
        DesignTokens.fontSize.xs,
        'center',
        'middle',
        LAYERS.UI,
      );

      renderer.drawText(
        friend.friend_info.nickname,
        dx + 44,
        fy + 16,
        DesignTokens.colors.textPrimary,
        DesignTokens.fontSize.md,
        'left',
        'middle',
        LAYERS.UI,
      );
    }

    // Send button
    this.sendButton.setPosition(dx + (this.popupWidth - 140) / 2, popupY + this.popupHeight - 56);
    this.sendButton.render(renderer);
  }

  private renderGiftBox(renderer: Renderer, cx: number, cy: number): void {
    const shakeX = this.giftShakePhase > 0
      ? Math.sin(this.giftShakePhase * 20) * 3
      : 0;
    const boxScale = this.giftOpened ? 1.1 : 1;

    renderer.setAlpha(0.8, LAYERS.UI, (ctx) => {
      ctx.save();
      ctx.translate(cx + shakeX, cy);
      ctx.scale(boxScale, boxScale);

      // Gift box body
      ctx.fillStyle = DesignTokens.colors.accent;
      ctx.fillRect(-12, -6, 24, 16);

      // Gift box lid
      ctx.fillStyle = DesignTokens.colors.accentDark;
      ctx.fillRect(-14, -10, 28, 6);

      // Ribbon
      ctx.fillStyle = DesignTokens.colors.primary;
      ctx.fillRect(-2, -10, 4, 20);
      ctx.fillRect(-14, -4, 28, 3);

      // Bow
      ctx.beginPath();
      ctx.ellipse(-5, -12, 5, 3, -0.3, 0, Math.PI * 2);
      ctx.ellipse(5, -12, 5, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  private triggerGiftShake(): void {
    this.giftShakePhase = 1;
    this.giftOpened = false;
    this.sparkles = [];
  }

  private spawnSparkles(): void {
    const dx = (this.screenWidth - this.popupWidth) / 2;
    const popupY = (this.screenHeight - this.popupHeight) / 2;
    const cx = dx + this.popupWidth / 2;
    const cy = popupY + 130;

    const colors = [DesignTokens.colors.accent, DesignTokens.colors.accentLight, DesignTokens.colors.primaryLight, '#FFFFFF'];

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      this.sparkles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 500 + Math.random() * 500,
        maxLife: 1000,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
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
    this.fadeProgress = 0;
    this.animStartTime = Date.now();
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
