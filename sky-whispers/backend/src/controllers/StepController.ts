import { Context } from 'koa';
import { StepService } from '@/services/StepService';
import type { ApiResponse } from '@/types';

const stepService = new StepService();

/**
 * 步数控制器
 */
export class StepController {
  /**
   * 提交步数
   * @route POST /api/v1/steps/submit
   */
  async submitSteps(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { steps, date } = ctx.request.body as { steps: number; date: string };

    const result = await stepService.submitSteps(userId, steps, date);

    ctx.body = {
      code: 0,
      message: '提交成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 获取步数历史
   * @route GET /api/v1/steps/history
   */
  async getStepHistory(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { days } = ctx.query as { days?: string };

    const result = await stepService.getStepHistory(userId, days ? Number(days) : 30);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }
}
