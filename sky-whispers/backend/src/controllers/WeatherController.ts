import { Context } from 'koa';
import { WeatherService } from '@/services/WeatherService';
import type { ApiResponse } from '@/types';

const weatherService = new WeatherService();

/**
 * 天气控制器
 */
export class WeatherController {
  /**
   * 获取当前天气
   * @route GET /api/v1/weather/current
   */
  async getCurrentWeather(ctx: Context): Promise<void> {
    const { lat, lng } = ctx.query as { lat: string; lng: string };

    const result = await weatherService.getCurrentWeather(Number(lat), Number(lng));

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 获取天气预报
   * @route GET /api/v1/weather/forecast
   */
  async getForecast(ctx: Context): Promise<void> {
    const { lat, lng } = ctx.query as { lat: string; lng: string };

    const result = await weatherService.getForecast(Number(lat), Number(lng));

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 同步天气到岛屿
   * @route POST /api/v1/weather/sync
   */
  async syncWeather(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await weatherService.syncWeather(userId);

    ctx.body = {
      code: 0,
      message: '同步成功',
      data: result,
    } satisfies ApiResponse;
  }
}
