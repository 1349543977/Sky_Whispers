import Redis from 'ioredis';
import { config } from '@/config';
import { logger } from '@/utils/logger';

/** Redis 客户端单例 */
let redisClient: Redis | null = null;

/** 测试环境下的 Mock Redis 客户端 */
class MockRedis {
  private store: Map<string, number | string> = new Map();
  private expiry: Map<string, number> = new Map();

  async incr(key: string): Promise<number> {
    const val = Number(this.store.get(key) || 0) + 1;
    this.store.set(key, val);
    return val;
  }

  async pexpire(key: string, ms: number): Promise<number> {
    this.expiry.set(key, Date.now() + ms);
    return 1;
  }

  async pttl(key: string): Promise<number> {
    const exp = this.expiry.get(key);
    if (!exp) return -1;
    const remaining = exp - Date.now();
    return remaining > 0 ? remaining : -2;
  }

  async get(key: string): Promise<string | null> {
    return (this.store.get(key) as string) || null;
  }

  async set(key: string, value: string, ..._args: unknown[]): Promise<string> {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.expiry.delete(key);
    return existed ? 1 : 0;
  }

  async quit(): Promise<string> {
    this.store.clear();
    this.expiry.clear();
    return 'OK';
  }

  on(_event: string, _callback: (...args: unknown[]) => void): this {
    return this;
  }
}

/**
 * 获取 Redis 客户端实例（单例模式）
 * 测试环境下使用 Mock Redis
 * @returns Redis 客户端
 */
export function getRedisClient(): Redis | MockRedis {
  if (config.isTest && !redisClient) {
    redisClient = new MockRedis() as unknown as Redis;
    return redisClient;
  }

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
