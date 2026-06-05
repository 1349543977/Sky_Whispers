// ============================================================
// WeatherWidget - Weather indicator with Cloud Whisper aesthetic
// Canvas-drawn weather icons, animated weather effects
// ============================================================

import { Renderer } from '../core/Renderer';
import { WeatherType, WeatherData } from '../types';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

/** Rain drop for rainy animation */
interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
}

export class WeatherWidget {
  private x: number;
  private y: number;
  private weatherData: WeatherData | null = null;
  private width: number = 90;
  private height: number = 28;

  // Animation state
  private sunAngle: number = 0;
  private rainDrops: RainDrop[] = [];
  private cloudOffset: number = 0;
  private snowAngle: number = 0;
  private lightningTimer: number = 0;
  private lightningAlpha: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    // Initialize rain drops
    for (let i = 0; i < 3; i++) {
      this.rainDrops.push({
        x: Math.random() * 12,
        y: Math.random() * 8,
        speed: 0.5 + Math.random() * 0.5,
        length: 3 + Math.random() * 2,
      });
    }
  }

  update(dt: number): void {
    // Sun rotation
    this.sunAngle += dt * 0.8;

    // Cloud drift
    this.cloudOffset += dt * 0.3;

    // Snow drift
    this.snowAngle += dt * 1.2;

    // Rain drops
    for (const drop of this.rainDrops) {
      drop.y += drop.speed * dt * 60;
      if (drop.y > 12) {
        drop.y = -2;
        drop.x = Math.random() * 12;
      }
    }

    // Lightning flash
    this.lightningTimer += dt;
    if (this.weatherData?.weather_type === WeatherType.Thunderstorm) {
      if (this.lightningTimer > 2 + Math.random() * 3) {
        this.lightningAlpha = 0.6;
        this.lightningTimer = 0;
      }
      this.lightningAlpha *= 0.9;
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

    // Subtle shadow
    renderer.drawSoftShadow(
      this.x + this.width / 2, this.y + this.height + 1,
      this.width * 0.4, 1.5,
      3, 'rgba(26, 39, 56, 0.05)',
      LAYERS.UI - 1,
    );

    if (!this.weatherData) {
      renderer.drawText(
        '加载中...',
        this.x + this.width / 2,
        this.y + this.height / 2,
        DesignTokens.colors.textTertiary,
        DesignTokens.fontSize.xs,
        'center',
        'middle',
        LAYERS.UI,
      );
      return;
    }

    const iconCx = this.x + 16;
    const iconCy = this.y + this.height / 2;

    // Draw weather icon with canvas
    this.drawWeatherIcon(renderer, iconCx, iconCy);

    // Temperature
    renderer.fillTextWithShadow(
      `${Math.round(this.weatherData.temperature)}°`,
      this.x + 32,
      this.y + this.height / 2,
      DesignTokens.colors.textPrimary,
      'rgba(0,0,0,0.04)',
      DesignTokens.fontSize.sm,
      1,
      1,
      'left',
      'middle',
      LAYERS.UI,
    );

    // City name
    const cityDisplay = this.weatherData.city.length > 3
      ? this.weatherData.city.substring(0, 3) + '..'
      : this.weatherData.city;
    renderer.drawText(
      cityDisplay,
      this.x + 58,
      this.y + this.height / 2,
      DesignTokens.colors.textTertiary,
      DesignTokens.fontSize.xs,
      'left',
      'middle',
      LAYERS.UI,
    );
  }

  private drawWeatherIcon(renderer: Renderer, cx: number, cy: number): void {
    if (!this.weatherData) return;

    switch (this.weatherData.weather_type) {
      case WeatherType.Sunny:
        this.drawSun(renderer, cx, cy);
        break;
      case WeatherType.Cloudy:
        this.drawCloud(renderer, cx, cy);
        break;
      case WeatherType.Rainy:
        this.drawRainCloud(renderer, cx, cy);
        break;
      case WeatherType.Snowy:
        this.drawSnowflake(renderer, cx, cy);
        break;
      case WeatherType.Thunderstorm:
        this.drawThunderCloud(renderer, cx, cy);
        break;
      case WeatherType.Foggy:
        this.drawFog(renderer, cx, cy);
        break;
      case WeatherType.Windy:
        this.drawWind(renderer, cx, cy);
        break;
      default:
        this.drawSun(renderer, cx, cy);
    }
  }

  private drawSun(renderer: Renderer, cx: number, cy: number): void {
    // Sun glow
    renderer.drawRadialGlow(
      cx, cy, 0, 10,
      'rgba(242, 197, 124, 0.2)', 'rgba(242, 197, 124, 0)',
      LAYERS.UI,
    );

    // Sun body
    renderer.drawCircle(cx, cy, 5, DesignTokens.colors.accent, true, LAYERS.UI);

    // Rotating rays
    renderer.setAlpha(0.6, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = DesignTokens.colors.accentLight;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const angle = this.sunAngle + (i * Math.PI * 2) / 8;
        const innerR = 6.5;
        const outerR = 9;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.stroke();
      }
    });
  }

  private drawCloud(renderer: Renderer, cx: number, cy: number): void {
    const offsetX = Math.sin(this.cloudOffset) * 1;

    renderer.setAlpha(0.9, LAYERS.UI, (ctx) => {
      ctx.fillStyle = DesignTokens.colors.neutral300;
      // Main cloud body
      ctx.beginPath();
      ctx.arc(cx - 3 + offsetX, cy + 1, 5, 0, Math.PI * 2);
      ctx.arc(cx + 3 + offsetX, cy + 1, 4, 0, Math.PI * 2);
      ctx.arc(cx + offsetX, cy - 2, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawRainCloud(renderer: Renderer, cx: number, cy: number): void {
    // Cloud
    renderer.setAlpha(0.8, LAYERS.UI, (ctx) => {
      ctx.fillStyle = DesignTokens.colors.neutral400;
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 2, 5, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy - 2, 4, 0, Math.PI * 2);
      ctx.arc(cx, cy - 4, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rain drops
    renderer.setAlpha(0.7, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = DesignTokens.colors.rainDrop;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (const drop of this.rainDrops) {
        ctx.beginPath();
        ctx.moveTo(cx - 5 + drop.x, cy + 2 + drop.y);
        ctx.lineTo(cx - 5 + drop.x, cy + 2 + drop.y + drop.length);
        ctx.stroke();
      }
    });
  }

  private drawSnowflake(renderer: Renderer, cx: number, cy: number): void {
    // Snowflake glow
    renderer.drawRadialGlow(
      cx, cy, 0, 8,
      'rgba(232, 237, 242, 0.3)', 'rgba(232, 237, 242, 0)',
      LAYERS.UI,
    );

    renderer.setAlpha(0.8, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = DesignTokens.colors.snowFlake;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const angle = this.snowAngle + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 7, cy + Math.sin(angle) * 7);
        ctx.stroke();
      }
    });
  }

  private drawThunderCloud(renderer: Renderer, cx: number, cy: number): void {
    // Lightning flash
    if (this.lightningAlpha > 0.05) {
      renderer.setAlpha(this.lightningAlpha, LAYERS.UI, (ctx) => {
        ctx.fillStyle = DesignTokens.colors.thunder;
        ctx.fillRect(cx - 8, cy - 8, 16, 16);
      });
    }

    // Dark cloud
    renderer.setAlpha(0.9, LAYERS.UI, (ctx) => {
      ctx.fillStyle = DesignTokens.colors.neutral500;
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 2, 5, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy - 2, 4, 0, Math.PI * 2);
      ctx.arc(cx, cy - 4, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Lightning bolt
    renderer.setAlpha(0.8, LAYERS.UI, (ctx) => {
      ctx.fillStyle = DesignTokens.colors.thunder;
      ctx.beginPath();
      ctx.moveTo(cx + 1, cy + 1);
      ctx.lineTo(cx - 2, cy + 5);
      ctx.lineTo(cx, cy + 5);
      ctx.lineTo(cx - 1, cy + 9);
      ctx.lineTo(cx + 3, cy + 4);
      ctx.lineTo(cx + 1, cy + 4);
      ctx.closePath();
      ctx.fill();
    });
  }

  private drawFog(renderer: Renderer, cx: number, cy: number): void {
    renderer.setAlpha(0.6, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = DesignTokens.colors.fog;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const y = cy - 3 + i * 4;
        const offset = Math.sin(this.cloudOffset + i) * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 6 + offset, y);
        ctx.lineTo(cx + 6 + offset, y);
        ctx.stroke();
      }
    });
  }

  private drawWind(renderer: Renderer, cx: number, cy: number): void {
    renderer.setAlpha(0.7, LAYERS.UI, (ctx) => {
      ctx.strokeStyle = DesignTokens.colors.windPower;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const y = cy - 3 + i * 4;
        const offset = Math.sin(this.cloudOffset * 2 + i) * 2;
        const width = 8 - i * 2;
        ctx.beginPath();
        ctx.moveTo(cx - width / 2 + offset, y);
        ctx.quadraticCurveTo(cx + offset, y - 2, cx + width / 2 + offset, y);
        ctx.stroke();
      }
    });
  }

  setWeatherData(data: WeatherData): void {
    this.weatherData = data;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
