import { WeatherType, WeatherData } from '../types';
import { ApiClient } from '../services/ApiClient';
import { WxService } from '../services/WxService';
export declare class WeatherSystem {
    private eventManager;
    private apiClient;
    private wxService;
    private timerManager;
    private currentWeather;
    private previousWeatherType;
    private initialized;
    constructor(apiClient: ApiClient, wxService: WxService);
    init(): Promise<void>;
    private fetchWeather;
    private setWeather;
    private setDefaultWeather;
    update(dt: number): void;
    getCurrentWeather(): WeatherData | null;
    getWeatherType(): WeatherType;
    getGrowthMultiplier(): number;
    getWindPower(): number;
    destroy(): void;
}
