export declare const SCREEN: {
    readonly DESIGN_WIDTH: 375;
    readonly DESIGN_HEIGHT: 667;
};
export declare const GAME: {
    readonly FPS: 60;
    readonly FIXED_TIMESTEP: number;
    readonly MAX_DELTA: 0.1;
    readonly MAX_IDLE_HOURS: 8;
    readonly COIN_GENERATION_BASE: 1;
    readonly WEATHER_POLL_INTERVAL_MS: number;
    readonly SPRITE_SPAWN_INTERVAL_MS: number;
    readonly STEP_TO_WIND_RATIO: 0.01;
    readonly GIFT_EXPIRY_HOURS: 48;
    readonly MAX_PLANT_SLOTS: 9;
    readonly MAX_WINDMILL_LEVEL: 10;
    readonly MAX_SPRITE_LEVEL: 30;
    readonly GROWTH_WEATHER_MULTIPLIER: {
        readonly sunny: 1;
        readonly cloudy: 0.9;
        readonly rainy: 1.3;
        readonly snowy: 0.7;
        readonly thunderstorm: 0.5;
        readonly foggy: 0.8;
        readonly windy: 1.1;
    };
};
export declare const LAYERS: {
    readonly BACKGROUND: 0;
    readonly ENTITIES: 10;
    readonly EFFECTS: 20;
    readonly UI: 30;
    readonly OVERLAY: 40;
};
export declare const COLORS: {
    readonly ISLAND_BASE: "#8BC34A";
    readonly ISLAND_GRASS: "#4CAF50";
    readonly ISLAND_DIRT: "#795548";
    readonly WATER: "#42A5F5";
    readonly CLOUD_WHITE: "#FFFFFF";
    readonly CLOUD_RAIN: "#90A4AE";
    readonly CLOUD_GIFT: "#FFD54F";
    readonly RAIN: "#64B5F6";
    readonly SNOW: "#ECEFF1";
    readonly THUNDER: "#FFF9C4";
    readonly FOG: "#B0BEC5";
    readonly PLANT_SEED: "#8D6E63";
    readonly PLANT_SPROUT: "#AED581";
    readonly PLANT_GROWING: "#66BB6A";
    readonly PLANT_MATURE: "#43A047";
    readonly COIN_GOLD: "#FFC107";
    readonly WINDMILL_BLADE: "#EFEBE9";
    readonly WINDMILL_BASE: "#795548";
    readonly SPRITE_GLOW: "#E1BEE7";
};
export declare const API: {
    readonly BASE_URL: "";
    readonly TIMEOUT: 10000;
    readonly RETRY_COUNT: 3;
    readonly RETRY_DELAY: 1000;
};
export declare const ANIMATION: {
    readonly ISLAND_BOB_AMPLITUDE: 3;
    readonly ISLAND_BOB_SPEED: 0.002;
    readonly PLANT_SWAY_AMPLITUDE: 2;
    readonly PLANT_SWAY_SPEED: 0.003;
    readonly CLOUD_DRIFT_SPEED: 0.3;
    readonly WINDMILL_BASE_SPEED: 0.02;
    readonly COIN_PARTICLE_SPEED: 2;
    readonly COIN_PARTICLE_LIFE: 1000;
    readonly TOAST_DURATION: 2000;
    readonly DIALOG_FADE_DURATION: 200;
    readonly PANEL_SLIDE_DURATION: 300;
    readonly SKELETON_SHIMMER_SPEED: 0.005;
};
export declare const RARITY_COLORS: Record<string, string>;
//# sourceMappingURL=constants.d.ts.map