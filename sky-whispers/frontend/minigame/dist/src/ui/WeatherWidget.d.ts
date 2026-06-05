import { Renderer } from '../core/Renderer';
import { WeatherData } from '../types';
export declare class WeatherWidget {
    private x;
    private y;
    private weatherData;
    private width;
    private height;
    private sunAngle;
    private rainDrops;
    private cloudOffset;
    private snowAngle;
    private lightningTimer;
    private lightningAlpha;
    constructor(x: number, y: number);
    update(dt: number): void;
    render(renderer: Renderer): void;
    private drawWeatherIcon;
    private drawSun;
    private drawCloud;
    private drawRainCloud;
    private drawSnowflake;
    private drawThunderCloud;
    private drawFog;
    private drawWind;
    setWeatherData(data: WeatherData): void;
    setPosition(x: number, y: number): void;
}
