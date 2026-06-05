// ============================================================
// Cloud - Fluffy, multi-puff cloud with variants & parallax
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS, ANIMATION } from '../utils/constants';
import { randomRange } from '../utils/math';

export type CloudVariant = 'normal' | 'rain' | 'gift';

/** A single puff within a cloud */
interface CloudPuff {
  offsetX: number;
  offsetY: number;
  radiusX: number;
  radiusY: number;
}

export class Cloud {
  private x: number;
  private y: number;
  private baseY: number;
  private speed: number;
  private variant: CloudVariant;
  private width: number;
  private height: number;
  private screenWidth: number;
  private time: number = 0;
  private dripOffset: number = 0;
  private puffs: CloudPuff[] = [];
  private depth: number;
  private bobPhase: number;
  private bobAmplitude: number;

  private static readonly BOB_SPEED = 0.8;
  private static readonly BOB_AMPLITUDE_MIN = 1.5;
  private static readonly BOB_AMPLITUDE_MAX = 4;
  private static readonly SHADOW_OFFSET_Y = 6;
  private static readonly SHADOW_BLUR = 4;
  private static readonly RAIN_DROP_COUNT = 4;

  constructor(
    x: number,
    y: number,
    speed: number,
    variant: CloudVariant,
    screenWidth: number,
  ) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.speed = speed;
    this.variant = variant;
    this.screenWidth = screenWidth;
    this.width = variant === 'gift' ? 80 : 65;
    this.height = variant === 'rain' ? 40 : 35;
    this.depth = randomRange(0.3, 1.0);
    this.bobPhase = randomRange(0, Math.PI * 2);
    this.bobAmplitude = randomRange(Cloud.BOB_AMPLITUDE_MIN, Cloud.BOB_AMPLITUDE_MAX);
    this.generatePuffs();
  }

  private generatePuffs(): void {
    this.puffs = [];
    const puffCount = this.variant === 'gift' ? 5 : 4;

    // Base puffs for a fluffy cloud shape
    const basePuffs: CloudPuff[] = [
      { offsetX: -this.width * 0.25, offsetY: 2, radiusX: this.width * 0.22, radiusY: this.height * 0.35 },
      { offsetX: -this.width * 0.08, offsetY: -4, radiusX: this.width * 0.28, radiusY: this.height * 0.45 },
      { offsetX: this.width * 0.15, offsetY: -2, radiusX: this.width * 0.25, radiusY: this.height * 0.4 },
      { offsetX: this.width * 0.05, offsetY: 5, radiusX: this.width * 0.2, radiusY: this.height * 0.3 },
    ];

    if (puffCount >= 5) {
      basePuffs.push({
        offsetX: this.width * 0.28, offsetY: 3,
        radiusX: this.width * 0.18, radiusY: this.height * 0.28,
      });
    }

    // Add slight random variation
    for (const puff of basePuffs.slice(0, puffCount)) {
      this.puffs.push({
        offsetX: puff.offsetX + randomRange(-2, 2),
        offsetY: puff.offsetY + randomRange(-1, 1),
        radiusX: puff.radiusX * randomRange(0.9, 1.1),
        radiusY: puff.radiusY * randomRange(0.9, 1.1),
      });
    }
  }

  update(dt: number): void {
    this.time += dt * 1000;

    // Parallax: speed scaled by depth
    const parallaxSpeed = this.speed * (ANIMATION.CLOUD_PARALLAX_FAR
      + (ANIMATION.CLOUD_PARALLAX_NEAR - ANIMATION.CLOUD_PARALLAX_FAR) * this.depth);
    this.x += parallaxSpeed * dt;

    // Gentle vertical bob
    this.bobPhase += Cloud.BOB_SPEED * dt;
    this.y = this.baseY + Math.sin(this.bobPhase) * this.bobAmplitude;

    // Wrap around screen
    if (this.x > this.screenWidth + this.width) {
      this.x = -this.width;
    }

    if (this.variant === 'rain') {
      this.dripOffset = (this.dripOffset + dt * 30) % 20;
    }
  }

  render(renderer: Renderer): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Soft shadow beneath the cloud
    this.renderShadow(renderer, cx, cy);

    switch (this.variant) {
      case 'normal':
        this.renderNormalCloud(renderer, cx, cy);
        break;
      case 'rain':
        this.renderRainCloud(renderer, cx, cy);
        break;
      case 'gift':
        this.renderGiftCloud(renderer, cx, cy);
        break;
    }
  }

  private renderShadow(renderer: Renderer, cx: number, cy: number): void {
    const shadowColor = this.variant === 'rain'
      ? 'rgba(120, 144, 156, 0.1)'
      : 'rgba(26, 39, 56, 0.08)';

    renderer.drawSoftShadow(
      cx, cy + Cloud.SHADOW_OFFSET_Y,
      this.width * 0.4, this.height * 0.2,
      Cloud.SHADOW_BLUR, shadowColor,
      LAYERS.ENTITIES,
    );
  }

  private renderCloudBody(
    renderer: Renderer,
    cx: number,
    cy: number,
    topColor: string,
    bottomColor: string,
    alpha: number,
  ): void {
    renderer.setAlpha(alpha, LAYERS.ENTITIES, (ctx) => {
      // Gradient fill: lighter at top, slightly darker at bottom
      const gradient = ctx.createLinearGradient(cx, cy - this.height / 2, cx, cy + this.height / 2);
      gradient.addColorStop(0, topColor);
      gradient.addColorStop(1, bottomColor);
      ctx.fillStyle = gradient;

      // Draw all puffs as overlapping ellipses
      ctx.beginPath();
      for (const puff of this.puffs) {
        ctx.moveTo(cx + puff.offsetX + puff.radiusX, cy + puff.offsetY);
        ctx.ellipse(
          cx + puff.offsetX,
          cy + puff.offsetY,
          puff.radiusX,
          puff.radiusY,
          0, 0, Math.PI * 2,
        );
      }
      ctx.fill();
    });
  }

  private renderNormalCloud(renderer: Renderer, cx: number, cy: number): void {
    this.renderCloudBody(
      renderer, cx, cy,
      COLORS.CLOUD_WHITE, COLORS.CLOUD_WHITE_SHADOW,
      0.85,
    );
  }

  private renderRainCloud(renderer: Renderer, cx: number, cy: number): void {
    this.renderCloudBody(
      renderer, cx, cy,
      COLORS.CLOUD_RAIN, COLORS.CLOUD_RAIN_SHADOW,
      0.9,
    );

    // Rain drops beneath the cloud
    renderer.setAlpha(0.6, LAYERS.EFFECTS, (ctx) => {
      ctx.fillStyle = COLORS.RAIN;
      for (let i = 0; i < Cloud.RAIN_DROP_COUNT; i++) {
        const dx = cx - 15 + i * 10;
        const dy = cy + this.height * 0.3 + (this.dripOffset + i * 5) % 20;
        ctx.beginPath();
        // Small elongated drop
        ctx.ellipse(dx, dy, 0.8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  private renderGiftCloud(renderer: Renderer, cx: number, cy: number): void {
    // Golden-tinted cloud body
    this.renderCloudBody(
      renderer, cx, cy,
      COLORS.CLOUD_GIFT, COLORS.CLOUD_GIFT_RIBBON,
      0.9,
    );

    // Ribbon cross
    renderer.setAlpha(1, LAYERS.ENTITIES, (ctx) => {
      ctx.fillStyle = COLORS.CLOUD_GIFT_RIBBON;
      // Vertical ribbon
      ctx.fillRect(cx - 2, cy - this.height * 0.35, 4, this.height * 0.7);
      // Horizontal ribbon
      ctx.fillRect(cx - this.width * 0.2, cy - 2, this.width * 0.4, 4);

      // Bow on top
      ctx.beginPath();
      ctx.ellipse(cx - 5, cy - this.height * 0.35, 4, 3, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 5, cy - this.height * 0.35, 4, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  containsPoint(px: number, py: number): boolean {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    // Check against all puffs for more accurate hit detection
    for (const puff of this.puffs) {
      const dx = px - (cx + puff.offsetX);
      const dy = py - (cy + puff.offsetY);
      const rx = puff.radiusX;
      const ry = puff.radiusY;
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        return true;
      }
    }
    return false;
  }

  getVariant(): CloudVariant {
    return this.variant;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
