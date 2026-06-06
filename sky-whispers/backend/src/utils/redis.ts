import Redis from 'ioredis';
import { config } from '@/config';
import { logger } from '@/utils/logger';

/** Redis 客户端单例 */
let redisClient: Redis | null = null;

/**
 * 获取 Redis 客户端实例（单例模式）
 * 所有环境统一连接本地 Redis
 * @returns Redis 客户端
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 5000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis 连接成功');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis 连接错误', { error: err.message });
    });

    redisClient.on('close', () => {
      logger.warn('Redis 连接关闭');
    });
  }

  return redisClient;
}

/**
 * 关闭 Redis 连接
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis 连接已关闭');
  }
}
