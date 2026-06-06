import { Sequelize } from 'sequelize';
import { config } from '@/config';
import { logger } from '@/utils/logger';

/** Sequelize 实例 - 延迟创建 */
let _sequelize: Sequelize | null = null;

/**
 * 获取 Sequelize 实例（单例模式）
 * 所有环境统一使用 MySQL
 */
export function getSequelize(): Sequelize {
  if (!_sequelize) {
    const dbConfig: Record<string, unknown> = {
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
    };

    // 测试环境使用独立的测试数据库
    if (config.isTest) {
      dbConfig.database = `${config.db.name}_test`;
      dbConfig.logging = false;
      dbConfig.pool = { max: 5, min: 0, acquire: 30000, idle: 5000 };
    }

    _sequelize = new Sequelize(dbConfig as any);
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
      await db.sync({ force: config.isTest, alter: config.isDev });
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
