import { Context, Next } from 'koa';
import { getRedisClient } from '@/utils/redis';
import { logger } from '@/utils/logger';
import { RateLimitError } from '@/utils/errors';
import { config } from '@/config';

/** 限流配置 */
interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000,
  maxRequests: 60,
  keyPrefix: 'rate_limit',
};

/**
 * 创建限流中间件
 * @param options 限流配置
 * @returns Koa 中间件
 */
export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return async function rateLimitMiddleware(ctx: Context, next: Next): Promise<void> {
    try {
      const redis = getRedisClient();
      const userId = ctx.state.userId || ctx.ip;
      const key = `${opts.keyPrefix}:${userId}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.pexpire(key, opts.windowMs);
      }

      const ttl = await redis.pttl(key);
      const remaining = Math.max(0, opts.maxRequests - current);

      ctx.set('X-RateLimit-Limit', String(opts.maxRequests));
      ctx.set('X-RateLimit-Remaining', String(remaining));
      ctx.set('X-RateLimit-Reset', String(Math.ceil(Date.now() + ttl) / 1000));

      if (current > opts.maxRequests) {
        logger.warn('请求限流', { userId, current, max: opts.maxRequests });
        throw new RateLimitError();
      }

      await next();
    } catch (error) {
      if (error instanceof RateLimitError) throw error;
      // 非 RateLimitError 的错误（如验证错误）直接抛出，不调用 next()
      // 因为 next() 可能已经被调用过了
      throw error;
    }
  };
}
