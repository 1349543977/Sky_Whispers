// ============================================================
// Island - Floating island entity with Cloud Whisper aesthetic
// ============================================================

import { Island as IslandData, IslandSkin } from '../types';
import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';

/** Small decorative element placed on the island surface */
interface DecorElement {
  type: 'flower' | 'pebble' | 'grass_tuft';
  offsetX: number;
  offsetY: number;
  size: number;
  color: string;
  phase: number;
}

export class Island {
  private data: IslandData;
  private skin: IslandSkin | null = null;
  private x: number;
  private y: number;
  private baseY: number;
  private width: number;
  private height: number;
  private bobOffset: number = 0;
  private breatheOffset: number = 0;
  private time: number = 0;
  private decors: DecorElement[] = [];
  private decorsInitialized: boolean = false;

  constructor(data: IslandData, x: number, y: number) {
    this.data = data;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.width = 280;
    this.height = 180;
  }

  update(dt: number): void {
    this.time += dt * 1000;
    this.bobOffset = Math.sin(this.time * ANIMATION.ISLAND_BOB_SPEED) * ANIMATION.ISLAND_BOB_AMPLITUDE;
    this.breatheOffset = Math.sin(this.time * ANIMATION.ISLAND_BREATHE_SPEED) * ANIMATION.ISLAND_BREATHE_AMPLITUDE;
    this.y = this.baseY + this.bobOffset;
  }

  render(renderer: Renderer): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const grassColor = this.skin?.grass_color ?? COLORS.ISLAND_GRASS;
    const baseColor = this.skin?.base_color ?? COLORS.ISLAND_BASE;

    // Initialize decorations once (depends on position)
    if (!this.decorsInitialized) {
      this.initDecorations();
      this.decorsInitialized = true;
    }

    // === Layer 1: Soft shadow beneath island ===
    renderer.drawSoftShadow(
      cx,
      this.y + this.height + 14,
      this.width / 2 - 8,
      14,
      10,
      'rgba(26, 39, 56, 0.10)',
      LAYERS.ENTITIES,
    );

    // === Layer 2: Bottom glow (floating light) ===
    renderer.drawRadialGlow(
      cx,
      this.y + this.height - 10,
      0,
      this.width / 2 + 10,
      'rgba(126, 181, 214, 0.12)',
      'rgba(126, 181, 214, 0)',
      LAYERS.ENTITIES,
    );

    // === Layer 3: Island earth (dirt) with gradient ===
    renderer.fillGradientRoundRect(
      this.x + 20 + this.breatheOffset * 0.3,
      this.y + 40,
      this.width - 40 - this.breatheOffset * 0.6,
      this.height - 40,
      22,
      COLORS.ISLAND_DIRT,
      COLORS.ISLAND_DIRT_DARK,
      true,
      LAYERS.ENTITIES,
    );

    // === Layer 4: Dirt texture - subtle horizontal bands ===
    this.renderDirtBands(renderer);

    // === Layer 5: Island grass top with gradient ===
    renderer.fillGradientRoundRect(
      this.x + 10 + this.breatheOffset * 0.5,
      this.y + 20,
      this.width - 20 - this.breatheOffset,
      this.height - 50,
      26,
      grassColor,
      baseColor,
      true,
      LAYERS.ENTITIES,
    );

    // === Layer 6: Grass surface highlight (top edge) ===
    renderer.fillGradientRoundRect(
      this.x + 20 + this.breatheOffset * 0.5,
      this.y + 20,
      this.width - 40 - this.breatheOffset,
      18,
      12,
      COLORS.ISLAND_GRASS_HIGHLIGHT,
      grassColor,
      true,
      LAYERS.ENTITIES,
    );

    // === Layer 7: Organic grass bumps along top edge ===
    this.renderGrassBumps(renderer);

    // === Layer 8: Waterfall/mist on island edge ===
    this.renderWaterfallMist(renderer);

    // === Layer 9: Decorative elements (flowers, pebbles) ===
    this.renderDecorations(renderer);

    // === Layer 10: Plant slots ===
    this.renderSlots(renderer);

    // === Layer 11: Expansion slots (locked) ===
    this.renderLockedSlots(renderer);
  }

  /** Render subtle horizontal bands on the dirt for texture */
  private renderDirtBands(renderer: Renderer): void {
    const dirtX = this.x + 30;
    const dirtY = this.y + 55;
    const dirtW = this.width - 60;

    for (let i = 0; i < 3; i++) {
      const bandY = dirtY + 12 + i * 14;
      renderer.addCommand({
        layer: LAYERS.ENTITIES,
        draw: (ctx) => {
          ctx.save();
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = COLORS.ISLAND_DIRT_DARK;
          ctx.beginPath();
          ctx.moveTo(dirtX + 8, bandY);
          ctx.lineTo(dirtX + dirtW - 8, bandY);
          ctx.quadraticCurveTo(dirtX + dirtW, bandY, dirtX + dirtW - 4, bandY + 3);
          ctx.lineTo(dirtX + 4, bandY + 3);
          ctx.quadraticCurveTo(dirtX, bandY, dirtX + 8, bandY);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        },
      });
    }
  }

  /** Render organic grass bumps along the top edge of the island */
  private renderGrassBumps(renderer: Renderer): void {
    const grassY = this.y + 22;
    const grassStartX = this.x + 18;
    const grassEndX = this.x + this.width - 18;
    const bumpCount = 9;

    for (let i = 0; i < bumpCount; i++) {
      const t = i / (bumpCount - 1);
      const bx = grassStartX + t * (grassEndX - grassStartX);
      const bumpHeight = 4 + Math.sin(this.time * 0.001 + i * 1.3) * 1.5;
      const bumpWidth = 8 + Math.sin(i * 2.1) * 2;

      renderer.addCommand({
        layer: LAYERS.ENTITIES,
        draw: (ctx) => {
          ctx.save();
          ctx.fillStyle = COLORS.ISLAND_GRASS_HIGHLIGHT;
          ctx.beginPath();
          ctx.moveTo(bx - bumpWidth / 2, grassY + 4);
          ctx.quadraticCurveTo(bx, grassY - bumpHeight, bx + bumpWidth / 2, grassY + 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        },
      });
    }
  }

  /** Render a subtle waterfall mist on the right edge of the island */
  private renderWaterfallMist(renderer: Renderer): void {
    const mistX = this.x + this.width - 28;
    const mistTopY = this.y + 50;
    const mistBottomY = this.y + this.height - 10;

    // Waterfall stream
    renderer.addCommand({
      layer: LAYERS.ENTITIES,
      draw: (ctx) => {
        ctx.save();
        const gradient = ctx.createLinearGradient(mistX, mistTopY, mistX, mistBottomY);
        gradient.addColorStop(0, 'rgba(168, 212, 236, 0.3)');
        gradient.addColorStop(0.5, 'rgba(168, 212, 236, 0.5)');
        gradient.addColorStop(1, 'rgba(168, 212, 236, 0.0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(mistX - 3, mistTopY);
        ctx.quadraticCurveTo(
          mistX - 1 + Math.sin(this.time * 0.003) * 2,
          (mistTopY + mistBottomY) / 2,
          mistX - 5,
          mistBottomY,
        );
        ctx.lineTo(mistX + 5, mistBottomY);
        ctx.quadraticCurveTo(
          mistX + 3 + Math.sin(this.time * 0.003 + 1) * 2,
          (mistTopY + mistBottomY) / 2,
          mistX + 3,
          mistTopY,
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      },
    });

    // Mist cloud at bottom
    const mistAlpha = 0.15 + Math.sin(this.time * 0.002) * 0.05;
    renderer.drawOrganicBlob(
      mistX,
      mistBottomY + 4,
      16,
      8,
      3,
      COLORS.WATER_LIGHT,
      mistAlpha,
      LAYERS.EFFECTS,
    );
  }

  /** Initialize decorative elements with deterministic positions */
  private initDecorations(): void {
    const flowerColors = [
      DesignTokens.colors.tertiary,
      DesignTokens.colors.accentLight,
      DesignTokens.colors.primaryLight,
      '#F8E0E6',
    ];
    const pebbleColors = ['#B0A898', '#A8A098', '#C0B8A8'];

    // Deterministic pseudo-random based on island position
    const seed = this.x * 7 + this.y * 13;
    const seededRandom = (i: number) => {
      const x = Math.sin(seed + i * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };

    // Flowers along the top edge
    for (let i = 0; i < 5; i++) {
      const t = 0.1 + seededRandom(i) * 0.8;
      this.decors.push({
        type: 'flower',
        offsetX: t * this.width,
        offsetY: 28 + seededRandom(i + 10) * 8,
        size: 3 + seededRandom(i + 20) * 2,
        color: flowerColors[i % flowerColors.length],
        phase: seededRandom(i + 30) * Math.PI * 2,
      });
    }

    // Pebbles on the dirt
    for (let i = 0; i < 3; i++) {
      const t = 0.15 + seededRandom(i + 50) * 0.7;
      this.decors.push({
        type: 'pebble',
        offsetX: t * this.width,
        offsetY: 60 + seededRandom(i + 60) * 40,
        size: 2 + seededRandom(i + 70) * 2,
        color: pebbleColors[i % pebbleColors.length],
        phase: seededRandom(i + 80) * Math.PI * 2,
      });
    }

    // Grass tufts
    for (let i = 0; i < 4; i++) {
      const t = 0.08 + seededRandom(i + 90) * 0.84;
      this.decors.push({
        type: 'grass_tuft',
        offsetX: t * this.width,
        offsetY: 30 + seededRandom(i + 100) * 6,
        size: 4 + seededRandom(i + 110) * 3,
        color: COLORS.ISLAND_GRASS_HIGHLIGHT,
        phase: seededRandom(i + 120) * Math.PI * 2,
      });
    }
  }

  /** Render all decorative elements */
  private renderDecorations(renderer: Renderer): void {
    for (const decor of this.decors) {
      const dx = this.x + decor.offsetX;
      const dy = this.y + decor.offsetY;
      const sway = Math.sin(this.time * 0.002 + decor.phase) * 1;

      switch (decor.type) {
        case 'flower':
          this.renderFlower(renderer, dx + sway, dy, decor.size, decor.color);
          break;
        case 'pebble':
          this.renderPebble(renderer, dx, dy, decor.size, decor.color);
          break;
        case 'grass_tuft':
          this.renderGrassTuft(renderer, dx + sway, dy, decor.size, decor.color);
          break;
      }
    }
  }

  /** Render a small flower */
  private renderFlower(renderer: Renderer, x: number, y: number, size: number, color: string): void {
    // Petals
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * size;
      const py = y + Math.sin(angle) * size;
      renderer.drawCircle(px, py, size * 0.6, color, true, LAYERS.ENTITIES);
    }
    // Center
    renderer.drawCircle(x, y, size * 0.4, DesignTokens.colors.accent, true, LAYERS.ENTITIES);
  }

  /** Render a small pebble */
  private renderPebble(renderer: Renderer, x: number, y: number, size: number, color: string): void {
    renderer.addCommand({
      layer: LAYERS.ENTITIES,
      draw: (ctx) => {
        ctx.save();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.7, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
    });
  }

  /** Render a small grass tuft */
  private renderGrassTuft(renderer: Renderer, x: number, y: number, size: number, color: string): void {
    renderer.addCommand({
      layer: LAYERS.ENTITIES,
      draw: (ctx) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        // Three blades
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(x + i * 2, y);
          ctx.quadraticCurveTo(x + i * 3, y - size, x + i * 4, y - size * 1.5);
          ctx.stroke();
        }
        ctx.restore();
      },
    });
  }

  private renderSlots(renderer: Renderer): void {
    const slotSize = 40;
    const startX = this.x + 30;
    const startY = this.y + 50;
    const cols = 3;
    const gap = 10;

    for (const slot of this.data.plant_slots) {
      if (!slot.is_unlocked) continue;

      const col = slot.slot_index % cols;
      const row = Math.floor(slot.slot_index / cols);
      const sx = startX + col * (slotSize + gap);
      const sy = startY + row * (slotSize + gap);
      const slotCx = sx + slotSize / 2;
      const slotCy = sy + slotSize / 2;

      // Slot background with gradient
      renderer.fillGradientRoundRect(
        sx,
        sy,
        slotSize,
        slotSize,
        10,
        'rgba(0,0,0,0.06)',
        'rgba(0,0,0,0.12)',
        true,
        LAYERS.ENTITIES,
      );

      // Empty slot indicator with glow
      if (!slot.plant_id) {
        // Pulsing glow for empty slots
        const glowAlpha = 0.15 + Math.sin(this.time * 0.003 + slot.slot_index) * 0.08;
        renderer.drawRadialGlow(
          slotCx,
          slotCy,
          0,
          slotSize / 2 - 2,
          `rgba(168, 220, 192, ${glowAlpha})`,
          'rgba(168, 220, 192, 0)',
          LAYERS.ENTITIES,
        );

        renderer.strokeRoundRect(
          sx + 6,
          sy + 6,
          slotSize - 12,
          slotSize - 12,
          8,
          'rgba(255,255,255,0.35)',
          1.5,
          LAYERS.ENTITIES,
        );
        renderer.drawText(
          '+',
          slotCx,
          slotCy,
          'rgba(255,255,255,0.5)',
          20,
          'center',
          'middle',
          LAYERS.ENTITIES,
        );
      }
    }
  }

  private renderLockedSlots(renderer: Renderer): void {
    const totalSlots = this.data.expansion_slots;
    const unlockedCount = this.data.plant_slots.filter((s) => s.is_unlocked).length;
    const slotSize = 40;
    const startX = this.x + 30;
    const startY = this.y + 50;
    const cols = 3;
    const gap = 10;

    for (let i = unlockedCount; i < totalSlots; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = startX + col * (slotSize + gap);
      const sy = startY + row * (slotSize + gap);

      renderer.fillGradientRoundRect(
        sx,
        sy,
        slotSize,
        slotSize,
        10,
        'rgba(0,0,0,0.12)',
        'rgba(0,0,0,0.22)',
        true,
        LAYERS.ENTITIES,
      );
      renderer.drawText(
        '🔒',
        sx + slotSize / 2,
        sy + slotSize / 2,
        'rgba(255,255,255,0.3)',
        14,
        'center',
        'middle',
        LAYERS.ENTITIES,
      );
    }
  }

  setData(data: IslandData): void {
    this.data = data;
  }

  setSkin(skin: IslandSkin): void {
    this.skin = skin;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getSlotPosition(slotIndex: number): { x: number; y: number } {
    const slotSize = 40;
    const startX = this.x + 30;
    const startY = this.y + 50;
    const cols = 3;
    const gap = 10;
    const col = slotIndex % cols;
    const row = Math.floor(slotIndex / cols);
    return {
      x: startX + col * (slotSize + gap),
      y: startY + row * (slotSize + gap),
    };
  }

  containsPoint(px: number, py: number): boolean {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }
}
