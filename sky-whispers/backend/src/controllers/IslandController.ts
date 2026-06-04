import { Context } from 'koa';
import { IslandService } from '@/services/IslandService';
import type { ApiResponse } from '@/types';

const islandService = new IslandService();

/**
 * 岛屿控制器
 */
export class IslandController {
  /**
   * 获取用户岛屿
   * @route GET /api/v1/island
   */
  async getIsland(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const result = await islandService.getIsland(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 访问其他用户岛屿
   * @route POST /api/v1/island/:id/visit
   */
  async visitIsland(ctx: Context): Promise<void> {
    const visitorId = ctx.state.userId as number;
    const islandId = Number(ctx.params.id);
    const { interactionType } = ctx.request.body as { interactionType: string };

    const result = await islandService.visitIsland(visitorId, islandId, interactionType);

    ctx.body = {
      code: 0,
      message: '访问成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 更换岛屿皮肤
   * @route PUT /api/v1/island/skin
   */
  async changeSkin(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { skinId } = ctx.request.body as { skinId: number };

    const result = await islandService.changeSkin(userId, skinId);

    ctx.body = {
      code: 0,
      message: '皮肤更换成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 扩展岛屿槽位
   * @route POST /api/v1/island/expand
   */
  async expandIsland(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await islandService.expandIsland(userId);

    ctx.body = {
      code: 0,
      message: '扩展成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 更新岛屿天气效果
   * @route PUT /api/v1/island/weather
   */
  async updateWeatherEffects(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { weatherType, lightLevel, moistureLevel } = ctx.request.body as {
      weatherType: string;
      lightLevel: number;
      moistureLevel: number;
    };

    const result = await islandService.updateWeatherEffects(userId, weatherType, lightLevel, moistureLevel);

    ctx.body = {
      code: 0,
      message: '天气效果更新成功',
      data: result,
    } satisfies ApiResponse;
  }
}
