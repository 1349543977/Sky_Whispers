// ============================================================
// SpriteSpawnSystem - Weather sprite spawning logic
// ============================================================

import { WeatherType, SpriteType, WeatherSprite, GameEvent } from '../types';
import { EventManager } from '../core/EventManager';
import { WeatherSystem } from './WeatherSystem';
import { ApiClient } from '../services/ApiClient';
import { GAME } from '../utils/constants';
import { TimerManager } from '../utils/timer';
import { randomRange } from '../utils/math';

export class SpriteSpawnSystem {
  private eventManager: EventManager;
  private weatherSystem: WeatherSystem;
  private apiClient: ApiClient;
  private timerManager: TimerManager;
  private availableSpriteTypes: SpriteType[] = [];
  private activeSprites: WeatherSprite[] = [];
  private initialized: boolean = false;

  constructor(weatherSystem: WeatherSystem, apiClient: ApiClient) {
    this.weatherSystem = weatherSystem;
    this.apiClient = apiClient;
    this.eventManager = EventManager.getInstance();
    this.timerManager = new TimerManager();
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadSpriteTypes();
    } catch (err) {
      console.error('[SpriteSpawnSystem] Init failed:', err);
    }

    // Check for sprite spawns periodically
    this.timerManager.addTimer(
      GAME.SPRITE_SPAWN_INTERVAL_MS,
      () => this.checkSpawn(),
      true,
    );

    this.initialized = true;
  }

  private async loadSpriteTypes(): Promise<void> {
    try {
      const response = await this.apiClient.getSpriteTypes();
      if (response.code === 0) {
        this.availableSpriteTypes = response.data.items;
      }
    } catch (err) {
      console.error('[SpriteSpawnSystem] Load sprite types failed:', err);
    }
  }

  private checkSpawn(): void {
    const weatherType = this.weatherSystem.getWeatherType();

    // Find sprite types that match current weather
    const matchingTypes = this.availableSpriteTypes.filter(
      (st) => st.weather_condition === weatherType,
    );

    if (matchingTypes.length === 0) return;

    // Random chance to spawn
    const spawnChance = 0.3; // 30% chance each check
    if (Math.random() > spawnChance) return;

    // Pick a random matching type
    const spriteType = matchingTypes[Math.floor(Math.random() * matchingTypes.length)];

    // Check catch rate
    if (Math.random() > spriteType.catch_rate) {
      // Sprite appeared but wasn't caught
      this.eventManager.emit(GameEvent.SpriteSpawned, { spriteType });
    }
  }

  async attemptCatch(spriteTypeId: string): Promise<WeatherSprite | null> {
    try {
      const response = await this.apiClient.catchSprite({
        sprite_type_id: spriteTypeId,
      });

      if (response.code === 0) {
        const sprite = response.data;
        this.activeSprites.push(sprite);
        this.eventManager.emit(GameEvent.SpriteCaught, { sprite });
        return sprite;
      }
      return null;
    } catch (err) {
      console.error('[SpriteSpawnSystem] Catch attempt failed:', err);
      return null;
    }
  }

  async feedSprite(spriteId: string): Promise<boolean> {
    try {
      const response = await this.apiClient.feedSprite(spriteId);
      if (response.code === 0) {
        this.eventManager.emit(GameEvent.SpriteFed, { spriteId });
        return true;
      }
      return false;
    } catch (err) {
      console.error('[SpriteSpawnSystem] Feed sprite failed:', err);
      return false;
    }
  }

  update(dt: number): void {
    this.timerManager.update(dt * 1000);
  }

  getActiveSprites(): WeatherSprite[] {
    return this.activeSprites;
  }

  getAvailableTypes(): SpriteType[] {
    return this.availableSpriteTypes;
  }

  destroy(): void {
    this.timerManager.clear();
    this.initialized = false;
  }
}
