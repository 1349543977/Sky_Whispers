// ============================================================
// SpriteCard - Sprite info card for codex
// ============================================================

import { Renderer } from '../core/Renderer';
import { SpriteType, Rarity } from '../types';
import { LAYERS, RARITY_COLORS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export interface SpriteCardOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  spriteType: SpriteType;
  discovered: boolean;
  level?: number;
  happiness?: number;
  onTap?: () => void;
}

export class SpriteCard {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private spriteType: SpriteType;
  private discovered: boolean;
  private level: number;
  private happiness: number;
  private onTap?: () => void;

  constructor(options: SpriteCardOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.spriteType = options.spriteType;
    this.discovered = options.discovered;
    this.level = options.level ?? 1;
    this.happiness = options.happiness ?? 100;
    this.onTap = options.onTap;
  }

  update(_dt: number): void {
    // No continuous updates needed
  }

  render(renderer: Renderer): void {
    // Card background
    const bgColor = this.discovered ? DesignTokens.colors.surface : '#E0E0E0';
    renderer.fillRoundRect(this.x, this.y, this.width, this.height, DesignTokens.borderRadius.md, bgColor, LAYERS.UI);

    // Border
    const rarityColor = RARITY_COLORS[this.spriteType.rarity] ?? RARITY_COLORS[Rarity.Common];
    renderer.strokeRoundRect(this.x, this.y, this.width, this.height, DesignTokens.borderRadius.md, rarityColor, 2, LAYERS.UI);

    if (this.discovered) {
      // Sprite visual area
      const spriteArea = this.width - 16;
      renderer.fillRoundRect(
        this.x + 8,
        this.y + 8,
        spriteArea,
        spriteArea,
        DesignTokens.borderRadius.sm,
        'rgba(0,0,0,0.05)',
        LAYERS.UI,
      );

      // Sprite body (colored circle)
      const cx = this.x + this.width / 2;
      const cy = this.y + 8 + spriteArea / 2;
      renderer.drawCircle(cx, cy, spriteArea / 3, this.spriteType.color_primary, true, LAYERS.UI);

      // Eyes
      renderer.drawCircle(cx - 5, cy - 3, 3, '#FFFFFF', true, LAYERS.UI);
      renderer.drawCircle(cx + 5, cy - 3, 3, '#FFFFFF', true, LAYERS.UI);
      renderer.drawCircle(cx - 5, cy - 3, 1.5, '#2C3E50', true, LAYERS.UI);
      renderer.drawCircle(cx + 5, cy - 3, 1.5, '#2C3E50', true, LAYERS.UI);

      // Name
      renderer.drawText(
        this.spriteType.name,
        this.x + this.width / 2,
        this.y + spriteArea + 16,
        DesignTokens.colors.textPrimary,
        DesignTokens.fontSize.xs,
        'center',
        'top',
        LAYERS.UI,
      );

      // Level badge
      renderer.fillRoundRect(
        this.x + 4,
        this.y + 4,
        28,
        14,
        7,
        rarityColor,
        LAYERS.UI,
      );
      renderer.drawText(
        `Lv${this.level}`,
        this.x + 18,
        this.y + 11,
        '#FFFFFF',
        8,
        'center',
        'middle',
        LAYERS.UI,
      );

      // Happiness indicator
      const heartColor = this.happiness > 60 ? '#E74C3C' : this.happiness > 30 ? '#F39C12' : '#95A5A6';
      renderer.drawText(
        '❤',
        this.x + this.width - 14,
        this.y + 10,
        heartColor,
        10,
        'center',
        'middle',
        LAYERS.UI,
      );
    } else {
      // Silhouette
      renderer.setAlpha(0.3, LAYERS.UI, (ctx) => {
        ctx.fillStyle = '#000000';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', this.x + this.width / 2, this.y + this.width / 2);
      });

      renderer.drawText(
        '???',
        this.x + this.width / 2,
        this.y + this.width + 4,
        DesignTokens.colors.textTertiary,
        DesignTokens.fontSize.xs,
        'center',
        'top',
        LAYERS.UI,
      );
    }
  }

  handleTap(x: number, y: number): boolean {
    if (
      x >= this.x && x <= this.x + this.width &&
      y >= this.y && y <= this.y + this.height
    ) {
      this.onTap?.();
      return true;
    }
    return false;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
