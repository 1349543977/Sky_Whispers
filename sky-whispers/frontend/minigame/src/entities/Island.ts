// ============================================================
// Island - Floating island entity with slots and skin
// ============================================================

import { Island as IslandData, IslandSkin } from '../types';
import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS, ANIMATION } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export class Island {
  private data: IslandData;
  private skin: IslandSkin | null = null;
  private x: number;
  private y: number;
  private baseY: number;
  private width: number;
  private height: number;
  private bobOffset: number = 0;
  private time: number = 0;

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
    this.y = this.baseY + this.bobOffset;
  }

  render(renderer: Renderer): void {
    const baseColor = this.skin?.base_color ?? COLORS.ISLAND_BASE;
    const grassColor = this.skin?.grass_color ?? COLORS.ISLAND_GRASS;
    const dirtColor = COLORS.ISLAND_DIRT;

    // Island shadow
    renderer.setAlpha(0.15, LAYERS.ENTITIES, (ctx) => {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(
        this.x + this.width / 2,
        this.y + this.height + 10,
        this.width / 2 - 10,
        12,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });

    // Island base (dirt/earth)
    renderer.fillRoundRect(
      this.x + 20,
      this.y + 40,
      this.width - 40,
      this.height - 40,
      20,
      dirtColor,
      LAYERS.ENTITIES,
    );

    // Island top (grass)
    renderer.fillRoundRect(
      this.x + 10,
      this.y + 20,
      this.width - 20,
      this.height - 50,
      24,
      grassColor,
      LAYERS.ENTITIES,
    );

    // Grass surface highlight
    renderer.fillRoundRect(
      this.x + 20,
      this.y + 20,
      this.width - 40,
      16,
      12,
      baseColor,
      LAYERS.ENTITIES,
    );

    // Plant slots
    this.renderSlots(renderer);

    // Expansion slots (locked)
    this.renderLockedSlots(renderer);
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

      // Slot background
      renderer.fillRoundRect(
        sx,
        sy,
        slotSize,
        slotSize,
        8,
        'rgba(0,0,0,0.1)',
        LAYERS.ENTITIES,
      );

      // Empty slot indicator
      if (!slot.plant_id) {
        renderer.strokeRoundRect(
          sx + 4,
          sy + 4,
          slotSize - 8,
          slotSize - 8,
          6,
          'rgba(255,255,255,0.3)',
          1,
          LAYERS.ENTITIES,
        );
        renderer.drawText(
          '+',
          sx + slotSize / 2,
          sy + slotSize / 2,
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

      renderer.fillRoundRect(
        sx,
        sy,
        slotSize,
        slotSize,
        8,
        'rgba(0,0,0,0.2)',
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
