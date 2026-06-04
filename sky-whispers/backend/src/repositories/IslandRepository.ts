import { Island } from '@/models/Island';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';

/**
 * 岛屿仓库 - 岛屿数据访问层
 */
export class IslandRepository extends BaseRepository<Island> {
  constructor() {
    super(Island);
  }

  /**
   * 根据用户 ID 查找岛屿
   * @param userId 用户 ID
   * @returns 岛屿实例或 null
   */
  async findByUserId(userId: number): Promise<Island | null> {
    try {
      return await this.findOne({
        where: { user_id: userId } as Record<string, unknown>,
        include: ['plants'],
      });
    } catch (error) {
      logger.error('IslandRepository.findByUserId 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新岛屿天气
   * @param islandId 岛屿 ID
   * @param weatherType 天气类型
   */
  async updateWeather(islandId: number, weatherType: string): Promise<Island> {
    try {
      return await this.updateById(islandId, { weather_type: weatherType } as Partial<Island>);
    } catch (error) {
      logger.error('IslandRepository.updateWeather 失败', { islandId, weatherType, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新岛屿等级相关数据
   * @param islandId 岛屿 ID
   * @param data 更新数据
   */
  async updateLevels(islandId: number, data: Partial<Island>): Promise<Island> {
    try {
      return await this.updateById(islandId, data);
    } catch (error) {
      logger.error('IslandRepository.updateLevels 失败', { islandId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新岛屿光照和湿度
   * @param islandId 岛屿 ID
   * @param lightLevel 光照等级
   * @param moistureLevel 湿度等级
   */
  async updateEnvironment(islandId: number, lightLevel: number, moistureLevel: number): Promise<Island> {
    try {
      return await this.updateById(islandId, {
        light_level: lightLevel,
        moisture_level: moistureLevel,
      } as Partial<Island>);
    } catch (error) {
      logger.error('IslandRepository.updateEnvironment 失败', { islandId, error: (error as Error).message });
      throw error;
    }
  }
}
