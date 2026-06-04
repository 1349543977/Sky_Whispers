import { WeatherSprite } from '@/models/WeatherSprite';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';

/**
 * 天气精灵仓库 - 天气精灵数据访问层
 */
export class SpriteRepository extends BaseRepository<WeatherSprite> {
  constructor() {
    super(WeatherSprite);
  }

  /**
   * 根据用户 ID 查找所有精灵
   * @param userId 用户 ID
   * @returns 精灵实例数组
   */
  async findByUserId(userId: number): Promise<WeatherSprite[]> {
    try {
      return await this.findAll({
        where: { user_id: userId } as Record<string, unknown>,
        include: ['spriteType'],
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      logger.error('SpriteRepository.findByUserId 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 根据精灵类型查找用户精灵
   * @param userId 用户 ID
   * @param spriteTypeId 精灵类型 ID
   * @returns 精灵实例或 null
   */
  async findByType(userId: number, spriteTypeId: number): Promise<WeatherSprite | null> {
    try {
      return await this.findOne({
        where: {
          user_id: userId,
          sprite_type_id: spriteTypeId,
        } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('SpriteRepository.findByType 失败', { userId, spriteTypeId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新精灵幸福度
   * @param spriteId 精灵 ID
   * @param happiness 幸福度
   */
  async updateHappiness(spriteId: number, happiness: number): Promise<WeatherSprite> {
    try {
      return await this.updateById(spriteId, {
        happiness: Math.max(0, Math.min(100, happiness)),
        last_fed_at: new Date(),
      } as Partial<WeatherSprite>);
    } catch (error) {
      logger.error('SpriteRepository.updateHappiness 失败', { spriteId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 增加精灵等级
   * @param spriteId 精灵 ID
   */
  async levelUp(spriteId: number): Promise<WeatherSprite> {
    try {
      const sprite = await this.findByIdOrFail(spriteId);
      await sprite.increment('level');
      return await sprite.reload();
    } catch (error) {
      logger.error('SpriteRepository.levelUp 失败', { spriteId, error: (error as Error).message });
      throw error;
    }
  }
}
