import { AdRepository } from '@/repositories/AdRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { GameCalculationService } from '@/services/GameCalculationService';
import { logger } from '@/utils/logger';
import { ValidationError } from '@/utils/errors';

const adRepo = new AdRepository();
const userRepo = new UserRepository();
const calculationService = new GameCalculationService();

/** 广告奖励配置 */
const AD_REWARD_CONFIG: Record<string, { coins: number; windPower: number; exp: number }> = {
  meteor_shower: { coins: 50, windPower: 10, exp: 20 },
  weather_boost: { coins: 30, windPower: 20, exp: 15 },
  daily_bonus: { coins: 100, windPower: 5, exp: 30 },
};

/**
 * 广告服务 - 处理广告观看和奖励业务逻辑
 */
export class AdService {
  /**
   * 记录广告观看
   * @param userId 用户 ID
   * @param adType 广告类型
   * @returns 奖励信息
   */
  async recordWatch(userId: number, adType: string) {
    try {
      const todayAd = await adRepo.findTodayAd(userId, adType);
      if (todayAd) {
        throw new ValidationError('今日已观看过此类型广告');
      }

      const rewardConfig = AD_REWARD_CONFIG[adType];
      if (!rewardConfig) {
        throw new ValidationError('无效的广告类型');
      }

      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);

      await adRepo.recordWatch({
        user_id: userId,
        ad_type: adType,
        reward_data: rewardConfig,
        expires_at: expiresAt,
      });

      const reward = await this.applyReward(userId, rewardConfig);

      logger.info('广告观看记录', { userId, adType, reward });

      return {
        adType,
        reward,
      };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('AdService.recordWatch 失败', { userId, adType, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取今日可观看的广告
   * @param userId 用户 ID
   * @returns 可观看的广告列表
   */
  async getAvailable(userId: number) {
    try {
      const available = [];
      for (const adType of Object.keys(AD_REWARD_CONFIG)) {
        const todayAd = await adRepo.findTodayAd(userId, adType);
        available.push({
          adType,
          reward: AD_REWARD_CONFIG[adType],
          watched: !!todayAd,
        });
      }
      return available;
    } catch (error) {
      logger.error('AdService.getAvailable 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 发放广告奖励
   * @param userId 用户 ID
   * @param reward 奖励配置
   */
  private async applyReward(userId: number, reward: { coins: number; windPower: number; exp: number }) {
    try {
      if (reward.coins > 0) {
        await userRepo.addCoins(userId, reward.coins);
      }
      if (reward.windPower > 0) {
        await userRepo.addWindPower(userId, reward.windPower);
      }
      if (reward.exp > 0) {
        await userRepo.addExp(userId, reward.exp);
      }
      return reward;
    } catch (error) {
      logger.error('AdService.applyReward 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }
}
