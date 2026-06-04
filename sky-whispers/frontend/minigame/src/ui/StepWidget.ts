// ============================================================
// StepWidget - Step count and wind power display
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
      fillColor: DesignTokens.colors.secondary,
      bgColor: 'rgba(0,0,0,0.2)',
      borderRadius: 3,
    });
  }

  update(dt: number): void {
    this.progressBar.update(dt);
  }

  render(renderer: Renderer): void {
    // Background
    renderer.fillRoundRect(
      this.x,
      this.y,
      this.width,
      this.height,
      DesignTokens.borderRadius.md,
      'rgba(0,0,0,0.3)',
      LAYERS.UI,
    );

    // Step icon and count
    renderer.drawText(
      '🏃',
      this.x + 12,
      this.y + 12,
      '#FFFFFF',
      12,
      'center',
      'middle',
      LAYERS.UI,
    );
    renderer.drawText(
      `${this.formatSteps(this.steps)}步`,
      this.x + 24,
      this.y + 12,
      '#FFFFFF',
      DesignTokens.fontSize.xs,
      'left',
      'middle',
      LAYERS.UI,
    );

    // Wind power
    renderer.drawText(
      `💨${this.windPower}`,
      this.x + this.width - 8,
      this.y + 12,
      'rgba(255,255,255,0.8)',
      DesignTokens.fontSize.xs,
      'right',
      'middle',
      LAYERS.UI,
    );

    // Progress bar
    this.progressBar.render(renderer);
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
