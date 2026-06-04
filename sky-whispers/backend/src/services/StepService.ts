import { StepRepository } from '@/repositories/StepRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { GameCalculationService } from '@/services/GameCalculationService';
import { logger } from '@/utils/logger';
import { ValidationError } from '@/utils/errors';

const stepRepo = new StepRepository();
const userRepo = new UserRepository();
const calculationService = new GameCalculationService();

/**
 * 步数服务 - 处理步数提交和风之力转换业务逻辑
 */
export class StepService {
  /**
   * 提交步数
   * @param userId 用户 ID
   * @param steps 步数
   * @param date 日期
   * @returns 提交结果
   */
  async submitSteps(userId: number, steps: number, date: string) {
    try {
      if (steps < 0) {
        throw new ValidationError('步数不能为负数');
      }

      if (steps > 100000) {
        throw new ValidationError('单日步数不能超过 100000');
      }

      const windPower = this.convertToWindPower(steps);

      const record = await stepRepo.upsertStep(userId, date, steps, windPower);
      await userRepo.updateSteps(userId, steps);
      await userRepo.addWindPower(userId, windPower);

      logger.info('步数提交', { userId, steps, date, windPower });

      return {
        date: record.date,
        steps: record.steps,
        windPowerEarned: record.wind_power_earned,
      };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('StepService.submitSteps 失败', { userId, steps, date, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 将步数转换为风之力
   * @param steps 步数
   * @returns 风之力数量
   */
  convertToWindPower(steps: number): number {
    return calculationService.calculateStepsToWindPower(steps);
  }

  /**
   * 获取步数历史
   * @param userId 用户 ID
   * @param days 查询天数
   * @returns 步数历史记录
   */
  async getStepHistory(userId: number, days: number = 30) {
    try {
      const records = await stepRepo.findHistory(userId, days);
      return records.map((r) => ({
        date: r.date,
        steps: r.steps,
        windPowerEarned: r.wind_power_earned,
      }));
    } catch (error) {
      logger.error('StepService.getStepHistory 失败', { userId, days, error: (error as Error).message });
      throw error;
    }
  }
}
