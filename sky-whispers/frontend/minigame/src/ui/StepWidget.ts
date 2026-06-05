// ============================================================
// StepWidget - Step count and wind power with Cloud Whisper aesthetic
// Compact pill, gradient wind bar, pulse effect
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';
import { ProgressBar } from './ProgressBar';

export class StepWidget {
  private x: number;
  private y: number;
  private steps: number = 0;
  private windPower: number = 0;
  private maxWindPower: number = 100;
  private width: number = 110;
  private height: number = 44;
  private progressBar: ProgressBar;

  // Animation state
  private pulseScale: number = 1;
  private pulseTarget: number = 1;
  private lastWindPower: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.progressBar = new ProgressBar({
      x: this.x + 4,
      y: this.y + 28,
      width: this.width - 8,
      height: 6,
      min: 0,
      max: this.maxWindPower,
      value: 0,
      fillColor: DesignTokens.colors.primary,
      fillGradientEnd: DesignTokens.colors.primaryLight,
      bgColor: 'rgba(0,0,0,0.08)',
      borderRadius: 3,
    });
  }

  update(dt: number): void {
    this.progressBar.update(dt);

    // Pulse when wind power changes
    if (this.windPower !== this.lastWindPower) {
      this.pulseTarget = 1.15;
      setTimeout(() => { this.pulseTarget = 1; }, 150);
      this.lastWindPower = this.windPower;
    }

    // Smooth pulse animation
    this.pulseScale += (this.pulseTarget - this.pulseScale) * 0.2;
  }

  render(renderer: Renderer): void {
    // Background pill with semi-transparent white
    renderer.fillRoundRect(
      this.x,
      this.y,
      this.width,
      this.height,
      DesignTokens.borderRadius.lg,
      'rgba(255,255,255,0.75)',
      LAYERS.UI,
    );

    // Subtle shadow
    renderer.drawSoftShadow(
      this.x + this.width / 2, this.y + this.height + 1,
      this.width * 0.4, 1.5,
      3, 'rgba(26, 39, 56, 0.05)',
      LAYERS.UI - 1,
    );

    // Step icon (shoe drawn with canvas)
    const shoeCx = this.x + 14;
    const shoeCy = this.y + 12;
    this.drawShoeIcon(renderer, shoeCx, shoeCy);

    // Step count text
    renderer.fillTextWithShadow(
      `${this.formatSteps(this.steps)}步`,
      this.x + 26,
      this.y + 12,
      DesignTokens.colors.textPrimary,
      'rgba(0,0,0,0.04)',
      DesignTokens.fontSize.xs,
      1,
      1,
      'left',
      'middle',
      LAYERS.UI,
    );

    // Wind power with pulse effect
    const windX = this.x + this.width - 8;
    const windY = this.y + 12;

    renderer.setAlpha(this.pulseScale > 1.05 ? 0.9 : 0.7, LAYERS.UI, (ctx) => {
      ctx.font = `${DesignTokens.fontSize.xs}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = DesignTokens.colors.primary;
      ctx.fillText(`💨${this.windPower}`, windX, windY);
    });

    // Wind power progress bar
    this.progressBar.render(renderer);
  }

  private drawShoeIcon(renderer: Renderer, cx: number, cy: number): void {
    renderer.setAlpha(0.8, LAYERS.UI, (ctx) => {
      ctx.fillStyle = DesignTokens.colors.secondary;
      // Simplified shoe shape
      ctx.beginPath();
      ctx.ellipse(cx, cy, 5, 3.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Sole
      ctx.fillStyle = DesignTokens.colors.secondaryDark;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, 5, 1.5, -0.2, 0, Math.PI);
      ctx.fill();
    });
  }

  private formatSteps(steps: number): string {
    if (steps >= 10000) return `${(steps / 10000).toFixed(1)}W`;
    if (steps >= 1000) return `${(steps / 1000).toFixed(1)}K`;
    return String(steps);
  }

  setSteps(steps: number): void {
    this.steps = steps;
  }

  setWindPower(power: number): void {
    this.windPower = power;
    this.progressBar.setValue(power);
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.progressBar.setPosition(x + 4, y + 28);
  }
}
