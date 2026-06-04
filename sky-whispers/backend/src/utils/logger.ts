import winston from 'winston';
import { config } from '@/config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    if (stack) {
      return `${timestamp} [${level}]: ${message}\n${stack}${metaStr}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  }),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  logFormat,
);

const logger = winston.createLogger({
  level: config.isProd ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'sky-whispers' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});

export { logger };
