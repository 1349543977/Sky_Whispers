import { Context } from 'koa';
import { AdService } from '@/services/AdService';
import type { ApiResponse } from '@/types';

const adService = new AdService();

/**
 * 广告控制器
 */
export class AdController {
  /**
   * 记录广告观看
   * @route POST /api/v1/ads/watch
   */
  async recordWatch(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { adType } = ctx.request.body as { adType: string };

    const result = await adService.recordWatch(userId, adType);

    ctx.body = {
      code: 0,
      message: '记录成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 获取可观看的广告
   * @route GET /api/v1/ads/available
   */
  async getAvailable(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await adService.getAvailable(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }
}
