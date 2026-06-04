// ============================================================
// CoinSystem - Coin generation and management
// ============================================================

import { GameEvent } from '../types';
import { EventManager } from '../core/EventManager';
import { GAME } from '../utils/constants';

export class CoinSystem {
  private eventManager: EventManager;
  private coins: number = 0;
  private windmillLevel: number = 1;
  private windPower: number = 0;
  private idleAccumulator: number = 0;
  private maxIdleSeconds: number = GAME.MAX_IDLE_HOURS * 3600;
  private autoCollect: boolean = false;
  private uncollectedCoins: number = 0;
  private lastCollectTime: number = Date.now();

  constructor() {
    this.eventManager = EventManager.getInstance();
  }

  init(coins: number, windmillLevel: number, windPower: number): void {
    this.coins = coins;
    this.windmillLevel = windmillLevel;
    this.windPower = windPower;
    this.lastCollectTime = Date.now();
  }

  update(dt: number): void {
    // Calculate coin generation rate
    const rate = this.calculateGenerationRate();

    // Accumulate uncollected coins
    this.uncollectedCoins += rate * dt;
    this.idleAccumulator += dt;

    // Auto-collect if enabled
    if (this.autoCollect) {
      this.collectCoins();
    }

    // Cap idle accumulation
    if (this.idleAccumulator >= this.maxIdleSeconds) {
      this.idleAccumulator = this.maxIdleSeconds;
    }
  }

  private calculateGenerationRate(): number {
    // Base rate * windmill level * wind power factor
    const baseRate = GAME.COIN_GENERATION_BASE;
    const levelMultiplier = 1 + (this.windmillLevel - 1) * 0.5;
    const windMultiplier = 1 + this.windPower * 0.1;
    return baseRate * levelMultiplier * windMultiplier;
  }

  collectCoins(): number {
    if (this.uncollectedCoins <= 0) return 0;

    const collected = Math.floor(this.uncollectedCoins);
    this.coins += collected;
    this.uncollectedCoins -= collected;
    this.lastCollectTime = Date.now();
    this.idleAccumulator = 0;

    this.eventManager.emit(GameEvent.CoinCollected, { amount: collected });
    return collected;
  }

  spendCoins(amount: number): boolean {
    if (this.coins < amount) return false;

    this.coins -= amount;
    this.eventManager.emit(GameEvent.CoinSpent, { amount, item: 'unknown' });
    return true;
  }

  earnCoins(amount: number, source: string): void {
    this.coins += amount;
    this.eventManager.emit(GameEvent.CoinEarned, { amount, source });
  }

  setWindmillLevel(level: number): void {
    this.windmillLevel = level;
  }

  setWindPower(power: number): void {
    this.windPower = power;
  }

  setAutoCollect(enabled: boolean): void {
    this.autoCollect = enabled;
  }

  getCoins(): number {
    return this.coins;
  }

  getUncollectedCoins(): number {
    return this.uncollectedCoins;
  }

  getGenerationRate(): number {
    return this.calculateGenerationRate();
  }

  calculateOfflineEarnings(offlineSeconds: number): number {
    const rate = this.calculateGenerationRate();
    const cappedSeconds = Math.min(offlineSeconds, this.maxIdleSeconds);
    return Math.floor(rate * cappedSeconds);
  }
}
