import { Context } from 'koa';
import { SpriteService } from '@/services/SpriteService';
import type { ApiResponse } from '@/types';

const spriteService = new SpriteService();

/**
 * 精灵控制器
 */
export class SpriteController {
  /**
   * 获取精灵收藏
   * @route GET /api/v1/sprites/collection
   */
  async getCollection(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await spriteService.getCollection(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 尝试捕获精灵
   * @route POST /api/v1/sprites/catch
   */
  async attemptCatch(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { spriteTypeId, currentWeather } = ctx.request.body as {
      spriteTypeId: number;
      currentWeather: string;
    };

    const result = await spriteService.attemptCatch(userId, spriteTypeId, currentWeather);

    ctx.body = {
      code: 0,
      message: result.caught ? '捕获成功' : '捕获失败',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 喂食精灵
   * @route POST /api/v1/sprites/:id/feed
   */
  async feedSprite(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const spriteId = Number(ctx.params.id);

    const result = await spriteService.feedSprite(spriteId, userId);

    ctx.body = {
      code: 0,
      message: '喂食成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 获取精灵图鉴
   * @route GET /api/v1/sprites/codex
   */
  async getCodex(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await spriteService.getCodex(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }
}
