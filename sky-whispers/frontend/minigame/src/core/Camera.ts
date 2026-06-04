// ============================================================
// Camera - 2D camera with pan, zoom, and follow
// ============================================================

import { Vector2 } from '../types';
import { clamp, lerp } from '../utils/math';

export class Camera {
  private position: Vector2 = { x: 0, y: 0 };
  private zoomLevel: number = 1;
  private targetPosition: Vector2 | null = null;
  private targetZoom: number | null = null;
  private followTarget: Vector2 | null = null;
  private bounds: { minX: number; minY: number; maxX: number; maxY: number } | null = null;
  private smoothing: number = 0.1;
  private screenWidth: number = 0;
  private screenHeight: number = 0;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  get x(): number {
    return this.position.x;
  }

  get y(): number {
    return this.position.y;
  }

  get zoom(): number {
    return this.zoomLevel;
  }

  setBounds(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): void {
    this.bounds = { minX, minY, maxX, maxY };
  }

  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.targetPosition = null;
    this.clampPosition();
  }

  setZoom(zoom: number): void {
    this.zoomLevel = clamp(zoom, 0.5, 3);
    this.targetZoom = null;
  }

  panTo(x: number, y: number, smooth: boolean = true): void {
    if (smooth) {
      this.targetPosition = { x, y };
    } else {
      this.position.x = x;
      this.position.y = y;
    }
  }

  zoomTo(zoom: number, smooth: boolean = true): void {
    if (smooth) {
      this.targetZoom = clamp(zoom, 0.5, 3);
    } else {
      this.zoomLevel = clamp(zoom, 0.5, 3);
    }
  }

  follow(target: Vector2): void {
    this.followTarget = target;
  }

  stopFollow(): void {
    this.followTarget = null;
  }

  update(dt: number): void {
    // Follow target
    if (this.followTarget) {
      const targetX = this.followTarget.x - this.screenWidth / (2 * this.zoomLevel);
      const targetY = this.followTarget.y - this.screenHeight / (2 * this.zoomLevel);
      this.position.x = lerp(this.position.x, targetX, this.smoothing);
      this.position.y = lerp(this.position.y, targetY, this.smoothing);
    }

    // Smooth pan
    if (this.targetPosition) {
      this.position.x = lerp(this.position.x, this.targetPosition.x, this.smoothing);
      this.position.y = lerp(this.position.y, this.targetPosition.y, this.smoothing);
      const dx = Math.abs(this.position.x - this.targetPosition.x);
      const dy = Math.abs(this.position.y - this.targetPosition.y);
      if (dx < 0.5 && dy < 0.5) {
        this.position.x = this.targetPosition.x;
        this.position.y = this.targetPosition.y;
        this.targetPosition = null;
      }
    }

    // Smooth zoom
    if (this.targetZoom !== null) {
      this.zoomLevel = lerp(this.zoomLevel, this.targetZoom, this.smoothing);
      if (Math.abs(this.zoomLevel - this.targetZoom) < 0.01) {
        this.zoomLevel = this.targetZoom;
        this.targetZoom = null;
      }
    }

    this.clampPosition();
  }

  applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.scale(this.zoomLevel, this.zoomLevel);
    ctx.translate(-this.position.x, -this.position.y);
  }

  screenToWorld(screenX: number, screenY: number): Vector2 {
    return {
      x: screenX / this.zoomLevel + this.position.x,
      y: screenY / this.zoomLevel + this.position.y,
    };
  }

  worldToScreen(worldX: number, worldY: number): Vector2 {
    return {
      x: (worldX - this.position.x) * this.zoomLevel,
      y: (worldY - this.position.y) * this.zoomLevel,
    };
  }

  updateScreenSize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  private clampPosition(): void {
    if (!this.bounds) return;
    this.position.x = clamp(
      this.position.x,
      this.bounds.minX,
      this.bounds.maxX - this.screenWidth / this.zoomLevel,
    );
    this.position.y = clamp(
      this.position.y,
      this.bounds.minY,
      this.bounds.maxY - this.screenHeight / this.zoomLevel,
    );
  }
}
