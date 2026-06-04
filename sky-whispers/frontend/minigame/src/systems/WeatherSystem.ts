// ============================================================
// WeatherSystem - Weather sync & effects management
// ============================================================

import { WeatherType, WeatherData, GameEvent } from '../types';
import { EventManager } from '../core/EventManager';
import { ApiClient } from '../services/ApiClient';
import { WxService } from '../services/WxService';
import { GAME } from '../utils/constants';
import { TimerManager } from '../utils/timer';

export class WeatherSystem {
  private eventManager: EventManager;
  private apiClient: ApiClient;
  private wxService: WxService;
  private timerManager: TimerManager;
  private currentWeather: WeatherData | null = null;
  private previousWeatherType: WeatherType | null = null;
  private initialized: boolean = false;

  constructor(apiClient: ApiClient, wxService: WxService) {
    this.apiClient = apiClient;
    this.wxService = wxService;
    this.eventManager = EventManager.getInstance();
    this.timerManager = new TimerManager();
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.fetchWeather();
    } catch (err) {
      console.error('[WeatherSystem] Init failed, using default weather:', err);
      this.setDefaultWeather();
    }

    // Poll weather every 15 minutes
    this.timerManager.addTimer(
      GAME.WEATHER_POLL_INTERVAL_MS,
      () => this.fetchWeather(),
      true,
    );

    this.initialized = true;
  }

  private async fetchWeather(): Promise<void> {
    try {
      let location: { latitude: number; longitude: number } | null = null;

      try {
        location = await this.wxService.getLocation();
      } catch {
        console.warn('[WeatherSystem] Location permission denied, using IP-based location');
      }

      const response = await this.apiClient.getWeather({
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      if (response.code === 0) {
        this.setWeather(response.data);
      }
    } catch (err) {
      console.error('[WeatherSystem] Fetch weather failed:', err);
    }
  }

  private setWeather(data: WeatherData): void {
    this.currentWeather = data;

    if (this.previousWeatherType && this.previousWeatherType !== data.weather_type) {
      this.eventManager.emit(GameEvent.WeatherEffectStop, this.previousWeatherType);
      this.eventManager.emit(GameEvent.WeatherEffectStart, data.weather_type);
    } else if (!this.previousWeatherType) {
      this.eventManager.emit(GameEvent.WeatherEffectStart, data.weather_type);
    }

    this.previousWeatherType = data.weather_type;
    this.eventManager.emit(GameEvent.WeatherUpdated, data);
  }

  private setDefaultWeather(): void {
    const defaultWeather: WeatherData = {
      location: '0,0',
      city: '未知',
      weather_code: '100',
      weather_type: WeatherType.Sunny,
      temperature: 22,
      humidity: 50,
      wind_speed: 5,
      wind_direction: 'NE',
      description: '晴',
      updated_at: new Date().toISOString(),
    };
    this.setWeather(defaultWeather);
  }

  update(dt: number): void {
    this.timerManager.update(dt * 1000);
  }

  getCurrentWeather(): WeatherData | null {
    return this.currentWeather;
  }

  getWeatherType(): WeatherType {
    return this.currentWeather?.weather_type ?? WeatherType.Sunny;
  }

  getGrowthMultiplier(): number {
    const type = this.getWeatherType();
    return GAME.GROWTH_WEATHER_MULTIPLIER[type] ?? 1.0;
  }

  getWindPower(): number {
    return this.currentWeather?.wind_speed ?? 0;
  }

  destroy(): void {
    this.timerManager.clear();
    this.initialized = false;
  }
}
