"use strict";
// ============================================================
// GrowthSystem - Plant growth calculation
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrowthSystem = void 0;
const types_1 = require("../types");
const EventManager_1 = require("../core/EventManager");
class GrowthSystem {
    constructor(weatherSystem) {
        this.entries = new Map();
        this.growthAccumulators = new Map();
        this.weatherSystem = weatherSystem;
        this.eventManager = EventManager_1.EventManager.getInstance();
    }
    addPlant(plant, plantType) {
        this.entries.set(plant.id, { plant, plantType });
        this.growthAccumulators.set(plant.id, 0);
    }
    removePlant(plantId) {
        this.entries.delete(plantId);
        this.growthAccumulators.delete(plantId);
    }
    clearPlants() {
        this.entries.clear();
        this.growthAccumulators.clear();
    }
    update(dt) {
        var _a;
        const weatherMultiplier = this.weatherSystem.getGrowthMultiplier();
        for (const [plantId, entry] of this.entries) {
            const { plant, plantType } = entry;
            if (plant.growth_stage === types_1.PlantGrowthStage.Mature)
                continue;
            let accumulator = (_a = this.growthAccumulators.get(plantId)) !== null && _a !== void 0 ? _a : 0;
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
                this.eventManager.emit(types_1.GameEvent.PlantGrew, {
                    plantId: plant.id,
                    stage: newStage,
                });
                if (newStage === types_1.PlantGrowthStage.Mature) {
                    this.eventManager.emit(types_1.GameEvent.PlantMatured, {
                        plantId: plant.id,
                    });
                }
            }
        }
    }
    calculateStage(progress) {
        if (progress >= 0.75)
            return types_1.PlantGrowthStage.Mature;
        if (progress >= 0.4)
            return types_1.PlantGrowthStage.Growing;
        if (progress >= 0.1)
            return types_1.PlantGrowthStage.Sprout;
        return types_1.PlantGrowthStage.Seed;
    }
    waterPlant(plantId) {
        const entry = this.entries.get(plantId);
        if (!entry || entry.plant.is_watered || entry.plant.growth_stage === types_1.PlantGrowthStage.Mature) {
            return false;
        }
        entry.plant.is_watered = true;
        entry.plant.last_watered_at = new Date().toISOString();
        this.eventManager.emit(types_1.GameEvent.PlantWatered, { plantId });
        return true;
    }
    harvestPlant(plantId) {
        const entry = this.entries.get(plantId);
        if (!entry || entry.plant.growth_stage !== types_1.PlantGrowthStage.Mature) {
            return null;
        }
        const coinsEarned = entry.plantType.coin_yield;
        this.eventManager.emit(types_1.GameEvent.PlantHarvested, {
            plantId,
            coinsEarned,
        });
        // Reset plant to seed stage
        entry.plant.growth_stage = types_1.PlantGrowthStage.Seed;
        entry.plant.growth_progress = 0;
        entry.plant.is_watered = false;
        entry.plant.times_harvested += 1;
        this.growthAccumulators.set(plantId, 0);
        return coinsEarned;
    }
    getPlantProgress(plantId) {
        var _a;
        const entry = this.entries.get(plantId);
        return (_a = entry === null || entry === void 0 ? void 0 : entry.plant.growth_progress) !== null && _a !== void 0 ? _a : 0;
    }
}
exports.GrowthSystem = GrowthSystem;
//# sourceMappingURL=GrowthSystem.js.map