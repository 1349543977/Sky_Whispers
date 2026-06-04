import { Context } from 'koa';
import { UserService } from '@/services/UserService';
import type { ApiResponse } from '@/types';

const userService = new UserService();

/**
 * 用户控制器
 */
export class UserController {
  /**
   * 获取用户资料
   * @route GET /api/v1/user/profile
   */
  async getProfile(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const result = await userService.getProfile(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 更新用户资料
   * @route PUT /api/v1/user/profile
   */
  async updateProfile(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { nickname, avatarUrl } = ctx.request.body as { nickname?: string; avatarUrl?: string };

    const result = await userService.updateProfile(userId, { nickname, avatarUrl });

    ctx.body = {
      code: 0,
      message: '更新成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 更新用户位置
   * @route PUT /api/v1/user/location
   */
  async updateLocation(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { lat, lng, cityCode } = ctx.request.body as { lat: number; lng: number; cityCode?: string };

    const result = await userService.updateLocation(userId, lat, lng, cityCode);

    ctx.body = {
      code: 0,
      message: '位置更新成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 提交步数
   * @route POST /api/v1/user/steps
   */
  async submitSteps(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { steps, date } = ctx.request.body as { steps: number; date: string };

    const result = await userService.submitSteps(userId, steps, date);

    ctx.body = {
      code: 0,
      message: '步数提交成功',
      data: result,
    } satisfies ApiResponse;
  }
}
