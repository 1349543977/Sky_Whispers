"use strict";
// ============================================================
// CoinSystem - Coin generation and management
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinSystem = void 0;
const types_1 = require("../types");
const EventManager_1 = require("../core/EventManager");
const constants_1 = require("../utils/constants");
class CoinSystem {
    constructor() {
        this.coins = 0;
        this.windmillLevel = 1;
        this.windPower = 0;
        this.idleAccumulator = 0;
        this.maxIdleSeconds = constants_1.GAME.MAX_IDLE_HOURS * 3600;
        this.autoCollect = false;
        this.uncollectedCoins = 0;
        this.lastCollectTime = Date.now();
        this.eventManager = EventManager_1.EventManager.getInstance();
    }
    init(coins, windmillLevel, windPower) {
        this.coins = coins;
        this.windmillLevel = windmillLevel;
        this.windPower = windPower;
        this.lastCollectTime = Date.now();
    }
    update(dt) {
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
    calculateGenerationRate() {
        // Base rate * windmill level * wind power factor
        const baseRate = constants_1.GAME.COIN_GENERATION_BASE;
        const levelMultiplier = 1 + (this.windmillLevel - 1) * 0.5;
        const windMultiplier = 1 + this.windPower * 0.1;
        return baseRate * levelMultiplier * windMultiplier;
    }
    collectCoins() {
        if (this.uncollectedCoins <= 0)
            return 0;
        const collected = Math.floor(this.uncollectedCoins);
        this.coins += collected;
        this.uncollectedCoins -= collected;
        this.lastCollectTime = Date.now();
        this.idleAccumulator = 0;
        this.eventManager.emit(types_1.GameEvent.CoinCollected, { amount: collected });
        return collected;
    }
    spendCoins(amount) {
        if (this.coins < amount)
            return false;
        this.coins -= amount;
        this.eventManager.emit(types_1.GameEvent.CoinSpent, { amount, item: 'unknown' });
        return true;
    }
    earnCoins(amount, source) {
        this.coins += amount;
        this.eventManager.emit(types_1.GameEvent.CoinEarned, { amount, source });
    }
    setWindmillLevel(level) {
        this.windmillLevel = level;
    }
    setWindPower(power) {
        this.windPower = power;
    }
    setAutoCollect(enabled) {
        this.autoCollect = enabled;
    }
    getCoins() {
        return this.coins;
    }
    getUncollectedCoins() {
        return this.uncollectedCoins;
    }
    getGenerationRate() {
        return this.calculateGenerationRate();
    }
    calculateOfflineEarnings(offlineSeconds) {
        const rate = this.calculateGenerationRate();
        const cappedSeconds = Math.min(offlineSeconds, this.maxIdleSeconds);
        return Math.floor(rate * cappedSeconds);
    }
}
exports.CoinSystem = CoinSystem;
//# sourceMappingURL=CoinSystem.js.map