import { PlantRepository } from '@/repositories/PlantRepository';
import { PlantTypeRepository } from '@/repositories/PlantTypeRepository';
import { IslandRepository } from '@/repositories/IslandRepository';
import { GameCalculationService } from '@/services/GameCalculationService';
import { logger } from '@/utils/logger';
import { NotFoundError, ValidationError } from '@/utils/errors';

const plantRepo = new PlantRepository();
const plantTypeRepo = new PlantTypeRepository();
const islandRepo = new IslandRepository();
const calculationService = new GameCalculationService();

/**
 * 植物服务 - 处理植物种植、生长、收获业务逻辑
 */
export class PlantService {
  /**
   * 获取岛屿上的植物列表
   * @param islandId 岛屿 ID
   * @returns 植物列表
   */
  async getIslandPlants(islandId: number) {
    try {
      const plants = await plantRepo.findByIslandId(islandId);
      return plants.map((plant) => ({
        id: plant.id,
        plantTypeId: plant.plant_type_id,
        growthStage: plant.growth_stage,
        growthProgress: plant.growth_progress,
        isCollected: plant.is_collected,
        plantedAt: plant.planted_at,
        maturedAt: plant.matured_at,
        plantType: plant.get('plantType') ? {
          id: (plant.get('plantType') as Record<string, unknown>).id,
          name: (plant.get('plantType') as Record<string, unknown>).name,
          rarity: (plant.get('plantType') as Record<string, unknown>).rarity,
          coinYield: (plant.get('plantType') as Record<string, unknown>).coin_yield,
        } : null,
      }));
    } catch (error) {
      logger.error('PlantService.getIslandPlants 失败', { islandId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 种植种子
   * @param islandId 岛屿 ID
   * @param plantTypeId 植物类型 ID
   * @returns 新种植的植物
   */
  async plantSeed(islandId: number, plantTypeId: number) {
    try {
      const island = await islandRepo.findByIdOrFail(islandId);
      const plantType = await plantTypeRepo.findByIdOrFail(plantTypeId);

      const currentPlants = await plantRepo.findByIslandId(islandId);
      const activePlants = currentPlants.filter((p) => !p.is_collected);
      if (activePlants.length >= island.expansion_slots) {
        throw new ValidationError('种植槽位已满');
      }

      const plant = await plantRepo.create({
        island_id: islandId,
        plant_type_id: plantTypeId,
        growth_stage: 0,
        growth_progress: 0,
        planted_at: new Date(),
        is_collected: false,
      } as Record<string, unknown>);

      logger.info('种子种植', { islandId, plantTypeId, plantId: plant.id });

      return {
        id: plant.id,
        plantTypeId: plant.plant_type_id,
        growthStage: plant.growth_stage,
        growthProgress: plant.growth_progress,
        plantedAt: plant.planted_at,
        plantTypeName: plantType.name,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('PlantService.plantSeed 失败', { islandId, plantTypeId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 浇水（增加湿度，加速生长）
   * @param plantId 植物 ID
   * @returns 更新后的植物信息
   */
  async waterPlant(plantId: number) {
    try {
      const plant = await plantRepo.findByIdOrFail(plantId, { include: ['plantType'] });

      if (plant.is_collected) {
        throw new ValidationError('该植物已被收获');
      }

      if (plant.growth_stage >= 3) {
        throw new ValidationError('该植物已成熟');
      }

      const growthBonus = calculationService.calculateWaterBonus();
      const newProgress = Math.min(100, plant.growth_progress + growthBonus);
      const newStage = calculationService.calculateGrowthStage(newProgress);

      const updated = await plantRepo.updateGrowth(plantId, newStage, newProgress);

      logger.info('植物浇水', { plantId, growthBonus, newProgress, newStage });

      return {
        id: updated.id,
        growthStage: updated.growth_stage,
        growthProgress: updated.growth_progress,
        growthBonus,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('PlantService.waterPlant 失败', { plantId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 收获植物
   * @param plantId 植物 ID
   * @param userId 用户 ID（用于发放奖励）
   * @returns 收获结果
   */
  async harvestPlant(plantId: number, userId: number) {
    try {
      const plant = await plantRepo.findByIdOrFail(plantId, { include: ['plantType'] });

      if (plant.is_collected) {
        throw new ValidationError('该植物已被收获');
      }

      if (plant.growth_stage < 3) {
        throw new ValidationError('该植物尚未成熟');
      }

      await plantRepo.harvestPlant(plantId);

      const plantTypeData = plant.get('plantType') as Record<string, unknown> | null;
      const coinYield = plantTypeData ? Number(plantTypeData.coin_yield) : 10;
      const expYield = calculationService.calculateHarvestExp(plantTypeData ? String(plantTypeData.rarity) : 'common');

      logger.info('植物收获', { plantId, userId, coinYield, expYield });

      return {
        plantId,
        coinYield,
        expYield,
        rarity: plantTypeData ? plantTypeData.rarity : 'common',
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('PlantService.harvestPlant 失败', { plantId, userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 计算植物生长进度
   * @param islandId 岛屿 ID
   */
  async calculateGrowth(islandId: number) {
    try {
      const growingPlants = await plantRepo.findGrowingPlants(islandId);
      const island = await islandRepo.findByIdOrFail(islandId);

      const results = [];
      for (const plant of growingPlants) {
        const progress = calculationService.calculateGrowthProgress(
          plant.growth_progress,
          plant.planted_at,
          island.weather_type,
          island.light_level,
          island.moisture_level,
        );

        const newStage = calculationService.calculateGrowthStage(progress);
        await plantRepo.updateGrowth(plant.id, newStage, progress);

        results.push({
          plantId: plant.id,
          previousProgress: plant.growth_progress,
          newProgress: progress,
          stage: newStage,
        });
      }

      logger.info('植物生长计算', { islandId, updatedCount: results.length });
      return results;
    } catch (error) {
      logger.error('PlantService.calculateGrowth 失败', { islandId, error: (error as Error).message });
      throw error;
    }
  }
}
