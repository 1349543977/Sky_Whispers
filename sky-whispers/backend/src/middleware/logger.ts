import { Context, Next } from 'koa';
import { logger } from '@/utils/logger';

/**
 * 请求日志中间件
 * 记录请求和响应信息
 */
export async function requestLogger(ctx: Context, next: Next): Promise<void> {
  const start = Date.now();

  logger.info('请求开始', {
    method: ctx.method,
    url: ctx.url,
    ip: ctx.ip,
    userAgent: ctx.headers['user-agent'],
  });

  await next();

  const duration = Date.now() - start;

  logger.info('请求完成', {
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    duration: `${duration}ms`,
  });

  ctx.set('X-Response-Time', `${duration}ms`);
}
