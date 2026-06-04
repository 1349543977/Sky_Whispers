import { SpriteType } from '@/models/SpriteType';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';

/**
 * 精灵类型仓库 - 精灵类型数据访问层
 */
export class SpriteTypeRepository extends BaseRepository<SpriteType> {
  constructor() {
    super(SpriteType);
  }

  /**
   * 查找所有精灵类型
   * @returns 精灵类型数组
   */
  async listAll(): Promise<SpriteType[]> {
    try {
      return await super.findAll({ order: [['id', 'ASC']] });
    } catch (error) {
      logger.error('SpriteTypeRepository.listAll 失败', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 根据天气条件查找精灵类型
   * @param weatherCondition 天气条件
   * @returns 匹配的精灵类型数组
   */
  async findByWeather(weatherCondition: string): Promise<SpriteType[]> {
    try {
      return await super.findAll({
        where: { weather_condition: weatherCondition } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('SpriteTypeRepository.findByWeather 失败', { weatherCondition, error: (error as Error).message });
      throw error;
    }
  }
}
