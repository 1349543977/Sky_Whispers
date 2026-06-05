// ============================================================
// CoinDisplay - Animated coin counter with Cloud Whisper aesthetic
// Golden gradient coin, sparkle particles, smooth counter
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

/** Sparkle particle around coin */
interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export class CoinDisplay {
  private x: number;
  private y: number;
  private coins: number = 0;
  private displayCoins: number = 0;
  private width: number = 100;
  private height: number = 28;

  // Animation state
  private coinShineAngle: number = 0;
  private sparkles: SparkleParticle[] = [];
  private lastCoins: number = 0;
  private glowPulse: number = 0;

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

    // Coin shine rotation
    this.coinShineAngle += dt * 1.5;

    // Glow pulse
    this.glowPulse = (Math.sin(Date.now() * 0.003) + 1) / 2;

    // Spawn sparkles when coins increase
    if (this.coins > this.lastCoins) {
      this.spawnSparkles(this.coins - this.lastCoins);
    }
    this.lastCoins = this.coins;

    // Update sparkle particles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const p = this.sparkles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vy += 0.02; // gentle gravity
      p.life -= dt * 1000;
      if (p.life <= 0) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  render(renderer: Renderer): void {
    // Background pill with semi-transparent white
    renderer.fillRoundRect(
      this.x,
      this.y,
      this.width,
      this.height,
      this.height / 2,
      'rgba(255,255,255,0.75)',
      LAYERS.UI,
    );

    // Subtle border
    renderer.setAlpha(0.1, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const r = this.height / 2;
      ctx.arc(this.x + r, this.y + r, r, Math.PI * 0.5, Math.PI * 1.5);
      ctx.lineTo(this.x + this.width - r, this.y);
      ctx.arc(this.x + this.width - r, this.y + r, r, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.lineTo(this.x + r, this.y + this.height);
      ctx.closePath();
      ctx.stroke();
    });

    const coinCx = this.x + 16;
    const coinCy = this.y + this.height / 2;
    const coinRadius = 9;

    // Soft glow behind coin
    renderer.drawRadialGlow(
      coinCx, coinCy, 0, coinRadius + 6 + this.glowPulse * 2,
      'rgba(242, 197, 124, 0.25)', 'rgba(242, 197, 124, 0)',
      LAYERS.UI,
    );

    // Coin body with gradient
    renderer.fillGradientRoundRect(
      coinCx - coinRadius, coinCy - coinRadius,
      coinRadius * 2, coinRadius * 2, coinRadius,
      DesignTokens.colors.coin, DesignTokens.colors.coinShine, true, LAYERS.UI,
    );

    // Shine highlight on coin
    const shineX = coinCx + Math.cos(this.coinShineAngle) * 3;
    const shineY = coinCy - 2 + Math.sin(this.coinShineAngle) * 1;
    renderer.setAlpha(0.5, LAYERS.UI, (ctx) => {
      const gradient = ctx.createRadialGradient(shineX, shineY, 0, shineX, shineY, coinRadius * 0.6);
      gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(shineX, shineY, coinRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Coin symbol
    renderer.drawText(
      '$',
      coinCx,
      coinCy,
      '#8B6914',
      10,
      'center',
      'middle',
      LAYERS.UI,
    );

    // Sparkle particles
    for (const sparkle of this.sparkles) {
      const alpha = sparkle.life / sparkle.maxLife;
      renderer.drawSparkle(
        sparkle.x, sparkle.y,
        sparkle.size,
        DesignTokens.colors.coinShine,
        alpha,
        LAYERS.UI,
      );
    }

    // Coin count
    renderer.fillTextWithShadow(
      this.formatNumber(Math.floor(this.displayCoins)),
      this.x + 30,
      this.y + this.height / 2,
      DesignTokens.colors.textPrimary,
      'rgba(0,0,0,0.05)',
      DesignTokens.fontSize.md,
      1,
      1,
      'left',
      'middle',
      LAYERS.UI,
    );
  }

  private spawnSparkles(amount: number): void {
    const count = Math.min(Math.ceil(amount / 5), 6);
    const coinCx = this.x + 16;
    const coinCy = this.y + this.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      this.sparkles.push({
        x: coinCx + Math.cos(angle) * 8,
        y: coinCy + Math.sin(angle) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        life: 600 + Math.random() * 400,
        maxLife: 1000,
        size: 2 + Math.random() * 3,
      });
    }
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
