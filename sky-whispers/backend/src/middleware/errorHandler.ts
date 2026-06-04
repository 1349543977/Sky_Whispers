import { Context, Next } from 'koa';
import { logger } from '@/utils/logger';
import { AppError } from '@/utils/errors';
import type { ApiResponse } from '@/types';

/**
 * 全局错误处理中间件
 * 捕获所有异常并返回统一格式的错误响应
 */
export async function errorHandler(ctx: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (error) {
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = '服务器内部错误';

    if (error instanceof AppError) {
      statusCode = error.statusCode;
      code = error.code;
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;

      if (error.name === 'SequelizeValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = '数据验证失败';
      } else if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        code = 'CONFLICT';
        message = '数据已存在';
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        code = 'FOREIGN_KEY_ERROR';
        message = '关联数据不存在';
      }
    }

    if (statusCode >= 500) {
      logger.error('服务器错误', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        url: ctx.url,
        method: ctx.method,
      });
    } else {
      logger.warn('客户端错误', {
        statusCode,
        code,
        message,
        url: ctx.url,
        method: ctx.method,
      });
    }

    ctx.status = statusCode;
    ctx.body = {
      code: statusCode,
      message,
      data: null,
    } satisfies ApiResponse<null>;
  }
}
