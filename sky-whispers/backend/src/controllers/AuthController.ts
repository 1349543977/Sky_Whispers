import { Context } from 'koa';
import { AuthService } from '@/services/AuthService';
import { logger } from '@/utils/logger';
import { AppError, ValidationError } from '@/utils/errors';
import type { ApiResponse } from '@/types';

const authService = new AuthService();

/**
 * 认证控制器
 */
export class AuthController {
  /**
   * 微信小程序登录
   * @route POST /api/v1/auth/login
   */
  async login(ctx: Context): Promise<void> {
    try {
      const { code } = ctx.request.body as { code: string };

      if (!code) {
        throw new ValidationError('缺少微信登录凭证 code');
      }

      const result = await authService.login(code);

      ctx.body = {
        code: 0,
        message: '登录成功',
        data: result,
      } satisfies ApiResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 刷新令牌
   * @route POST /api/v1/auth/refresh
   */
  async refresh(ctx: Context): Promise<void> {
    try {
      const { refreshToken } = ctx.request.body as { refreshToken: string };

      if (!refreshToken) {
        throw new ValidationError('缺少刷新令牌');
      }

      const result = await authService.refresh(refreshToken);

      ctx.body = {
        code: 0,
        message: '刷新成功',
        data: result,
      } satisfies ApiResponse;
    } catch (error) {
      throw error;
    }
  }
}
