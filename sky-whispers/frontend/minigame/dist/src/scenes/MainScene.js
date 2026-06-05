"use strict";
// ============================================================
// MainScene - Core island view
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainScene = void 0;
const Scene_1 = require("../core/Scene");
const types_1 = require("../types");
const Island_1 = require("../entities/Island");
const Windmill_1 = require("../entities/Windmill");
const Cloud_1 = require("../entities/Cloud");
const RainEffect_1 = require("../entities/RainEffect");
const SnowEffect_1 = require("../entities/SnowEffect");
const ThunderEffect_1 = require("../entities/ThunderEffect");
const FogEffect_1 = require("../entities/FogEffect");
const WeatherSystem_1 = require("../systems/WeatherSystem");
const GrowthSystem_1 = require("../systems/GrowthSystem");
const CoinSystem_1 = require("../systems/CoinSystem");
const StepSystem_1 = require("../systems/StepSystem");
const SpriteSpawnSystem_1 = require("../systems/SpriteSpawnSystem");
const TabBar_1 = require("../ui/TabBar");
const CoinDisplay_1 = require("../ui/CoinDisplay");
const WeatherWidget_1 = require("../ui/WeatherWidget");
const StepWidget_1 = require("../ui/StepWidget");
const Toast_1 = require("../ui/Toast");
const ApiClient_1 = require("../services/ApiClient");
const WxService_1 = require("../services/WxService");
const StorageService_1 = require("../services/StorageService");
const constants_1 = require("../utils/constants");
class MainScene extends Scene_1.Scene {
    constructor(renderer, input) {
        super(types_1.SceneName.Main, renderer, input);
        // Entities
        this.island = null;
        this.plants = [];
        this.sprites = [];
        this.windmill = null;
        this.clouds = [];
        // Weather effects
        this.rainEffect = null;
        this.snowEffect = null;
        this.thunderEffect = null;
        this.fogEffect = null;
        this.currentWeatherType = types_1.WeatherType.Sunny;
        this.storageService = new StorageService_1.StorageService();
        this.apiClient = new ApiClient_1.ApiClient('', this.storageService);
        this.wxService = new WxService_1.WxService();
    }
    async onLoad() {
        // Initialize systems
        this.weatherSystem = new WeatherSystem_1.WeatherSystem(this.apiClient, this.wxService);
        this.growthSystem = new GrowthSystem_1.GrowthSystem(this.weatherSystem);
        this.coinSystem = new CoinSystem_1.CoinSystem();
        this.stepSystem = new StepSystem_1.StepSystem(this.wxService, this.apiClient);
        this.spriteSpawnSystem = new SpriteSpawnSystem_1.SpriteSpawnSystem(this.weatherSystem, this.apiClient);
        // Initialize UI
        this.initUI();
        // Load game data
        await this.loadGameData();
        // Initialize systems
        await this.weatherSystem.init();
        await this.stepSystem.init();
        await this.spriteSpawnSystem.init();
        // Setup event listeners
        this.setupEventListeners();
        // Initialize weather effects
        this.initWeatherEffects();
        // Spawn initial clouds
        this.spawnClouds();
        this.loaded = true;
    }
    initUI() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        this.coinDisplay = new CoinDisplay_1.CoinDisplay(12, 12);
        this.weatherWidget = new WeatherWidget_1.WeatherWidget(w - 102, 12);
        this.stepWidget = new StepWidget_1.StepWidget(w - 122, 44);
        this.toastManager = new Toast_1.ToastManager(w);
        this.tabBar = new TabBar_1.TabBar([
            { id: 'island', label: '岛屿', icon: '🏝️', activeIcon: '🏝️' },
            { id: 'social', label: '好友', icon: '👥', activeIcon: '👥', badge: 0 },
            { id: 'shop', label: '商店', icon: '🛒', activeIcon: '🛒' },
            { id: 'codex', label: '图鉴', icon: '📖', activeIcon: '📖' },
            { id: 'settings', label: '设置', icon: '⚙️', activeIcon: '⚙️' },
        ], w, h, (tabId) => this.handleTabChange(tabId));
    }
    async loadGameData() {
        var _a, _b;
        try {
            // Load island data
            const islandResponse = await this.apiClient.getIsland();
            if (islandResponse.code === 0) {
                this.createIsland(islandResponse.data);
            }
            // Load user data for coins
            const userResponse = await this.apiClient.getUser();
            if (userResponse.code === 0) {
                this.coinSystem.init(userResponse.data.coins, (_b = (_a = islandResponse.data) === null || _a === void 0 ? void 0 : _a.windmill_level) !== null && _b !== void 0 ? _b : 1, 0);
                this.coinDisplay.setCoins(userResponse.data.coins);
            }
        }
        catch (err) {
            console.error('[MainScene] Load game data failed:', err);
            this.toastManager.show({ text: '加载数据失败，请重试' });
        }
    }
    createIsland(data) {
        const w = this.renderer.width;
        const islandX = (w - 280) / 2;
        const islandY = this.renderer.height * 0.35;
        this.island = new Island_1.Island(data, islandX, islandY);
        // Create windmill
        this.windmill = new Windmill_1.Windmill(islandX + 200, islandY - 20, data.windmill_level, 0);
    }
    setupEventListeners() {
        this.eventManager.on(types_1.GameEvent.WeatherUpdated, (data) => {
            this.weatherWidget.setWeatherData(data);
            this.updateWeatherEffects(data.weather_type);
        });
        this.eventManager.on(types_1.GameEvent.CoinCollected, ({ amount }) => {
            this.coinDisplay.setCoins(this.coinSystem.getCoins());
        });
        this.eventManager.on(types_1.GameEvent.CoinEarned, ({ amount }) => {
            this.coinDisplay.setCoins(this.coinSystem.getCoins());
        });
        this.eventManager.on(types_1.GameEvent.WindPowerChanged, ({ windPower }) => {
            var _a;
            this.stepWidget.setWindPower(windPower);
            (_a = this.windmill) === null || _a === void 0 ? void 0 : _a.setWindPower(windPower);
            this.coinSystem.setWindPower(windPower);
        });
        this.eventManager.on(types_1.GameEvent.StepsUpdated, ({ steps }) => {
            this.stepWidget.setSteps(steps);
        });
    }
    initWeatherEffects() {
        const w = this.renderer.width;
        const h = this.renderer.height;
        const groundY = h * 0.7;
        this.rainEffect = new RainEffect_1.RainEffect(w, h, groundY);
        this.snowEffect = new SnowEffect_1.SnowEffect(w, h);
        this.thunderEffect = new ThunderEffect_1.ThunderEffect(w, h);
        this.fogEffect = new FogEffect_1.FogEffect(w, h);
        // Initially all effects are off
        this.rainEffect.setActive(false);
        this.snowEffect.setActive(false);
        this.thunderEffect.setActive(false);
        this.fogEffect.setActive(false);
    }
    updateWeatherEffects(weatherType) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (this.currentWeatherType === weatherType)
            return;
        // Deactivate all effects
        (_a = this.rainEffect) === null || _a === void 0 ? void 0 : _a.setActive(false);
        (_b = this.snowEffect) === null || _b === void 0 ? void 0 : _b.setActive(false);
        (_c = this.thunderEffect) === null || _c === void 0 ? void 0 : _c.setActive(false);
        (_d = this.fogEffect) === null || _d === void 0 ? void 0 : _d.setActive(false);
        // Activate appropriate effect
        switch (weatherType) {
            case types_1.WeatherType.Rainy:
                (_e = this.rainEffect) === null || _e === void 0 ? void 0 : _e.setActive(true);
                break;
            case types_1.WeatherType.Snowy:
                (_f = this.snowEffect) === null || _f === void 0 ? void 0 : _f.setActive(true);
                break;
            case types_1.WeatherType.Thunderstorm:
                (_g = this.rainEffect) === null || _g === void 0 ? void 0 : _g.setActive(true);
                (_h = this.thunderEffect) === null || _h === void 0 ? void 0 : _h.setActive(true);
                break;
            case types_1.WeatherType.Foggy:
                (_j = this.fogEffect) === null || _j === void 0 ? void 0 : _j.setActive(true);
                break;
            case types_1.WeatherType.Cloudy:
                // Just clouds, no special effect
                break;
            case types_1.WeatherType.Windy:
                // Wind increases cloud speed - handled in cloud update
                break;
            default:
                break;
        }
        this.currentWeatherType = weatherType;
    }
    spawnClouds() {
        const w = this.renderer.width;
        const count = 3 + Math.floor(Math.random() * 3);
        this.clouds = [];
        for (let i = 0; i < count; i++) {
            this.clouds.push(new Cloud_1.Cloud(Math.random() * w, 30 + Math.random() * 80, constants_1.ANIMATION.CLOUD_DRIFT_SPEED * (0.5 + Math.random()), 'normal', w));
        }
    }
    handleTabChange(tabId) {
        switch (tabId) {
            case 'social':
                // Navigate to social scene
                break;
            case 'shop':
                // Navigate to shop scene
                break;
            case 'codex':
                // Navigate to codex scene
                break;
            case 'settings':
                // Navigate to settings scene
                break;
            default:
                break;
        }
    }
    update(dt) {
        var _a, _b, _c, _d, _e, _f;
        // Update systems
        this.weatherSystem.update(dt);
        this.growthSystem.update(dt);
        this.coinSystem.update(dt);
        this.spriteSpawnSystem.update(dt);
        // Update entities
        (_a = this.island) === null || _a === void 0 ? void 0 : _a.update(dt);
        (_b = this.windmill) === null || _b === void 0 ? void 0 : _b.update(dt);
        for (const plant of this.plants) {
            plant.update(dt);
        }
        for (const sprite of this.sprites) {
            sprite.update(dt);
        }
        for (const cloud of this.clouds) {
            cloud.update(dt);
        }
        // Update weather effects
        (_c = this.rainEffect) === null || _c === void 0 ? void 0 : _c.update(dt);
        (_d = this.snowEffect) === null || _d === void 0 ? void 0 : _d.update(dt);
        (_e = this.thunderEffect) === null || _e === void 0 ? void 0 : _e.update(dt);
        (_f = this.fogEffect) === null || _f === void 0 ? void 0 : _f.update(dt);
        // Update UI
        this.coinDisplay.update(dt);
        this.weatherWidget.update(dt);
        this.stepWidget.update(dt);
        this.toastManager.update(dt);
        this.tabBar.update(dt);
    }
    fixedUpdate(dt) {
        // Fixed timestep updates for physics/growth
    }
    render() {
        var _a, _b, _c, _d, _e, _f;
        const w = this.renderer.width;
        const h = this.renderer.height;
        // Sky background
        this.renderSkyBackground(w, h);
        // Clouds (behind island)
        for (const cloud of this.clouds) {
            cloud.render(this.renderer);
        }
        // Island
        (_a = this.island) === null || _a === void 0 ? void 0 : _a.render(this.renderer);
        // Plants
        for (const plant of this.plants) {
            plant.render(this.renderer);
        }
        // Sprites
        for (const sprite of this.sprites) {
            sprite.render(this.renderer);
        }
        // Windmill
        (_b = this.windmill) === null || _b === void 0 ? void 0 : _b.render(this.renderer);
        // Weather effects
        (_c = this.rainEffect) === null || _c === void 0 ? void 0 : _c.render(this.renderer);
        (_d = this.snowEffect) === null || _d === void 0 ? void 0 : _d.render(this.renderer);
        (_e = this.thunderEffect) === null || _e === void 0 ? void 0 : _e.render(this.renderer);
        (_f = this.fogEffect) === null || _f === void 0 ? void 0 : _f.render(this.renderer);
        // HUD
        this.coinDisplay.render(this.renderer);
        this.weatherWidget.render(this.renderer);
        this.stepWidget.render(this.renderer);
        // Tab bar
        this.tabBar.render(this.renderer);
        // Toasts
        this.toastManager.render(this.renderer);
    }
    renderSkyBackground(w, h) {
        let topColor = '#87CEEB';
        let bottomColor = '#E0F7FA';
        switch (this.currentWeatherType) {
            case types_1.WeatherType.Rainy:
                topColor = '#546E7A';
                bottomColor = '#78909C';
                break;
            case types_1.WeatherType.Snowy:
                topColor = '#B0BEC5';
                bottomColor = '#ECEFF1';
                break;
            case types_1.WeatherType.Thunderstorm:
                topColor = '#37474F';
                bottomColor = '#546E7A';
                break;
            case types_1.WeatherType.Foggy:
                topColor = '#90A4AE';
                bottomColor = '#CFD8DC';
                break;
            case types_1.WeatherType.Cloudy:
                topColor = '#78909C';
                bottomColor = '#B0BEC5';
                break;
            default:
                break;
        }
        this.renderer.drawGradientRect(0, 0, w, h, topColor, bottomColor, true, constants_1.LAYERS.BACKGROUND);
    }
    onUnload() {
        this.weatherSystem.destroy();
        this.stepSystem.destroy();
        this.spriteSpawnSystem.destroy();
    }
}
exports.MainScene = MainScene;
//# sourceMappingURL=MainScene.js.map