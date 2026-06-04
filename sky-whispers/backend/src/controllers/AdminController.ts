import { Context } from 'koa';
import { UserRepository } from '@/repositories/UserRepository';
import { logger } from '@/utils/logger';
import { ForbiddenError } from '@/utils/errors';
import type { ApiResponse } from '@/types';

const userRepo = new UserRepository();

/**
 * 管理后台控制器
 */
export class AdminController {
  /**
   * 获取仪表盘数据
   * @route GET /api/v1/admin/dashboard
   */
  async getDashboard(ctx: Context): Promise<void> {
    try {
      const totalUsers = await userRepo.count();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      ctx.body = {
        code: 0,
        message: '获取成功',
        data: {
          totalUsers,
          timestamp: new Date().toISOString(),
        },
      } satisfies ApiResponse;
    } catch (error) {
      logger.error('AdminController.getDashboard 失败', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取用户列表
   * @route GET /api/v1/admin/users
   */
  async getUsers(ctx: Context): Promise<void> {
    try {
      const { page = '1', pageSize = '20' } = ctx.query as { page?: string; pageSize?: string };

      const result = await userRepo.paginate(Number(page), Number(pageSize));

      ctx.body = {
        code: 0,
        message: '获取成功',
        data: {
          list: result.rows,
          total: result.count,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(result.count / Number(pageSize)),
        },
      } satisfies ApiResponse;
    } catch (error) {
      logger.error('AdminController.getUsers 失败', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取用户详情
   * @route GET /api/v1/admin/users/:id
   */
  async getUserDetail(ctx: Context): Promise<void> {
    try {
      const userId = Number(ctx.params.id);
      const user = await userRepo.findByIdOrFail(userId);

      ctx.body = {
        code: 0,
        message: '获取成功',
        data: user,
      } satisfies ApiResponse;
    } catch (error) {
      logger.error('AdminController.getUserDetail 失败', { error: (error as Error).message });
      throw error;
    }
  }
}
