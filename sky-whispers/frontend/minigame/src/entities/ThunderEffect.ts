// ============================================================
// ThunderEffect - Branching lightning with warm glow & gentle shake
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS } from '../utils/constants';
import { randomRange, randomInt } from '../utils/math';

interface LightningBranch {
  points: Array<{ x: number; y: number }>;
  alpha: number;
  life: number;
  maxLife: number;
  lineWidth: number;
  isMain: boolean;
}

export class ThunderEffect {
  private screenWidth: number;
  private screenHeight: number;
  private active: boolean = true;
  private branches: LightningBranch[] = [];
  private flashAlpha: number = 0;
  private shakeOffset: { x: number; y: number } = { x: 0, y: 0 };
  private nextStrikeTimer: number = 0;
  private onThunderSound: (() => void) | null = null;

  private static readonly STRIKE_INTERVAL_MIN = 3;
  private static readonly STRIKE_INTERVAL_MAX = 8;
  private static readonly BOLT_LIFE = 0.25;
  private static readonly FLASH_DURATION = 0.2;
  private static readonly FLASH_MAX_ALPHA = 0.35;
  private static readonly SHAKE_INTENSITY = 4;
  private static readonly SHAKE_DAMPING = 0.88;
  private static readonly SHAKE_THRESHOLD = 0.3;
  private static readonly BRANCH_COUNT_MIN = 2;
  private static readonly BRANCH_COUNT_MAX = 3;
  private static readonly GLOW_RADIUS = 40;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.nextStrikeTimer = randomRange(
      ThunderEffect.STRIKE_INTERVAL_MIN,
      ThunderEffect.STRIKE_INTERVAL_MAX,
    );
  }

  update(dt: number): void {
    if (!this.active) return;

    // Timer for next strike
    this.nextStrikeTimer -= dt;
    if (this.nextStrikeTimer <= 0) {
      this.strike();
      this.nextStrikeTimer = randomRange(
        ThunderEffect.STRIKE_INTERVAL_MIN,
        ThunderEffect.STRIKE_INTERVAL_MAX,
      );
    }

    // Update branches
    for (let i = this.branches.length - 1; i >= 0; i--) {
      const branch = this.branches[i];
      branch.life -= dt;
      branch.alpha = Math.max(0, branch.life / branch.maxLife);
      if (branch.life <= 0) {
        this.branches.splice(i, 1);
      }
    }

    // Update flash
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt / ThunderEffect.FLASH_DURATION);
    }

    // Update shake with dampening
    if (this.shakeOffset.x !== 0 || this.shakeOffset.y !== 0) {
      this.shakeOffset.x *= ThunderEffect.SHAKE_DAMPING;
      this.shakeOffset.y *= ThunderEffect.SHAKE_DAMPING;
      if (Math.abs(this.shakeOffset.x) < ThunderEffect.SHAKE_THRESHOLD) this.shakeOffset.x = 0;
      if (Math.abs(this.shakeOffset.y) < ThunderEffect.SHAKE_THRESHOLD) this.shakeOffset.y = 0;
    }
  }

  render(renderer: Renderer): void {
    if (!this.active) return;

    // Lightning glow (behind the bolt)
    for (const branch of this.branches) {
      if (branch.alpha <= 0) continue;
      const midPoint = branch.points[Math.floor(branch.points.length / 2)];
      renderer.drawRadialGlow(
        midPoint.x, midPoint.y,
        0, ThunderEffect.GLOW_RADIUS * (branch.isMain ? 1 : 0.5),
        `rgba(242, 197, 124, ${branch.alpha * 0.15})`,
        `rgba(242, 197, 124, 0)`,
        LAYERS.EFFECTS,
      );
    }

    // Lightning branches
    for (const branch of this.branches) {
      if (branch.alpha <= 0 || branch.points.length < 2) continue;

      renderer.setAlpha(branch.alpha, LAYERS.EFFECTS, (ctx) => {
        // Outer glow line
        ctx.strokeStyle = COLORS.THUNDER_BOLT;
        ctx.lineWidth = branch.lineWidth + 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = COLORS.THUNDER_BOLT;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(branch.points[0].x, branch.points[0].y);
        for (let i = 1; i < branch.points.length; i++) {
          ctx.lineTo(branch.points[i].x, branch.points[i].y);
        }
        ctx.stroke();

        // Inner bright line
        ctx.shadowBlur = 0;
        ctx.strokeStyle = COLORS.THUNDER_FLASH;
        ctx.lineWidth = branch.lineWidth;
        ctx.beginPath();
        ctx.moveTo(branch.points[0].x, branch.points[0].y);
        for (let i = 1; i < branch.points.length; i++) {
          ctx.lineTo(branch.points[i].x, branch.points[i].y);
        }
        ctx.stroke();
      });
    }

    // Soft warm flash overlay
    if (this.flashAlpha > 0) {
      renderer.setAlpha(this.flashAlpha, LAYERS.OVERLAY, (ctx) => {
        ctx.fillStyle = '#FFFBF0';
        ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
      });
    }
  }

  private strike(): void {
    const startX = randomRange(this.screenWidth * 0.2, this.screenWidth * 0.8);
    const endX = startX + randomRange(-60, 60);
    const endY = this.screenHeight * randomRange(0.5, 0.7);

    // Main bolt
    const mainPoints = this.generateBolt(startX, 0, endX, endY, randomInt(6, 12));
    this.branches.push({
      points: mainPoints,
      alpha: 1,
      life: ThunderEffect.BOLT_LIFE,
      maxLife: ThunderEffect.BOLT_LIFE,
      lineWidth: 2.5,
      isMain: true,
    });

    // Branches off the main bolt
    const branchCount = randomInt(
      ThunderEffect.BRANCH_COUNT_MIN,
      ThunderEffect.BRANCH_COUNT_MAX,
    );
    for (let b = 0; b < branchCount; b++) {
      const branchStartIdx = randomInt(2, mainPoints.length - 2);
      const origin = mainPoints[branchStartIdx];
      const branchEndX = origin.x + randomRange(-80, 80);
      const branchEndY = origin.y + randomRange(30, 80);
      const branchPoints = this.generateBolt(
        origin.x, origin.y,
        branchEndX, branchEndY,
        randomInt(3, 6),
      );
      this.branches.push({
        points: branchPoints,
        alpha: 0.7,
        life: ThunderEffect.BOLT_LIFE * 0.8,
        maxLife: ThunderEffect.BOLT_LIFE * 0.8,
        lineWidth: 1.2,
        isMain: false,
      });
    }

    // Soft flash
    this.flashAlpha = ThunderEffect.FLASH_MAX_ALPHA;

    // Gentle shake
    this.shakeOffset.x = randomRange(-ThunderEffect.SHAKE_INTENSITY, ThunderEffect.SHAKE_INTENSITY);
    this.shakeOffset.y = randomRange(-ThunderEffect.SHAKE_INTENSITY, ThunderEffect.SHAKE_INTENSITY);

    // Trigger thunder sound event
    this.onThunderSound?.();
  }

  private generateBolt(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    segments: number,
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [{ x: x1, y: y1 }];
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;

    for (let i = 1; i < segments; i++) {
      const jitterScale = 1 - (i / segments) * 0.5; // Less jitter near end
      const offsetX = randomRange(-25, 25) * jitterScale;
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
      this.branches = [];
      this.flashAlpha = 0;
      this.shakeOffset = { x: 0, y: 0 };
    }
  }

  get isActive(): boolean {
    return this.active;
  }
}
