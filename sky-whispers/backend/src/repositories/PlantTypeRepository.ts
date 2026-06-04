import { PlantType } from '@/models/PlantType';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';
import { Op, FindOptions, Attributes } from 'sequelize';

/**
 * 植物类型仓库 - 植物类型数据访问层
 */
export class PlantTypeRepository extends BaseRepository<PlantType> {
  constructor() {
    super(PlantType);
  }

  /**
   * 查找所有植物类型
   * @returns 植物类型数组
   */
  async listAll(): Promise<PlantType[]> {
    try {
      return await super.findAll({ order: [['id', 'ASC']] });
    } catch (error) {
      logger.error('PlantTypeRepository.listAll 失败', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 根据天气条件查找植物类型
   * @param weatherType 天气类型
   * @returns 匹配的植物类型数组
   */
  async findByWeather(weatherType: string): Promise<PlantType[]> {
    try {
      return await super.findAll({
        where: {
          required_weather: { [Op.contains]: [weatherType] } as unknown as object,
        } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('PlantTypeRepository.findByWeather 失败', { weatherType, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 查找特殊植物类型
   * @returns 特殊植物类型数组
   */
  async findSpecial(): Promise<PlantType[]> {
    try {
      return await super.findAll({
        where: { is_special: true } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('PlantTypeRepository.findSpecial 失败', { error: (error as Error).message });
      throw error;
    }
  }
}
