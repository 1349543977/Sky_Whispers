import { Plant, PlantType } from '../types';
import { WeatherSystem } from './WeatherSystem';
export declare class GrowthSystem {
    private eventManager;
    private weatherSystem;
    private entries;
    private growthAccumulators;
    constructor(weatherSystem: WeatherSystem);
    addPlant(plant: Plant, plantType: PlantType): void;
    removePlant(plantId: string): void;
    clearPlants(): void;
    update(dt: number): void;
    private calculateStage;
    waterPlant(plantId: string): boolean;
    harvestPlant(plantId: string): number | null;
    getPlantProgress(plantId: string): number;
}
//# sourceMappingURL=GrowthSystem.d.ts.map