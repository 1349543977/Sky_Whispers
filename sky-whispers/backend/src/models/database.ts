import { Sequelize } from 'sequelize';
import { config } from '@/config';
import { logger } from '@/utils/logger';

/** Sequelize 实例 */
let _sequelize: Sequelize | null = null;

/**
 * 获取 Sequelize 实例（单例模式）
 */
export function getSequelize(): Sequelize {
  if (!_sequelize) {
    throw new Error('数据库未初始化，请先调用 initDatabase()');
  }
  return _sequelize;
}

/**
 * 初始化数据库连接并同步模型
 * - 开发/测试模式：使用 SQLite 内存数据库
 * - 生产模式：使用 MySQL
 */
export async function initDatabase(sync: boolean = false): Promise<void> {
  try {
    if (config.db.dialect === 'sqlite' || config.isDev || config.isTest) {
      // 使用 SQLite 内存数据库（Sequelize 内置支持，无需额外驱动）
      _sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: config.isTest ? ':memory:' : config.db.storage || ':memory:',
        logging: false,
        define: {
          underscored: true,
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      });
      logger.info(`使用 SQLite 数据库: ${config.isTest ? ':memory:' : config.db.storage}`);
    } else {
      // 生产模式使用 MySQL
      _sequelize = new Sequelize({
        database: config.db.name,
        username: config.db.user,
        password: config.db.password,
        host: config.db.host,
        port: config.db.port,
        dialect: 'mysql',
        logging: config.isDev ? (msg: string) => logger.debug(msg) : false,
        define: {
          underscored: true,
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
        pool: {
          max: 20,
          min: 5,
          acquire: 60000,
          idle: 10000,
        },
      });
    }

    await _sequelize.authenticate();
    logger.info('数据库连接成功');

    if (sync) {
      await _sequelize.sync({ alter: config.isDev });
      logger.info('数据库模型同步完成');
    }
  } catch (error) {
    logger.error('数据库连接失败', { error: (error as Error).message });
    throw error;
  }
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase(): Promise<void> {
  if (_sequelize) {
    await _sequelize.close();
    _sequelize = null;
    logger.info('数据库连接已关闭');
  }
}
