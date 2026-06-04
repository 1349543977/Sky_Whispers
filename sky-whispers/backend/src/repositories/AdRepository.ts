import { AdInteraction } from '@/models/AdInteraction';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';
import { Op } from 'sequelize';

/**
 * 广告交互仓库 - 广告交互数据访问层
 */
export class AdRepository extends BaseRepository<AdInteraction> {
  constructor() {
    super(AdInteraction);
  }

  /**
   * 查找用户今日的广告记录
   * @param userId 用户 ID
   * @param adType 广告类型
   * @returns 广告交互实例或 null
   */
  async findTodayAd(userId: number, adType: string): Promise<AdInteraction | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return await this.findOne({
        where: {
          user_id: userId,
          ad_type: adType,
          watched_at: { [Op.gte]: today } as unknown as Date,
        } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('AdRepository.findTodayAd 失败', { userId, adType, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 记录广告观看
   * @param data 广告交互数据
   */
  async recordWatch(data: {
    user_id: number;
    ad_type: string;
    reward_data: Record<string, unknown>;
    expires_at: Date;
  }): Promise<AdInteraction> {
    try {
      return await this.create({
        ...data,
        watched_at: new Date(),
      } as Record<string, unknown>);
    } catch (error) {
      logger.error('AdRepository.recordWatch 失败', { error: (error as Error).message });
      throw error;
    }
  }
}
