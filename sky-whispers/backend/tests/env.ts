/**
 * 测试环境变量配置
 * 所有环境统一使用 MySQL + Redis
 */

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_NAME = process.env.DB_NAME || 'sky_whispers';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.WECHAT_APP_ID = process.env.WECHAT_APP_ID || 'test-app-id';
process.env.WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET || 'test-app-secret';
process.env.WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'test-weather-key';
process.env.WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
