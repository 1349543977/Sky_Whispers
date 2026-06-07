import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import helmet from 'koa-helmet';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { closeRedis } from '@/utils/redis';
import { initDatabase, closeDatabase } from '@/models/database';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/logger';
import { rateLimit } from '@/middleware/rateLimit';
import routes from '@/routes';

/**
 * 创建并配置 Koa 应用
 */
function createApp(): Koa {
  const app = new Koa();

  app.use(errorHandler);
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));
  app.use(bodyParser({
    enableTypes: ['json', 'form'],
    jsonLimit: '10mb',
    formLimit: '10mb',
  }));
  app.use(rateLimit({ windowMs: 60 * 1000, maxRequests: 120 }));

  app.use(routes.routes());
  app.use(routes.allowedMethods());

  return app;
}

/**
 * 启动服务器
 */
async function startServer(): Promise<void> {
  try {
    await initDatabase(config.isDev);
    logger.info('数据库初始化完成');

    const app = createApp();

    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`🚀 Sky Whispers 后端服务已启动`, {
        port: config.port,
        host: '0.0.0.0',
        env: config.nodeEnv,
        note: '真机调试请使用局域网 IP 访问',
      });
    });

    const shutdown = async (signal: string) => {
      logger.info(`收到 ${signal} 信号，开始优雅关闭...`);

      server.close(async () => {
        try {
          await closeDatabase();
          await closeRedis();
          logger.info('服务已优雅关闭');
          process.exit(0);
        } catch (error) {
          logger.error('关闭服务时出错', { error: (error as Error).message });
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('强制关闭：超时');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (error) => {
      logger.error('未捕获的异常', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('未处理的 Promise 拒绝', { reason: String(reason) });
    });
  } catch (error) {
    logger.error('服务启动失败', { error: (error as Error).message });
    process.exit(1);
  }
}

export { createApp };

if (require.main === module) {
  startServer();
}
