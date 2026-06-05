// ============================================================
// FogEffect - Layered, drifting fog with organic shapes
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS } from '../utils/constants';
import { randomRange } from '../utils/math';

interface FogLayer {
  x: number;
  y: number;
  baseY: number;
  width: number;
  height: number;
  speed: number;
  alpha: number;
  /** Wobble seed for organic shape variation */
  wobbleSeed: number;
  /** Vertical bob phase */
  bobPhase: number;
  /** Vertical bob amplitude */
  bobAmplitude: number;
  /** Vertical bob speed */
  bobSpeed: number;
  /** Color tint for this layer */
  color: string;
}

export class FogEffect {
  private layers: FogLayer[] = [];
  private screenWidth: number;
  private screenHeight: number;
  private active: boolean = true;
  private globalAlpha: number = 0.4;
  private time: number = 0;

  private static readonly LAYER_COUNT = 4;
  private static readonly ALPHA_MIN = 0.05;
  private static readonly ALPHA_MAX = 0.2;
  private static readonly BOB_AMPLITUDE_MIN = 2;
  private static readonly BOB_AMPLITUDE_MAX = 6;
  private static readonly BOB_SPEED_MIN = 0.3;
  private static readonly BOB_SPEED_MAX = 0.8;
  private static readonly SPEED_MIN = 3;
  private static readonly SPEED_MAX = 12;
  private static readonly ORGANIC_POINTS = 10;
  private static readonly WOBBLE_AMOUNT = 8;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.initLayers();
  }

  private initLayers(): void {
    this.layers = [];
    const layerColors = [COLORS.FOG, COLORS.FOG, COLORS.FOG_DENSE, COLORS.FOG];

    for (let i = 0; i < FogEffect.LAYER_COUNT; i++) {
      const speed = randomRange(FogEffect.SPEED_MIN, FogEffect.SPEED_MAX)
        * (i % 2 === 0 ? 1 : -1);
      const baseY = this.screenHeight * (0.25 + i * 0.18);

      this.layers.push({
        x: randomRange(-this.screenWidth * 0.3, this.screenWidth),
        y: baseY,
        baseY,
        width: randomRange(this.screenWidth * 0.8, this.screenWidth * 1.5),
        height: randomRange(50, 100),
        speed,
        alpha: randomRange(FogEffect.ALPHA_MIN, FogEffect.ALPHA_MAX),
        wobbleSeed: randomRange(0, 100),
        bobPhase: randomRange(0, Math.PI * 2),
        bobAmplitude: randomRange(FogEffect.BOB_AMPLITUDE_MIN, FogEffect.BOB_AMPLITUDE_MAX),
        bobSpeed: randomRange(FogEffect.BOB_SPEED_MIN, FogEffect.BOB_SPEED_MAX),
        color: layerColors[i],
      });
    }
  }

  update(dt: number): void {
    if (!this.active) return;

    this.time += dt;

    for (const layer of this.layers) {
      // Horizontal drift
      layer.x += layer.speed * dt;

      // Vertical bob
      layer.bobPhase += layer.bobSpeed * dt;
      layer.y = layer.baseY + Math.sin(layer.bobPhase) * layer.bobAmplitude;

      // Seamless wrap around screen edges
      if (layer.speed > 0 && layer.x > this.screenWidth + layer.width * 0.2) {
        layer.x = -layer.width;
      } else if (layer.speed < 0 && layer.x + layer.width < -layer.width * 0.2) {
        layer.x = this.screenWidth;
      }
    }
  }

  render(renderer: Renderer): void {
    if (!this.active) return;

    for (const layer of this.layers) {
      const effectiveAlpha = layer.alpha * this.globalAlpha;

      // Draw fog as organic blob shape using bezier curves
      renderer.setAlpha(effectiveAlpha, LAYERS.EFFECTS, (ctx) => {
        ctx.fillStyle = layer.color;
        ctx.beginPath();

        const cx = layer.x + layer.width / 2;
        const cy = layer.y + layer.height / 2;
        const rx = layer.width / 2;
        const ry = layer.height / 2;
        const points = FogEffect.ORGANIC_POINTS;

        // Generate organic shape points with wobble
        const shapePoints: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wobbleOffset = Math.sin(angle * 3 + layer.wobbleSeed + this.time * 0.2)
            * FogEffect.WOBBLE_AMOUNT;
          shapePoints.push({
            x: cx + Math.cos(angle) * (rx + wobbleOffset),
            y: cy + Math.sin(angle) * (ry + wobbleOffset * 0.5),
          });
        }

        // Draw smooth closed curve through points using quadratic bezier
        ctx.moveTo(
          (shapePoints[points - 1].x + shapePoints[0].x) / 2,
          (shapePoints[points - 1].y + shapePoints[0].y) / 2,
        );
        for (let i = 0; i < points; i++) {
          const next = shapePoints[(i + 1) % points];
          const midX = (shapePoints[i].x + next.x) / 2;
          const midY = (shapePoints[i].y + next.y) / 2;
          ctx.quadraticCurveTo(shapePoints[i].x, shapePoints[i].y, midX, midY);
        }
        ctx.closePath();
        ctx.fill();
      });
    }
  }

  setGlobalAlpha(alpha: number): void {
    this.globalAlpha = alpha;
  }

  setActive(active: boolean): void {
    this.active = active;
    if (active && this.layers.length === 0) {
      this.initLayers();
    }
  }

  get isActive(): boolean {
    return this.active;
  }
}
