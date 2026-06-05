"use strict";
// ============================================================
// SpriteSpawnSystem - Weather sprite spawning logic
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteSpawnSystem = void 0;
const types_1 = require("../types");
const EventManager_1 = require("../core/EventManager");
const constants_1 = require("../utils/constants");
const timer_1 = require("../utils/timer");
class SpriteSpawnSystem {
    constructor(weatherSystem, apiClient) {
        this.availableSpriteTypes = [];
        this.activeSprites = [];
        this.initialized = false;
        this.weatherSystem = weatherSystem;
        this.apiClient = apiClient;
        this.eventManager = EventManager_1.EventManager.getInstance();
        this.timerManager = new timer_1.TimerManager();
    }
    async init() {
        if (this.initialized)
            return;
        try {
            await this.loadSpriteTypes();
        }
        catch (err) {
            console.error('[SpriteSpawnSystem] Init failed:', err);
        }
        // Check for sprite spawns periodically
        this.timerManager.addTimer(constants_1.GAME.SPRITE_SPAWN_INTERVAL_MS, () => this.checkSpawn(), true);
        this.initialized = true;
    }
    async loadSpriteTypes() {
        try {
            const response = await this.apiClient.getSpriteTypes();
            if (response.code === 0) {
                this.availableSpriteTypes = response.data.items;
            }
        }
        catch (err) {
            console.error('[SpriteSpawnSystem] Load sprite types failed:', err);
        }
    }
    checkSpawn() {
        const weatherType = this.weatherSystem.getWeatherType();
        // Find sprite types that match current weather
        const matchingTypes = this.availableSpriteTypes.filter((st) => st.weather_condition === weatherType);
        if (matchingTypes.length === 0)
            return;
        // Random chance to spawn
        const spawnChance = 0.3; // 30% chance each check
        if (Math.random() > spawnChance)
            return;
        // Pick a random matching type
        const spriteType = matchingTypes[Math.floor(Math.random() * matchingTypes.length)];
        // Check catch rate
        if (Math.random() > spriteType.catch_rate) {
            // Sprite appeared but wasn't caught
            this.eventManager.emit(types_1.GameEvent.SpriteSpawned, { spriteType });
        }
    }
    async attemptCatch(spriteTypeId) {
        try {
            const response = await this.apiClient.catchSprite({
                sprite_type_id: spriteTypeId,
            });
            if (response.code === 0) {
                const sprite = response.data;
                this.activeSprites.push(sprite);
                this.eventManager.emit(types_1.GameEvent.SpriteCaught, { sprite });
                return sprite;
            }
            return null;
        }
        catch (err) {
            console.error('[SpriteSpawnSystem] Catch attempt failed:', err);
            return null;
        }
    }
    async feedSprite(spriteId) {
        try {
            const response = await this.apiClient.feedSprite(spriteId);
            if (response.code === 0) {
                this.eventManager.emit(types_1.GameEvent.SpriteFed, { spriteId });
                return true;
            }
            return false;
        }
        catch (err) {
            console.error('[SpriteSpawnSystem] Feed sprite failed:', err);
            return false;
        }
    }
    update(dt) {
        this.timerManager.update(dt * 1000);
    }
    getActiveSprites() {
        return this.activeSprites;
    }
    getAvailableTypes() {
        return this.availableSpriteTypes;
    }
    destroy() {
        this.timerManager.clear();
        this.initialized = false;
    }
}
exports.SpriteSpawnSystem = SpriteSpawnSystem;
//# sourceMappingURL=SpriteSpawnSystem.js.map