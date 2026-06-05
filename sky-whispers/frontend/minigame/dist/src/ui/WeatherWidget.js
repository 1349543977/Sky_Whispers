"use strict";
// ============================================================
// WeatherWidget - Weather indicator display
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherWidget = void 0;
const types_1 = require("../types");
const constants_1 = require("../utils/constants");
const color_1 = require("../utils/color");
const WEATHER_ICONS = {
    [types_1.WeatherType.Sunny]: '☀️',
    [types_1.WeatherType.Cloudy]: '☁️',
    [types_1.WeatherType.Rainy]: '🌧️',
    [types_1.WeatherType.Snowy]: '❄️',
    [types_1.WeatherType.Thunderstorm]: '⛈️',
    [types_1.WeatherType.Foggy]: '🌫️',
    [types_1.WeatherType.Windy]: '💨',
};
class WeatherWidget {
    constructor(x, y) {
        this.weatherData = null;
        this.width = 90;
        this.height = 28;
        this.x = x;
        this.y = y;
    }
    update(_dt) {
        // No continuous updates needed
    }
    render(renderer) {
        var _a;
        // Background pill
        renderer.fillRoundRect(this.x, this.y, this.width, this.height, this.height / 2, 'rgba(0,0,0,0.3)', constants_1.LAYERS.UI);
        if (!this.weatherData) {
            renderer.drawText('加载中...', this.x + this.width / 2, this.y + this.height / 2, '#FFFFFF', color_1.DesignTokens.fontSize.xs, 'center', 'middle', constants_1.LAYERS.UI);
            return;
        }
        const icon = (_a = WEATHER_ICONS[this.weatherData.weather_type]) !== null && _a !== void 0 ? _a : '🌤️';
        // Weather icon
        renderer.drawText(icon, this.x + 14, this.y + this.height / 2, '#FFFFFF', 14, 'center', 'middle', constants_1.LAYERS.UI);
        // Temperature
        renderer.drawText(`${Math.round(this.weatherData.temperature)}°`, this.x + 30, this.y + this.height / 2, '#FFFFFF', color_1.DesignTokens.fontSize.sm, 'left', 'middle', constants_1.LAYERS.UI);
        // City name
        const cityDisplay = this.weatherData.city.length > 3
            ? this.weatherData.city.substring(0, 3) + '..'
            : this.weatherData.city;
        renderer.drawText(cityDisplay, this.x + 55, this.y + this.height / 2, 'rgba(255,255,255,0.8)', color_1.DesignTokens.fontSize.xs, 'left', 'middle', constants_1.LAYERS.UI);
    }
    setWeatherData(data) {
        this.weatherData = data;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.WeatherWidget = WeatherWidget;
//# sourceMappingURL=WeatherWidget.js.map