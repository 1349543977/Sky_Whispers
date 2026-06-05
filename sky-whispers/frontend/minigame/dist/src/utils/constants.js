"use strict";
// ============================================================
// Game Constants
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.RARITY_COLORS = exports.ANIMATION = exports.API = exports.COLORS = exports.LAYERS = exports.GAME = exports.SCREEN = void 0;
exports.SCREEN = {
    DESIGN_WIDTH: 375,
    DESIGN_HEIGHT: 667,
};
exports.GAME = {
    FPS: 60,
    FIXED_TIMESTEP: 1 / 60,
    MAX_DELTA: 0.1,
    MAX_IDLE_HOURS: 8,
    COIN_GENERATION_BASE: 1,
    WEATHER_POLL_INTERVAL_MS: 15 * 60 * 1000,
    SPRITE_SPAWN_INTERVAL_MS: 30 * 60 * 1000,
    STEP_TO_WIND_RATIO: 0.01,
    GIFT_EXPIRY_HOURS: 48,
    MAX_PLANT_SLOTS: 9,
    MAX_WINDMILL_LEVEL: 10,
    MAX_SPRITE_LEVEL: 30,
    GROWTH_WEATHER_MULTIPLIER: {
        sunny: 1.0,
        cloudy: 0.9,
        rainy: 1.3,
        snowy: 0.7,
        thunderstorm: 0.5,
        foggy: 0.8,
        windy: 1.1,
    },
};
exports.LAYERS = {
    BACKGROUND: 0,
    ENTITIES: 10,
    EFFECTS: 20,
    UI: 30,
    OVERLAY: 40,
};
exports.COLORS = {
    ISLAND_BASE: '#8BC34A',
    ISLAND_GRASS: '#4CAF50',
    ISLAND_DIRT: '#795548',
    WATER: '#42A5F5',
    CLOUD_WHITE: '#FFFFFF',
    CLOUD_RAIN: '#90A4AE',
    CLOUD_GIFT: '#FFD54F',
    RAIN: '#64B5F6',
    SNOW: '#ECEFF1',
    THUNDER: '#FFF9C4',
    FOG: '#B0BEC5',
    PLANT_SEED: '#8D6E63',
    PLANT_SPROUT: '#AED581',
    PLANT_GROWING: '#66BB6A',
    PLANT_MATURE: '#43A047',
    COIN_GOLD: '#FFC107',
    WINDMILL_BLADE: '#EFEBE9',
    WINDMILL_BASE: '#795548',
    SPRITE_GLOW: '#E1BEE7',
};
exports.API = {
    BASE_URL: '', // Set from env/config
    TIMEOUT: 10000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
};
exports.ANIMATION = {
    ISLAND_BOB_AMPLITUDE: 3,
    ISLAND_BOB_SPEED: 0.002,
    PLANT_SWAY_AMPLITUDE: 2,
    PLANT_SWAY_SPEED: 0.003,
    CLOUD_DRIFT_SPEED: 0.3,
    WINDMILL_BASE_SPEED: 0.02,
    COIN_PARTICLE_SPEED: 2,
    COIN_PARTICLE_LIFE: 1000,
    TOAST_DURATION: 2000,
    DIALOG_FADE_DURATION: 200,
    PANEL_SLIDE_DURATION: 300,
    SKELETON_SHIMMER_SPEED: 0.005,
};
exports.RARITY_COLORS = {
    common: '#9E9E9E',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800',
};
//# sourceMappingURL=constants.js.map