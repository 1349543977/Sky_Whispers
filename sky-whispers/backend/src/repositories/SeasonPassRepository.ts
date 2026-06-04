import { SeasonPass, SeasonPassProgress } from '@/models';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';
import { Op } from 'sequelize';

/**
 * 季票仓库 - 季票数据访问层
 */
export class SeasonPassRepository extends BaseRepository<SeasonPass> {
  constructor() {
    super(SeasonPass);
  }

  /**
   * 查找当前季票
   * @returns 当前季票实例或 null
   */
  async findCurrent(): Promise<SeasonPass | null> {
    try {
      const now = new Date();
      return await this.findOne({
        where: {
          start_date: { [Op.lte]: now } as unknown as Date,
          end_date: { [Op.gte]: now } as unknown as Date,
        } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('SeasonPassRepository.findCurrent 失败', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 查找用户季票进度
   * @param userId 用户 ID
   * @param passId 季票 ID
   * @returns 季票进度实例或 null
   */
  async findProgress(userId: number, passId: number): Promise<SeasonPassProgress | null> {
    try {
      return await SeasonPassProgress.findOne({
        where: {
          user_id: userId,
          pass_id: passId,
        } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('SeasonPassRepository.findProgress 失败', { userId, passId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 创建或获取季票进度
   * @param userId 用户 ID
   * @param passId 季票 ID
   * @returns 季票进度实例
   */
  async findOrCreateProgress(userId: number, passId: number): Promise<SeasonPassProgress> {
    try {
      const [progress] = await SeasonPassProgress.findOrCreate({
        where: { user_id: userId, pass_id: passId } as Record<string, unknown>,
        defaults: { user_id: userId, pass_id: passId, level: 1, exp: 0, is_premium: false } as Record<string, unknown>,
      });
      return progress;
    } catch (error) {
      logger.error('SeasonPassRepository.findOrCreateProgress 失败', { userId, passId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新季票进度
   * @param progressId 进度 ID
   * @param data 更新数据
   */
  async updateProgress(progressId: number, data: Partial<SeasonPassProgress>): Promise<SeasonPassProgress> {
    try {
      const progress = await SeasonPassProgress.findByPk(progressId);
      if (!progress) {
        throw new Error('季票进度不存在');
      }
      await progress.update(data as Record<string, unknown>);
      return progress;
    } catch (error) {
      logger.error('SeasonPassRepository.updateProgress 失败', { progressId, error: (error as Error).message });
      throw error;
    }
  }
}
