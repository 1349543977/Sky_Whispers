import { StepRecord } from '@/models/StepRecord';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';
import { Op } from 'sequelize';

/**
 * 步数记录仓库 - 步数数据访问层
 */
export class StepRepository extends BaseRepository<StepRecord> {
  constructor() {
    super(StepRecord);
  }

  /**
   * 查找用户指定日期的步数记录
   * @param userId 用户 ID
   * @param date 日期 (YYYY-MM-DD)
   * @returns 步数记录实例或 null
   */
  async findByDate(userId: number, date: string): Promise<StepRecord | null> {
    try {
      return await this.findOne({
        where: {
          user_id: userId,
          date,
        } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('StepRepository.findByDate 失败', { userId, date, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 查找用户步数历史
   * @param userId 用户 ID
   * @param days 查询天数
   * @returns 步数记录数组
   */
  async findHistory(userId: number, days: number = 30): Promise<StepRecord[]> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString().split('T')[0];
      return await this.findAll({
        where: {
          user_id: userId,
          date: { [Op.gte]: sinceStr } as unknown as string,
        } as Record<string, unknown>,
        order: [['date', 'DESC']],
      });
    } catch (error) {
      logger.error('StepRepository.findHistory 失败', { userId, days, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 创建或更新步数记录
   * @param userId 用户 ID
   * @param date 日期
   * @param steps 步数
   * @param windPower 获得的风之力
   */
  async upsertStep(userId: number, date: string, steps: number, windPower: number): Promise<StepRecord> {
    try {
      const [record] = await StepRecord.upsert({
        user_id: userId,
        date,
        steps,
        wind_power_earned: windPower,
      } as Record<string, unknown>);
      return record;
    } catch (error) {
      logger.error('StepRepository.upsertStep 失败', { userId, date, error: (error as Error).message });
      throw error;
    }
  }
}
