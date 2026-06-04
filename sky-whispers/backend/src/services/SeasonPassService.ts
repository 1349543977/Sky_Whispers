import { SeasonPassRepository } from '@/repositories/SeasonPassRepository';
import { logger } from '@/utils/logger';
import { NotFoundError, ValidationError } from '@/utils/errors';

const seasonPassRepo = new SeasonPassRepository();

/**
 * 季票服务 - 处理季票进度、奖励业务逻辑
 */
export class SeasonPassService {
  /**
   * 获取当前赛季信息
   * @returns 当前赛季信息
   */
  async getCurrentSeason() {
    try {
      const seasonPass = await seasonPassRepo.findCurrent();
      if (!seasonPass) {
        return null;
      }

      return {
        id: seasonPass.id,
        name: seasonPass.name,
        season: seasonPass.season,
        year: seasonPass.year,
        startDate: seasonPass.start_date,
        endDate: seasonPass.end_date,
        maxLevel: seasonPass.max_level,
      };
    } catch (error) {
      logger.error('SeasonPassService.getCurrentSeason 失败', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取用户季票进度
   * @param userId 用户 ID
   * @param passId 季票 ID
   * @returns 季票进度
   */
  async getProgress(userId: number, passId: number) {
    try {
      const progress = await seasonPassRepo.findOrCreateProgress(userId, passId);
      return {
        id: progress.id,
        userId: progress.user_id,
        passId: progress.pass_id,
        level: progress.level,
        exp: progress.exp,
        isPremium: progress.is_premium,
      };
    } catch (error) {
      logger.error('SeasonPassService.getProgress 失败', { userId, passId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 升级为高级版
   * @param userId 用户 ID
   * @param passId 季票 ID
   */
  async upgradeToPremium(userId: number, passId: number) {
    try {
      const progress = await seasonPassRepo.findOrCreateProgress(userId, passId);

      if (progress.is_premium) {
        throw new ValidationError('已是高级版');
      }

      const updated = await seasonPassRepo.updateProgress(progress.id, {
        is_premium: true,
      } as Partial<import('@/models/SeasonPassProgress').SeasonPassProgress>);

      logger.info('季票升级高级版', { userId, passId });
      return {
        passId,
        isPremium: updated.is_premium,
      };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('SeasonPassService.upgradeToPremium 失败', { userId, passId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 领取赛季奖励
   * @param userId 用户 ID
   * @param passId 季票 ID
   * @param level 奖励等级
   */
  async claimReward(userId: number, passId: number, level: number) {
    try {
      const progress = await seasonPassRepo.findProgress(userId, passId);
      if (!progress) {
        throw new NotFoundError('季票进度');
      }

      if (progress.level < level) {
        throw new ValidationError('尚未达到该奖励等级');
      }

      logger.info('赛季奖励领取', { userId, passId, level });
      return { passId, level, claimed: true };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('SeasonPassService.claimReward 失败', { userId, passId, level, error: (error as Error).message });
      throw error;
    }
  }
}
