// ============================================================
// GrowthSystem - Plant growth calculation
// ============================================================

import { Plant, PlantType, PlantGrowthStage, GameEvent } from '../types';
import { EventManager } from '../core/EventManager';
import { WeatherSystem } from './WeatherSystem';
import { GAME } from '../utils/constants';

interface PlantEntry {
  plant: Plant;
  plantType: PlantType;
}

export class GrowthSystem {
  private eventManager: EventManager;
  private weatherSystem: WeatherSystem;
  private entries: Map<string, PlantEntry> = new Map();
  private growthAccumulators: Map<string, number> = new Map();

  constructor(weatherSystem: WeatherSystem) {
    this.weatherSystem = weatherSystem;
    this.eventManager = EventManager.getInstance();
  }

  addPlant(plant: Plant, plantType: PlantType): void {
    this.entries.set(plant.id, { plant, plantType });
    this.growthAccumulators.set(plant.id, 0);
  }

  removePlant(plantId: string): void {
    this.entries.delete(plantId);
    this.growthAccumulators.delete(plantId);
  }

  clearPlants(): void {
    this.entries.clear();
    this.growthAccumulators.clear();
  }

  update(dt: number): void {
    const weatherMultiplier = this.weatherSystem.getGrowthMultiplier();

    for (const [plantId, entry] of this.entries) {
      const { plant, plantType } = entry;
      if (plant.growth_stage === PlantGrowthStage.Mature) continue;

      let accumulator = this.growthAccumulators.get(plantId) ?? 0;

      // Base growth rate: growth_progress increases based on time
      // Total growth_duration_hours is from plant type, we normalize to seconds
      const growthRate = 1 / (plantType.growth_duration_hours * 3600);

      // Apply weather multiplier
      let effectiveRate = growthRate * weatherMultiplier;

      // Apply water bonus
      if (plant.is_watered) {
        effectiveRate *= 1.5;
      }

      accumulator += effectiveRate * dt;
      this.growthAccumulators.set(plantId, accumulator);

      // Update plant growth progress
      const newProgress = Math.min(plant.growth_progress + effectiveRate * dt, 1);
      plant.growth_progress = newProgress;

      // Check stage transitions
      const newStage = this.calculateStage(newProgress);
      if (newStage !== plant.growth_stage) {
        plant.growth_stage = newStage;

        this.eventManager.emit(GameEvent.PlantGrew, {
          plantId: plant.id,
          stage: newStage,
        });

        if (newStage === PlantGrowthStage.Mature) {
          this.eventManager.emit(GameEvent.PlantMatured, {
            plantId: plant.id,
          });
        }
      }
    }
  }

  private calculateStage(progress: number): PlantGrowthStage {
    if (progress >= 0.75) return PlantGrowthStage.Mature;
    if (progress >= 0.4) return PlantGrowthStage.Growing;
    if (progress >= 0.1) return PlantGrowthStage.Sprout;
    return PlantGrowthStage.Seed;
  }

  waterPlant(plantId: string): boolean {
    const entry = this.entries.get(plantId);
    if (!entry || entry.plant.is_watered || entry.plant.growth_stage === PlantGrowthStage.Mature) {
      return false;
    }

    entry.plant.is_watered = true;
    entry.plant.last_watered_at = new Date().toISOString();

    this.eventManager.emit(GameEvent.PlantWatered, { plantId });
    return true;
  }

  harvestPlant(plantId: string): number | null {
    const entry = this.entries.get(plantId);
    if (!entry || entry.plant.growth_stage !== PlantGrowthStage.Mature) {
      return null;
    }

    const coinsEarned = entry.plantType.coin_yield;

    this.eventManager.emit(GameEvent.PlantHarvested, {
      plantId,
      coinsEarned,
    });

    // Reset plant to seed stage
    entry.plant.growth_stage = PlantGrowthStage.Seed;
    entry.plant.growth_progress = 0;
    entry.plant.is_watered = false;
    entry.plant.times_harvested += 1;
    this.growthAccumulators.set(plantId, 0);

    return coinsEarned;
  }

  getPlantProgress(plantId: string): number {
    const entry = this.entries.get(plantId);
    return entry?.plant.growth_progress ?? 0;
  }
}
