import { Sequelize } from 'sequelize';
import { config } from '@/config';
import { logger } from '@/utils/logger';

/** Sequelize 实例 - 测试环境下延迟创建 */
let _sequelize: Sequelize | null = null;

/**
 * 获取 Sequelize 实例（单例模式）
 * 测试环境下使用 sqlite3 内存数据库
 */
export function getSequelize(): Sequelize {
  if (!_sequelize) {
    if (config.isTest) {
      _sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define: {
          underscored: true,
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      });
    } else {
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
  }
  return _sequelize;
}

/** 兼容导出 - 模型文件使用 sequelize 导入 */
export const sequelize = new Proxy({} as Sequelize, {
  get(_target, prop) {
    return Reflect.get(getSequelize(), prop);
  },
});

/**
 * 初始化数据库连接并同步模型
 * @param sync 是否同步模型到数据库
 */
export async function initDatabase(sync: boolean = false): Promise<void> {
  try {
    const db = getSequelize();
    await db.authenticate();
    logger.info('数据库连接成功');

    if (sync) {
      await db.sync({ alter: config.isDev });
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
