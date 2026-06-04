import { User } from '@/models/User';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';

/**
 * 用户仓库 - 用户数据访问层
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  /**
   * 根据 openid 查找用户
   * @param openid 微信 openid
   * @returns 用户实例或 null
   */
  async findByOpenid(openid: string): Promise<User | null> {
    try {
      return await this.findOne({ where: { openid } as Record<string, unknown> });
    } catch (error) {
      logger.error('UserRepository.findByOpenid 失败', { openid, error: (error as Error).message });
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
  async updateLocation(userId: number, lat: number, lng: number, cityCode?: string): Promise<User> {
    try {
      const updateData: Record<string, unknown> = { location_lat: lat, location_lng: lng };
      if (cityCode) {
        updateData.city_code = cityCode;
      }
      return await this.updateById(userId, updateData as Partial<User>);
    } catch (error) {
      logger.error('UserRepository.updateLocation 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新用户步数
   * @param userId 用户 ID
   * @param steps 增加的步数
   */
  async updateSteps(userId: number, steps: number): Promise<User> {
    try {
      const user = await this.findByIdOrFail(userId);
      await user.increment('total_steps', { by: steps });
      return await user.reload();
    } catch (error) {
      logger.error('UserRepository.updateSteps 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 增加用户金币
   * @param userId 用户 ID
   * @param amount 增加数量
   */
  async addCoins(userId: number, amount: number): Promise<User> {
    try {
      const user = await this.findByIdOrFail(userId);
      await user.increment('coins', { by: amount });
      return await user.reload();
    } catch (error) {
      logger.error('UserRepository.addCoins 失败', { userId, amount, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 扣减用户金币
   * @param userId 用户 ID
   * @param amount 扣减数量
   */
  async deductCoins(userId: number, amount: number): Promise<User> {
    try {
      const user = await this.findByIdOrFail(userId);
      if (user.coins < amount) {
        throw new Error('金币不足');
      }
      await user.decrement('coins', { by: amount });
      return await user.reload();
    } catch (error) {
      logger.error('UserRepository.deductCoins 失败', { userId, amount, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 增加用户经验值
   * @param userId 用户 ID
   * @param amount 增加数量
   */
  async addExp(userId: number, amount: number): Promise<User> {
    try {
      const user = await this.findByIdOrFail(userId);
      await user.increment('exp', { by: amount });
      return await user.reload();
    } catch (error) {
      logger.error('UserRepository.addExp 失败', { userId, amount, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 更新最后登录时间
   * @param userId 用户 ID
   */
  async updateLastLogin(userId: number): Promise<void> {
    try {
      await this.update({ last_login_at: new Date() } as Partial<User>, {
        where: { id: userId } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('UserRepository.updateLastLogin 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 增加风之力
   * @param userId 用户 ID
   * @param amount 增加数量
   */
  async addWindPower(userId: number, amount: number): Promise<User> {
    try {
      const user = await this.findByIdOrFail(userId);
      await user.increment('wind_power', { by: amount });
      return await user.reload();
    } catch (error) {
      logger.error('UserRepository.addWindPower 失败', { userId, amount, error: (error as Error).message });
      throw error;
    }
  }
}
