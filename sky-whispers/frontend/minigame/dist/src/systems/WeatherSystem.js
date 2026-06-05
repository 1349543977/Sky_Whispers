"use strict";
// ============================================================
// WeatherSystem - Weather sync & effects management
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherSystem = void 0;
const types_1 = require("../types");
const EventManager_1 = require("../core/EventManager");
const constants_1 = require("../utils/constants");
const timer_1 = require("../utils/timer");
class WeatherSystem {
    constructor(apiClient, wxService) {
        this.currentWeather = null;
        this.previousWeatherType = null;
        this.initialized = false;
        this.apiClient = apiClient;
        this.wxService = wxService;
        this.eventManager = EventManager_1.EventManager.getInstance();
        this.timerManager = new timer_1.TimerManager();
    }
    async init() {
        if (this.initialized)
            return;
        try {
            await this.fetchWeather();
        }
        catch (err) {
            console.error('[WeatherSystem] Init failed, using default weather:', err);
            this.setDefaultWeather();
        }
        // Poll weather every 15 minutes
        this.timerManager.addTimer(constants_1.GAME.WEATHER_POLL_INTERVAL_MS, () => this.fetchWeather(), true);
        this.initialized = true;
    }
    async fetchWeather() {
        try {
            let location = null;
            try {
                location = await this.wxService.getLocation();
            }
            catch (_a) {
                console.warn('[WeatherSystem] Location permission denied, using IP-based location');
            }
            const response = await this.apiClient.getWeather({
                latitude: location === null || location === void 0 ? void 0 : location.latitude,
                longitude: location === null || location === void 0 ? void 0 : location.longitude,
            });
            if (response.code === 0) {
                this.setWeather(response.data);
            }
        }
        catch (err) {
            console.error('[WeatherSystem] Fetch weather failed:', err);
        }
    }
    setWeather(data) {
        this.currentWeather = data;
        if (this.previousWeatherType && this.previousWeatherType !== data.weather_type) {
            this.eventManager.emit(types_1.GameEvent.WeatherEffectStop, this.previousWeatherType);
            this.eventManager.emit(types_1.GameEvent.WeatherEffectStart, data.weather_type);
        }
        else if (!this.previousWeatherType) {
            this.eventManager.emit(types_1.GameEvent.WeatherEffectStart, data.weather_type);
        }
        this.previousWeatherType = data.weather_type;
        this.eventManager.emit(types_1.GameEvent.WeatherUpdated, data);
    }
    setDefaultWeather() {
        const defaultWeather = {
            location: '0,0',
            city: '未知',
            weather_code: '100',
            weather_type: types_1.WeatherType.Sunny,
            temperature: 22,
            humidity: 50,
            wind_speed: 5,
            wind_direction: 'NE',
            description: '晴',
            updated_at: new Date().toISOString(),
        };
        this.setWeather(defaultWeather);
    }
    update(dt) {
        this.timerManager.update(dt * 1000);
    }
    getCurrentWeather() {
        return this.currentWeather;
    }
    getWeatherType() {
        var _a, _b;
        return (_b = (_a = this.currentWeather) === null || _a === void 0 ? void 0 : _a.weather_type) !== null && _b !== void 0 ? _b : types_1.WeatherType.Sunny;
    }
    getGrowthMultiplier() {
        var _a;
        const type = this.getWeatherType();
        return (_a = constants_1.GAME.GROWTH_WEATHER_MULTIPLIER[type]) !== null && _a !== void 0 ? _a : 1.0;
    }
    getWindPower() {
        var _a, _b;
        return (_b = (_a = this.currentWeather) === null || _a === void 0 ? void 0 : _a.wind_speed) !== null && _b !== void 0 ? _b : 0;
    }
    destroy() {
        this.timerManager.clear();
        this.initialized = false;
    }
}
exports.WeatherSystem = WeatherSystem;
//# sourceMappingURL=WeatherSystem.js.map