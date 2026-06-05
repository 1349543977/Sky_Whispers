import { Renderer } from '../core/Renderer';
import { WeatherData } from '../types';
export declare class WeatherWidget {
    private x;
    private y;
    private weatherData;
    private width;
    private height;
    constructor(x: number, y: number);
    update(_dt: number): void;
    render(renderer: Renderer): void;
    setWeatherData(data: WeatherData): void;
    setPosition(x: number, y: number): void;
}
//# sourceMappingURL=WeatherWidget.d.ts.map