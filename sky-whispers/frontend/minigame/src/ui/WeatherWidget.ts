// ============================================================
// WeatherWidget - Weather indicator display
// ============================================================

import { Renderer } from '../core/Renderer';
import { WeatherType, WeatherData } from '../types';
import { LAYERS } from '../utils/constants';
import { DesignTokens } from '../utils/color';

const WEATHER_ICONS: Record<WeatherType, string> = {
  [WeatherType.Sunny]: '☀️',
  [WeatherType.Cloudy]: '☁️',
  [WeatherType.Rainy]: '🌧️',
  [WeatherType.Snowy]: '❄️',
  [WeatherType.Thunderstorm]: '⛈️',
  [WeatherType.Foggy]: '🌫️',
  [WeatherType.Windy]: '💨',
};

export class WeatherWidget {
  private x: number;
  private y: number;
  private weatherData: WeatherData | null = null;
  private width: number = 90;
  private height: number = 28;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(_dt: number): void {
    // No continuous updates needed
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

    if (!this.weatherData) {
      renderer.drawText(
        '加载中...',
        this.x + this.width / 2,
        this.y + this.height / 2,
        '#FFFFFF',
        DesignTokens.fontSize.xs,
        'center',
        'middle',
        LAYERS.UI,
      );
      return;
    }

    const icon = WEATHER_ICONS[this.weatherData.weather_type] ?? '🌤️';

    // Weather icon
    renderer.drawText(
      icon,
      this.x + 14,
      this.y + this.height / 2,
      '#FFFFFF',
      14,
      'center',
      'middle',
      LAYERS.UI,
    );

    // Temperature
    renderer.drawText(
      `${Math.round(this.weatherData.temperature)}°`,
      this.x + 30,
      this.y + this.height / 2,
      '#FFFFFF',
      DesignTokens.fontSize.sm,
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
      this.x + 55,
      this.y + this.height / 2,
      'rgba(255,255,255,0.8)',
      DesignTokens.fontSize.xs,
      'left',
      'middle',
      LAYERS.UI,
    );
  }

  setWeatherData(data: WeatherData): void {
    this.weatherData = data;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
