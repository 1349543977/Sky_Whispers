import { Sequelize } from 'sequelize';
import { initDatabase, closeDatabase, getSequelize } from '@/models/database';
import { closeRedis } from '@/utils/redis';
import { config } from '@/config';
import { logger } from '@/utils/logger';

/**
 * 测试全局 setup
 * 使用 MySQL 测试数据库（sky_whispers_test）
 * 需要本地运行 MySQL 和 Redis 服务
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test';

export default async function setup(): Promise<void> {
  // 验证必要的环境变量
  if (!process.env.DB_HOST) {
    process.env.DB_HOST = 'localhost';
  }
  if (!process.env.DB_PORT) {
    process.env.DB_PORT = '3306';
  }
  if (!process.env.DB_NAME) {
    process.env.DB_NAME = 'sky_whispers';
  }
  if (!process.env.DB_USER) {
    process.env.DB_USER = 'root';
  }
  if (!process.env.DB_PASSWORD) {
    process.env.DB_PASSWORD = '';
  }
  if (!process.env.REDIS_HOST) {
    process.env.REDIS_HOST = 'localhost';
  }
  if (!process.env.REDIS_PORT) {
    process.env.REDIS_PORT = '6379';
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
  }

  try {
    // 先创建测试数据库（如果不存在）
    const adminSequelize = new Sequelize({
      host: config.db.host,
      port: config.db.port,
      username: config.db.user,
      password: config.db.password,
      dialect: 'mysql',
      logging: false,
    });

    await adminSequelize.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.db.name}_test\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminSequelize.close();
    logger.info('测试数据库创建/确认成功');

    // 初始化数据库并同步模型
    await initDatabase(true);
    logger.info('测试数据库模型同步完成');
  } catch (error) {
    logger.error('测试数据库初始化失败', { error: (error as Error).message });
    throw error;
  }
}

/**
 * 测试结束后清理
 */
export async function teardown(): Promise<void> {
  try {
    const db = getSequelize();
    await db.drop();
    logger.info('测试数据库已清理');
    await closeDatabase();
    await closeRedis();
  } catch (error) {
    logger.error('测试清理失败', { error: (error as Error).message });
  }
}
