import { UserRepository } from '@/repositories/UserRepository';
import { logger } from '@/utils/logger';
import { NotFoundError } from '@/utils/errors';

const userRepo = new UserRepository();

/**
 * 用户服务 - 处理用户相关业务逻辑
 */
export class UserService {
  /**
   * 获取用户资料
   * @param userId 用户 ID
   * @returns 用户资料
   */
  async getProfile(userId: number) {
    try {
      const user = await userRepo.findByIdOrFail(userId);
      return {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        locationLat: user.location_lat,
        locationLng: user.location_lng,
        cityCode: user.city_code,
        level: user.level,
        exp: user.exp,
        coins: user.coins,
        windPower: user.wind_power,
        totalSteps: user.total_steps,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('UserService.getProfile 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新用户资料
   * @param userId 用户 ID
   * @param data 更新数据
   * @returns 更新后的用户资料
   */
  async updateProfile(userId: number, data: { nickname?: string; avatarUrl?: string }) {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.nickname) updateData.nickname = data.nickname;
      if (data.avatarUrl) updateData.avatar_url = data.avatarUrl;

      const user = await userRepo.updateById(userId, updateData as Partial<import('@/models/User').User>);
      logger.info('用户资料更新', { userId });
      return {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
      };
    } catch (error) {
      logger.error('UserService.updateProfile 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新用户位置
   * @param userId 用户 ID
   * @param lat 纬度
   * @param lng 经度
   * @param cityCode 城市编码
   */
  async updateLocation(userId: number, lat: number, lng: number, cityCode?: string) {
    try {
      const user = await userRepo.updateLocation(userId, lat, lng, cityCode);
      logger.info('用户位置更新', { userId, lat, lng });
      return {
        locationLat: user.location_lat,
        locationLng: user.location_lng,
        cityCode: user.city_code,
      };
    } catch (error) {
      logger.error('UserService.updateLocation 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 提交步数
   * @param userId 用户 ID
   * @param steps 步数
   * @param date 日期
   */
  async submitSteps(userId: number, steps: number, date: string) {
    try {
      const user = await userRepo.updateSteps(userId, steps);
      logger.info('用户步数提交', { userId, steps, date });
      return {
        totalSteps: user.total_steps,
        submittedSteps: steps,
        date,
      };
    } catch (error) {
      logger.error('UserService.submitSteps 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }
}
