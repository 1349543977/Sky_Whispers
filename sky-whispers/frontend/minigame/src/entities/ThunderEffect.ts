// ============================================================
// ThunderEffect - Lightning and screen shake effect
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS } from '../utils/constants';
import { randomRange, randomInt } from '../utils/math';

interface LightningBolt {
  points: Array<{ x: number; y: number }>;
  alpha: number;
  life: number;
}

export class ThunderEffect {
  private screenWidth: number;
  private screenHeight: number;
  private active: boolean = true;
  private bolts: LightningBolt[] = [];
  private flashAlpha: number = 0;
  private shakeOffset: { x: number; y: number } = { x: 0, y: 0 };
  private nextStrikeTimer: number = 0;
  private strikeInterval: number = 5; // seconds between strikes
  private onThunderSound: (() => void) | null = null;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.nextStrikeTimer = randomRange(2, this.strikeInterval);
  }

  update(dt: number): void {
    if (!this.active) return;

    // Timer for next strike
    this.nextStrikeTimer -= dt;
    if (this.nextStrikeTimer <= 0) {
      this.strike();
      this.nextStrikeTimer = randomRange(3, this.strikeInterval);
    }

    // Update bolts
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const bolt = this.bolts[i];
      bolt.life -= dt;
      bolt.alpha = Math.max(0, bolt.life / 0.3);
      if (bolt.life <= 0) {
        this.bolts.splice(i, 1);
      }
    }

    // Update flash
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 4);
    }

    // Update shake
    if (this.shakeOffset.x !== 0 || this.shakeOffset.y !== 0) {
      this.shakeOffset.x *= 0.9;
      this.shakeOffset.y *= 0.9;
      if (Math.abs(this.shakeOffset.x) < 0.5) this.shakeOffset.x = 0;
      if (Math.abs(this.shakeOffset.y) < 0.5) this.shakeOffset.y = 0;
    }
  }

  render(renderer: Renderer): void {
    if (!this.active) return;

    // Screen flash
    if (this.flashAlpha > 0) {
      renderer.setAlpha(this.flashAlpha * 0.3, LAYERS.OVERLAY, (ctx) => {
        ctx.fillStyle = COLORS.THUNDER;
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
      });
    }

    // Lightning bolts
    for (const bolt of this.bolts) {
      renderer.setAlpha(bolt.alpha, LAYERS.EFFECTS, (ctx) => {
        ctx.strokeStyle = COLORS.THUNDER;
        ctx.lineWidth = 3;
        ctx.shadowColor = COLORS.THUNDER;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
        for (let i = 1; i < bolt.points.length; i++) {
          ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
        }
        ctx.stroke();

        // Thinner inner line
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
        for (let i = 1; i < bolt.points.length; i++) {
          ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }
  }

  private strike(): void {
    const startX = randomRange(this.screenWidth * 0.2, this.screenWidth * 0.8);
    const points = this.generateBolt(startX, 0, startX + randomRange(-50, 50), this.screenHeight * 0.6);

    this.bolts.push({
      points,
      alpha: 1,
      life: 0.3,
    });

    // Flash
    this.flashAlpha = 1;

    // Shake
    this.shakeOffset.x = randomRange(-8, 8);
    this.shakeOffset.y = randomRange(-4, 4);

    // Trigger thunder sound
    this.onThunderSound?.();
  }

  private generateBolt(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [{ x: x1, y: y1 }];
    const segments = randomInt(5, 10);
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;

    for (let i = 1; i < segments; i++) {
      const offsetX = randomRange(-30, 30);
      points.push({
        x: x1 + dx * i + offsetX,
        y: y1 + dy * i,
      });
    }

    points.push({ x: x2, y: y2 });
    return points;
  }

  setOnThunderSound(callback: () => void): void {
    this.onThunderSound = callback;
  }

  getShakeOffset(): { x: number; y: number } {
    return { ...this.shakeOffset };
  }

  setActive(active: boolean): void {
    this.active = active;
    if (!active) {
      this.bolts = [];
      this.flashAlpha = 0;
      this.shakeOffset = { x: 0, y: 0 };
    }
  }

  get isActive(): boolean {
    return this.active;
  }
}
