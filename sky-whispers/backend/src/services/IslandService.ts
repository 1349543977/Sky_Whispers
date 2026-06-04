import { IslandRepository } from '@/repositories/IslandRepository';
import { PlantRepository } from '@/repositories/PlantRepository';
import { IslandVisit } from '@/models/IslandVisit';
import { logger } from '@/utils/logger';
import { NotFoundError, ValidationError } from '@/utils/errors';

const islandRepo = new IslandRepository();
const plantRepo = new PlantRepository();

/**
 * 岛屿服务 - 处理岛屿相关业务逻辑
 */
export class IslandService {
  /**
   * 获取用户岛屿信息
   * @param userId 用户 ID
   * @returns 岛屿信息
   */
  async getIsland(userId: number) {
    try {
      const island = await islandRepo.findByUserId(userId);
      if (!island) {
        throw new NotFoundError('岛屿');
      }

      const plants = await plantRepo.findByIslandId(island.id);

      return {
        id: island.id,
        name: island.name,
        skinId: island.skin_id,
        level: island.level,
        expansionSlots: island.expansion_slots,
        weatherType: island.weather_type,
        lightLevel: island.light_level,
        moistureLevel: island.moisture_level,
        windmillLevel: island.windmill_level,
        autoCollect: island.auto_collect,
        plants: plants.map((p) => ({
          id: p.id,
          plantTypeId: p.plant_type_id,
          growthStage: p.growth_stage,
          growthProgress: p.growth_progress,
          isCollected: p.is_collected,
          plantedAt: p.planted_at,
          maturedAt: p.matured_at,
        })),
        createdAt: island.created_at,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('IslandService.getIsland 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 访问其他用户的岛屿
   * @param visitorId 访问者 ID
   * @param islandId 岛屿 ID
   * @param interactionType 交互类型
   */
  async visitIsland(visitorId: number, islandId: number, interactionType: string) {
    try {
      const island = await islandRepo.findByIdOrFail(islandId);

      await IslandVisit.create({
        visitor_id: visitorId,
        island_id: islandId,
        interaction_type: interactionType,
      } as Record<string, unknown>);

      logger.info('岛屿访问', { visitorId, islandId, interactionType });

      return {
        islandId: island.id,
        name: island.name,
        weatherType: island.weather_type,
        interactionType,
      };
    } catch (error) {
      logger.error('IslandService.visitIsland 失败', { visitorId, islandId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更换岛屿皮肤
   * @param userId 用户 ID
   * @param skinId 皮肤 ID
   */
  async changeSkin(userId: number, skinId: number) {
    try {
      const island = await islandRepo.findByUserId(userId);
      if (!island) {
        throw new NotFoundError('岛屿');
      }

      const updated = await islandRepo.updateById(island.id, { skin_id: skinId } as Partial<import('@/models/Island').Island>);
      logger.info('岛屿皮肤更换', { userId, skinId });
      return { skinId: updated.skin_id };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('IslandService.changeSkin 失败', { userId, skinId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 扩展岛屿槽位
   * @param userId 用户 ID
   */
  async expandIsland(userId: number) {
    try {
      const island = await islandRepo.findByUserId(userId);
      if (!island) {
        throw new NotFoundError('岛屿');
      }

      const newSlots = island.expansion_slots + 3;
      const updated = await islandRepo.updateById(island.id, { expansion_slots: newSlots } as Partial<import('@/models/Island').Island>);
      logger.info('岛屿扩展', { userId, newSlots });
      return { expansionSlots: updated.expansion_slots };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('IslandService.expandIsland 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新岛屿天气效果
   * @param userId 用户 ID
   * @param weatherType 天气类型
   * @param lightLevel 光照等级
   * @param moistureLevel 湿度等级
   */
  async updateWeatherEffects(userId: number, weatherType: string, lightLevel: number, moistureLevel: number) {
    try {
      const island = await islandRepo.findByUserId(userId);
      if (!island) {
        throw new NotFoundError('岛屿');
      }

      if (lightLevel < 0 || lightLevel > 100 || moistureLevel < 0 || moistureLevel > 100) {
        throw new ValidationError('光照和湿度等级必须在 0-100 之间');
      }

      const updated = await islandRepo.updateEnvironment(island.id, lightLevel, moistureLevel);
      await islandRepo.updateWeather(island.id, weatherType);

      logger.info('岛屿天气效果更新', { userId, weatherType, lightLevel, moistureLevel });
      return {
        weatherType,
        lightLevel: updated.light_level,
        moistureLevel: updated.moisture_level,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('IslandService.updateWeatherEffects 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }
}
