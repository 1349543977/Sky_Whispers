import { Context } from 'koa';
import { SeasonPassService } from '@/services/SeasonPassService';
import type { ApiResponse } from '@/types';

const seasonPassService = new SeasonPassService();

/**
 * 季票控制器
 */
export class SeasonPassController {
  /**
   * 获取当前赛季
   * @route GET /api/v1/season-pass/current
   */
  async getCurrentSeason(ctx: Context): Promise<void> {
    const result = await seasonPassService.getCurrentSeason();

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 获取季票进度
   * @route GET /api/v1/season-pass/:passId/progress
   */
  async getProgress(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const passId = Number(ctx.params.passId);

    const result = await seasonPassService.getProgress(userId, passId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 升级为高级版
   * @route POST /api/v1/season-pass/:passId/upgrade
   */
  async upgradeToPremium(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const passId = Number(ctx.params.passId);

    const result = await seasonPassService.upgradeToPremium(userId, passId);

    ctx.body = {
      code: 0,
      message: '升级成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 领取赛季奖励
   * @route POST /api/v1/season-pass/:passId/claim
   */
  async claimReward(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const passId = Number(ctx.params.passId);
    const { level } = ctx.request.body as { level: number };

    const result = await seasonPassService.claimReward(userId, passId, level);

    ctx.body = {
      code: 0,
      message: '领取成功',
      data: result,
    } satisfies ApiResponse;
  }
}
