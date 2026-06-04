/**
 * Jest 测试环境变量设置
 * 在所有测试之前加载
 */
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.JWT_SECRET = 'test_jwt_secret_for_unit_tests';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.WECHAT_APP_ID = 'test_app_id';
process.env.WECHAT_APP_SECRET = 'test_app_secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'sky_whispers_test';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.WEATHER_API_KEY = 'test_weather_key';
process.env.WEATHER_API_URL = 'https://api.example.com';
process.env.OSS_ACCESS_KEY = 'test';
process.env.OSS_SECRET_KEY = 'test';
