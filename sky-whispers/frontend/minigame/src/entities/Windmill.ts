// ============================================================
// Windmill - Windmill entity with rotating blades and coin emission
// ============================================================

import { Renderer } from '../core/Renderer';
import { LAYERS, COLORS, ANIMATION } from '../utils/constants';
import { clamp } from '../utils/math';

interface CoinParticle {
  x: number;
  y: number;
  vy: number;
  alpha: number;
  life: number;
}

export class Windmill {
  private x: number;
  private y: number;
  private level: number;
  private windPower: number;
  private rotation: number = 0;
  private coinParticles: CoinParticle[] = [];
  private time: number = 0;
  private width: number = 60;
  private height: number = 80;

  constructor(x: number, y: number, level: number, windPower: number) {
    this.x = x;
    this.y = y;
    this.level = level;
    this.windPower = windPower;
  }

  update(dt: number): void {
    this.time += dt * 1000;

    // Rotation speed based on wind power
    const speed = ANIMATION.WINDMILL_BASE_SPEED * (1 + this.windPower * 0.5);
    this.rotation += speed * dt * 60;

    // Update coin particles
    for (let i = this.coinParticles.length - 1; i >= 0; i--) {
      const p = this.coinParticles[i];
      p.y += p.vy * dt;
      p.vy -= 20 * dt; // Float upward
      p.life -= dt;
      p.alpha = clamp(p.life / 1.5, 0, 1);
      if (p.life <= 0) {
        this.coinParticles.splice(i, 1);
      }
    }
  }

  render(renderer: Renderer): void {
    const cx = this.x + this.width / 2;
    const baseY = this.y + this.height - 10;

    // Windmill base/tower
    renderer.fillRoundRect(
      cx - 6,
      baseY - 40,
      12,
      40,
      3,
      COLORS.WINDMILL_BASE,
      LAYERS.ENTITIES,
    );

    // Windmill hub
    renderer.drawCircle(cx, baseY - 40, 5, '#5D4037', true, LAYERS.ENTITIES);

    // Rotating blades
    this.renderBlades(renderer, cx, baseY - 40);

    // Level indicator
    renderer.fillRoundRect(
      this.x,
      this.y + this.height - 4,
      this.width,
      8,
      4,
      '#5D4037',
      LAYERS.ENTITIES,
    );
    renderer.drawText(
      `Lv${this.level}`,
      cx,
      this.y + this.height,
      '#FFFFFF',
      8,
      'center',
      'top',
      LAYERS.ENTITIES,
    );

    // Coin particles
    for (const p of this.coinParticles) {
      renderer.setAlpha(p.alpha, LAYERS.EFFECTS, (ctx) => {
        ctx.fillStyle = COLORS.COIN_GOLD;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFE082';
        ctx.font = '6px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', p.x, p.y);
      });
    }
  }

  private renderBlades(renderer: Renderer, cx: number, cy: number): void {
    const bladeLength = 20 + this.level * 2;
    const bladeWidth = 6;

    renderer.setAlpha(1, LAYERS.ENTITIES, (ctx) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.rotation);

      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 2);

        // Blade
        ctx.fillStyle = COLORS.WINDMILL_BLADE;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-bladeWidth / 2, -bladeLength);
        ctx.lineTo(bladeWidth / 2, -bladeLength * 0.8);
        ctx.closePath();
        ctx.fill();

        // Blade outline
        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    });
  }

  emitCoin(): void {
    const cx = this.x + this.width / 2;
    const baseY = this.y + this.height - 40;
    this.coinParticles.push({
      x: cx + (Math.random() - 0.5) * 20,
      y: baseY,
      vy: -40 - Math.random() * 20,
      alpha: 1,
      life: 1.5,
    });
  }

  setWindPower(power: number): void {
    this.windPower = power;
  }

  setLevel(level: number): void {
    this.level = level;
  }

  containsPoint(px: number, py: number): boolean {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
