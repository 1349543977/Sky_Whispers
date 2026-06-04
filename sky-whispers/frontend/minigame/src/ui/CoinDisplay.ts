// ============================================================
// CoinDisplay - Animated coin counter
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

export class CoinDisplay {
  private x: number;
  private y: number;
  private coins: number = 0;
  private displayCoins: number = 0;
  private width: number = 100;
  private height: number = 28;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(dt: number): void {
    // Smooth number animation
    const diff = this.coins - this.displayCoins;
    if (Math.abs(diff) < 1) {
      this.displayCoins = this.coins;
    } else {
      this.displayCoins += diff * 0.15;
    }
  }

  render(renderer: Renderer): void {
    // Background pill
    renderer.fillRoundRect(
      this.x,
      this.y,
      this.width,
      this.height,
      this.height / 2,
      'rgba(0,0,0,0.3)',
      LAYERS.UI,
    );

    // Coin icon
    renderer.drawCircle(
      this.x + 14,
      this.y + this.height / 2,
      9,
      COLORS.COIN_GOLD,
      true,
      LAYERS.UI,
    );
    renderer.drawText(
      '$',
      this.x + 14,
      this.y + this.height / 2,
      '#8B6914',
      10,
      'center',
      'middle',
      LAYERS.UI,
    );

    // Coin count
    renderer.drawText(
      this.formatNumber(Math.floor(this.displayCoins)),
      this.x + 28,
      this.y + this.height / 2,
      '#FFFFFF',
      DesignTokens.fontSize.md,
      'left',
      'middle',
      LAYERS.UI,
    );
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 10000) return `${(num / 10000).toFixed(1)}W`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return String(num);
  }

  setCoins(coins: number): void {
    this.coins = coins;
  }

  getCoins(): number {
    return this.coins;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
