// ============================================================
// Plant - Plant entity with growth stages and animations
// ============================================================

import { Plant as PlantData, PlantType, PlantGrowthStage } from '../types';
import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS, ANIMATION } from '../utils/constants';
import { lerp, clamp } from '../utils/math';

export class Plant {
  private data: PlantData;
  private type: PlantType;
  private x: number;
  private y: number;
  private time: number = 0;
  private swayOffset: number = 0;
  private sparkleTime: number = 0;
  private highlightAlpha: number = 0;
  private width: number = 36;
  private height: number = 36;

  constructor(data: PlantData, type: PlantType, x: number, y: number) {
    this.data = data;
    this.type = type;
    this.x = x;
    this.y = y;
  }

  update(dt: number): void {
    this.time += dt * 1000;
    this.swayOffset = Math.sin(this.time * ANIMATION.PLANT_SWAY_SPEED) * ANIMATION.PLANT_SWAY_AMPLITUDE;

    if (this.data.growth_stage === PlantGrowthStage.Mature) {
      this.sparkleTime += dt * 1000;
    }

    // Decay highlight
    if (this.highlightAlpha > 0) {
      this.highlightAlpha = Math.max(0, this.highlightAlpha - dt * 3);
    }
  }

  render(renderer: Renderer): void {
    const stageVisual = this.type.stages.find(
      (s) => s.stage === this.data.growth_stage,
    );
    if (!stageVisual) return;

    const cx = this.x + this.width / 2 + this.swayOffset;
    const cy = this.y + this.height / 2;

    // Highlight effect
    if (this.highlightAlpha > 0) {
      renderer.drawCircle(
        cx,
        cy,
        this.width / 2 + 4,
        `rgba(255,255,255,${this.highlightAlpha * 0.5})`,
        true,
        LAYERS.ENTITIES,
      );
    }

    // Draw based on growth stage
    switch (this.data.growth_stage) {
      case PlantGrowthStage.Seed:
        this.renderSeed(renderer, cx, cy);
        break;
      case PlantGrowthStage.Sprout:
        this.renderSprout(renderer, cx, cy);
        break;
      case PlantGrowthStage.Growing:
        this.renderGrowing(renderer, cx, cy);
        break;
      case PlantGrowthStage.Mature:
        this.renderMature(renderer, cx, cy);
        break;
    }

    // Growth progress bar
    if (this.data.growth_stage < PlantGrowthStage.Mature) {
      this.renderProgressBar(renderer);
    }

    // Sparkle effect for mature plants
    if (this.data.growth_stage === PlantGrowthStage.Mature) {
      this.renderSparkle(renderer, cx, cy);
    }

    // Watered indicator
    if (this.data.is_watered) {
      renderer.drawCircle(
        cx + this.width / 2 - 2,
        cy - this.height / 2 + 2,
        3,
        COLORS.WATER,
        true,
        LAYERS.ENTITIES,
      );
    }
  }

  private renderSeed(renderer: Renderer, cx: number, cy: number): void {
    // Small seed mound
    renderer.fillRoundRect(cx - 6, cy + 4, 12, 8, 4, COLORS.PLANT_SEED, LAYERS.ENTITIES);
    // Seed dot
    renderer.drawCircle(cx, cy + 6, 3, COLORS.ISLAND_DIRT, true, LAYERS.ENTITIES);
  }

  private renderSprout(renderer: Renderer, cx: number, cy: number): void {
    // Stem
    renderer.fillRect(cx - 1.5, cy - 4, 3, 14, COLORS.PLANT_SPROUT, LAYERS.ENTITIES);
    // Two small leaves
    renderer.fillRoundRect(cx - 8, cy - 6, 8, 5, 2, COLORS.PLANT_SPROUT, LAYERS.ENTITIES);
    renderer.fillRoundRect(cx + 1, cy - 6, 8, 5, 2, COLORS.PLANT_SPROUT, LAYERS.ENTITIES);
  }

  private renderGrowing(renderer: Renderer, cx: number, cy: number): void {
    // Taller stem
    renderer.fillRect(cx - 2, cy - 12, 4, 22, COLORS.PLANT_GROWING, LAYERS.ENTITIES);
    // Larger leaves
    renderer.fillRoundRect(cx - 12, cy - 8, 10, 7, 3, COLORS.PLANT_GROWING, LAYERS.ENTITIES);
    renderer.fillRoundRect(cx + 3, cy - 8, 10, 7, 3, COLORS.PLANT_GROWING, LAYERS.ENTITIES);
    // Top bud
    renderer.drawCircle(cx, cy - 14, 5, COLORS.PLANT_GROWING, true, LAYERS.ENTITIES);
  }

  private renderMature(renderer: Renderer, cx: number, cy: number): void {
    // Full stem
    renderer.fillRect(cx - 2.5, cy - 16, 5, 26, COLORS.PLANT_MATURE, LAYERS.ENTITIES);
    // Full leaves
    renderer.fillRoundRect(cx - 14, cy - 4, 12, 8, 4, COLORS.PLANT_GROWING, LAYERS.ENTITIES);
    renderer.fillRoundRect(cx + 3, cy - 4, 12, 8, 4, COLORS.PLANT_GROWING, LAYERS.ENTITIES);
    // Flower/bloom
    const bloomColor = this.type.stages[3]?.color_primary ?? '#FF6B6B';
    renderer.drawCircle(cx, cy - 18, 8, bloomColor, true, LAYERS.ENTITIES);
    // Flower center
    renderer.drawCircle(cx, cy - 18, 3, '#FFE082', true, LAYERS.ENTITIES);
  }

  private renderProgressBar(renderer: Renderer): void {
    const barWidth = this.width - 4;
    const barHeight = 4;
    const barX = this.x + 2;
    const barY = this.y + this.height + 2;
    const progress = clamp(this.data.growth_progress, 0, 1);

    // Background
    renderer.fillRoundRect(barX, barY, barWidth, barHeight, 2, 'rgba(0,0,0,0.2)', LAYERS.ENTITIES);
    // Fill
    if (progress > 0) {
      renderer.fillRoundRect(
        barX,
        barY,
        barWidth * progress,
        barHeight,
        2,
        COLORS.PLANT_GROWING,
        LAYERS.ENTITIES,
      );
    }
  }

  private renderSparkle(renderer: Renderer, cx: number, cy: number): void {
    const sparkleCount = 3;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (this.sparkleTime * 0.002 + (i * Math.PI * 2) / sparkleCount) % (Math.PI * 2);
      const radius = 14 + Math.sin(this.sparkleTime * 0.003 + i) * 4;
      const sx = cx + Math.cos(angle) * radius;
      const sy = cy - 8 + Math.sin(angle) * radius * 0.6;
      const alpha = 0.5 + Math.sin(this.sparkleTime * 0.005 + i * 2) * 0.3;

      renderer.setAlpha(alpha, LAYERS.EFFECTS, (ctx) => {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  setHighlight(): void {
    this.highlightAlpha = 1;
  }

  containsPoint(px: number, py: number): boolean {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  getData(): PlantData {
    return this.data;
  }

  updateData(data: PlantData): void {
    this.data = data;
  }

  getType(): PlantType {
    return this.type;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
