import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/** 环境变量验证 schema */
const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  DB_DIALECT: Joi.string().valid('mysql', 'sqlite').default('sqlite'),
  DB_STORAGE: Joi.string().default('./data/sky_whispers.db'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_NAME: Joi.string().default('sky_whispers'),
  DB_USER: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().allow('').default(''),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  JWT_SECRET: Joi.string().default('sky_whispers_dev_jwt_secret'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  WECHAT_APP_ID: Joi.string().default('wx_test_app_id'),
  WECHAT_APP_SECRET: Joi.string().default('wx_test_app_secret'),

  WEATHER_API_KEY: Joi.string().allow('').default(''),
  WEATHER_API_URL: Joi.string().default('https://api.openweathermap.org/data/2.5'),

  OSS_ACCESS_KEY: Joi.string().allow('').default(''),
  OSS_SECRET_KEY: Joi.string().allow('').default(''),
  OSS_BUCKET: Joi.string().default('sky-whispers-assets'),
  OSS_REGION: Joi.string().default('oss-cn-hangzhou'),
}).unknown(true);

const { value: envVars, error } = envSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
});

if (error) {
  throw new Error(`环境变量验证失败: ${error.message}`);
}

export const config = {
  port: envVars.PORT,
  nodeEnv: envVars.NODE_ENV,
  isDev: envVars.NODE_ENV === 'development',
  isProd: envVars.NODE_ENV === 'production',
  isTest: envVars.NODE_ENV === 'test',

  db: {
    dialect: envVars.DB_DIALECT,
    storage: envVars.DB_STORAGE,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
  },

  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
  },

  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },

  wechat: {
    appId: envVars.WECHAT_APP_ID,
    appSecret: envVars.WECHAT_APP_SECRET,
  },

  weather: {
    apiKey: envVars.WEATHER_API_KEY,
    apiUrl: envVars.WEATHER_API_URL,
  },

  oss: {
    accessKey: envVars.OSS_ACCESS_KEY,
    secretKey: envVars.OSS_SECRET_KEY,
    bucket: envVars.OSS_BUCKET,
    region: envVars.OSS_REGION,
  },
} as const;

export type Config = typeof config;
