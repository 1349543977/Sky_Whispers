// ============================================================
// FogEffect - Fog overlay with drifting layers
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS } from '../utils/constants';
import { randomRange } from '../utils/math';

interface FogLayer {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  alpha: number;
}

export class FogEffect {
  private layers: FogLayer[] = [];
  private screenWidth: number;
  private screenHeight: number;
  private active: boolean = true;
  private globalAlpha: number = 0.4;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.initLayers();
  }

  private initLayers(): void {
    this.layers = [];
    for (let i = 0; i < 5; i++) {
      this.layers.push({
        x: randomRange(-this.screenWidth * 0.3, this.screenWidth),
        y: randomRange(this.screenHeight * 0.2, this.screenHeight * 0.8),
        width: randomRange(this.screenWidth * 0.6, this.screenWidth * 1.2),
        height: randomRange(60, 120),
        speed: randomRange(5, 15) * (i % 2 === 0 ? 1 : -1),
        alpha: randomRange(0.15, 0.35),
      });
    }
  }

  update(dt: number): void {
    if (!this.active) return;

    for (const layer of this.layers) {
      layer.x += layer.speed * dt;

      // Wrap around
      if (layer.speed > 0 && layer.x > this.screenWidth) {
        layer.x = -layer.width;
      } else if (layer.speed < 0 && layer.x + layer.width < 0) {
        layer.x = this.screenWidth;
      }
    }
  }

  render(renderer: Renderer): void {
    if (!this.active) return;

    for (const layer of this.layers) {
      renderer.setAlpha(layer.alpha * this.globalAlpha, LAYERS.EFFECTS, (ctx) => {
        ctx.fillStyle = COLORS.FOG;
        // Draw fog as a soft ellipse
        ctx.beginPath();
        ctx.ellipse(
          layer.x + layer.width / 2,
          layer.y + layer.height / 2,
          layer.width / 2,
          layer.height / 2,
          0,
          0,
          Math.PI * 2,
        );
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
