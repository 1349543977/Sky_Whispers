import { SpriteType, WeatherSprite } from '../types';
import { WeatherSystem } from './WeatherSystem';
import { ApiClient } from '../services/ApiClient';
export declare class SpriteSpawnSystem {
    private eventManager;
    private weatherSystem;
    private apiClient;
    private timerManager;
    private availableSpriteTypes;
    private activeSprites;
    private initialized;
    constructor(weatherSystem: WeatherSystem, apiClient: ApiClient);
    init(): Promise<void>;
    private loadSpriteTypes;
    private checkSpawn;
    attemptCatch(spriteTypeId: string): Promise<WeatherSprite | null>;
    feedSprite(spriteId: string): Promise<boolean>;
    update(dt: number): void;
    getActiveSprites(): WeatherSprite[];
    getAvailableTypes(): SpriteType[];
    destroy(): void;
}
//# sourceMappingURL=SpriteSpawnSystem.d.ts.map