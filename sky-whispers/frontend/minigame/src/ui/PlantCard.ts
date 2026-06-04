// ============================================================
// PlantCard - Plant info card for codex/inventory
// ============================================================

import { Renderer } from '../core/Renderer';
import { PlantType, PlantGrowthStage, Rarity } from '../types';
import { LAYERS, RARITY_COLORS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { ProgressBar } from './ProgressBar';

export interface PlantCardOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  plantType: PlantType;
  discovered: boolean;
  growthProgress?: number;
  onTap?: () => void;
}

export class PlantCard {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private plantType: PlantType;
  private discovered: boolean;
  private growthProgress: number;
  private onTap?: () => void;
  private progressBar: ProgressBar;

  constructor(options: PlantCardOptions) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.plantType = options.plantType;
    this.discovered = options.discovered;
    this.growthProgress = options.growthProgress ?? 0;
    this.onTap = options.onTap;

    this.progressBar = new ProgressBar({
      x: this.x + 8,
      y: this.y + this.height - 16,
      width: this.width - 16,
      height: 4,
      min: 0,
      max: 1,
      value: this.growthProgress,
      fillColor: DesignTokens.colors.secondary,
      borderRadius: 2,
    });
  }

  update(dt: number): void {
    this.progressBar.update(dt);
  }

  render(renderer: Renderer): void {
    // Card background
    const bgColor = this.discovered ? DesignTokens.colors.surface : '#E0E0E0';
    renderer.fillRoundRect(this.x, this.y, this.width, this.height, DesignTokens.borderRadius.md, bgColor, LAYERS.UI);

    // Border
    const rarityColor = RARITY_COLORS[this.plantType.rarity] ?? RARITY_COLORS[Rarity.Common];
    renderer.strokeRoundRect(this.x, this.y, this.width, this.height, DesignTokens.borderRadius.md, rarityColor, 2, LAYERS.UI);

    if (this.discovered) {
      // Plant sprite area
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

      // Plant icon (using emoji as placeholder)
      const stageVisual = this.plantType.stages[this.plantType.stages.length - 1];
      renderer.drawText(
        '🌱',
        this.x + this.width / 2,
        this.y + 8 + spriteArea / 2,
        stageVisual?.color_primary ?? DesignTokens.colors.secondary,
        24,
        'center',
        'middle',
        LAYERS.UI,
      );

      // Name
      renderer.drawText(
        this.plantType.name,
        this.x + this.width / 2,
        this.y + this.width + 4,
        DesignTokens.colors.text,
        DesignTokens.fontSize.xs,
        'center',
        'top',
        LAYERS.UI,
      );

      // Rarity badge
      renderer.fillRoundRect(
        this.x + 4,
        this.y + 4,
        24,
        14,
        7,
        rarityColor,
        LAYERS.UI,
      );
      renderer.drawText(
        this.plantType.rarity.charAt(0).toUpperCase(),
        this.x + 16,
        this.y + 11,
        '#FFFFFF',
        8,
        'center',
        'middle',
        LAYERS.UI,
      );

      // Progress bar
      this.progressBar.render(renderer);
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
        DesignTokens.colors.textLight,
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

  setGrowthProgress(progress: number): void {
    this.growthProgress = progress;
    this.progressBar.setValue(progress);
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.progressBar.setPosition(x + 8, y + this.height - 16);
  }
}
