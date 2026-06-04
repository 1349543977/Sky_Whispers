import { Plant } from '@/models/Plant';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';
import { Op } from 'sequelize';

/**
 * 植物仓库 - 植物数据访问层
 */
export class PlantRepository extends BaseRepository<Plant> {
  constructor() {
    super(Plant);
  }

  /**
   * 根据岛屿 ID 查找所有植物
   * @param islandId 岛屿 ID
   * @returns 植物实例数组
   */
  async findByIslandId(islandId: number): Promise<Plant[]> {
    try {
      return await this.findAll({
        where: { island_id: islandId } as Record<string, unknown>,
        include: ['plantType'],
        order: [['planted_at', 'ASC']],
      });
    } catch (error) {
      logger.error('PlantRepository.findByIslandId 失败', { islandId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 查找正在生长中的植物
   * @param islandId 岛屿 ID
   * @returns 正在生长的植物数组
   */
  async findGrowingPlants(islandId: number): Promise<Plant[]> {
    try {
      return await this.findAll({
        where: {
          island_id: islandId,
          is_collected: false,
          growth_stage: { [Op.lt]: 3 } as unknown as number,
        } as Record<string, unknown>,
        include: ['plantType'],
      });
    } catch (error) {
      logger.error('PlantRepository.findGrowingPlants 失败', { islandId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新植物生长状态
   * @param plantId 植物 ID
   * @param growthStage 生长阶段
   * @param growthProgress 生长进度
   */
  async updateGrowth(plantId: number, growthStage: number, growthProgress: number): Promise<Plant> {
    try {
      const updateData: Record<string, unknown> = {
        growth_stage: growthStage,
        growth_progress: growthProgress,
      };
      if (growthStage >= 3) {
        updateData.matured_at = new Date();
      }
      return await this.updateById(plantId, updateData as Partial<Plant>);
    } catch (error) {
      logger.error('PlantRepository.updateGrowth 失败', { plantId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 收获植物
   * @param plantId 植物 ID
   */
  async harvestPlant(plantId: number): Promise<Plant> {
    try {
      return await this.updateById(plantId, { is_collected: true } as Partial<Plant>);
    } catch (error) {
      logger.error('PlantRepository.harvestPlant 失败', { plantId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 查找已成熟未收获的植物
   * @param islandId 岛屿 ID
   */
  async findMaturedPlants(islandId: number): Promise<Plant[]> {
    try {
      return await this.findAll({
        where: {
          island_id: islandId,
          is_collected: false,
          growth_stage: 3,
        } as Record<string, unknown>,
        include: ['plantType'],
      });
    } catch (error) {
      logger.error('PlantRepository.findMaturedPlants 失败', { islandId, error: (error as Error).message });
      throw error;
    }
  }
}
