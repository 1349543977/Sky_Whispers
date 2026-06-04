import axios from 'axios';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import type { WeatherApiResponse, WeatherForecastResponse, GameWeatherType } from '@/types';

/**
 * 获取当前天气数据
 * @param lat 纬度
 * @param lng 经度
 * @returns 天气 API 响应
 */
export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherApiResponse> {
  try {
    const response = await axios.get<WeatherApiResponse>(
      `${config.weather.apiUrl}/weather`,
      {
        params: {
          lat,
          lon: lng,
          appid: config.weather.apiKey,
          units: 'metric',
          lang: 'zh_cn',
        },
        timeout: 10000,
      },
    );

    logger.info('获取天气数据成功', { lat, lng, weather: response.data.weather?.[0]?.main });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('获取天气数据网络错误', { lat, lng, message: error.message });
      throw new Error('天气服务连接失败');
    }
    throw error;
  }
}

/**
 * 获取天气预报数据
 * @param lat 纬度
 * @param lng 经度
 * @returns 天气预报响应
 */
export async function getWeatherForecast(lat: number, lng: number): Promise<WeatherForecastResponse> {
  try {
    const response = await axios.get<WeatherForecastResponse>(
      `${config.weather.apiUrl}/forecast`,
      {
        params: {
          lat,
          lon: lng,
          appid: config.weather.apiKey,
          units: 'metric',
          lang: 'zh_cn',
        },
        timeout: 10000,
      },
    );

    logger.info('获取天气预报成功', { lat, lng });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('获取天气预报网络错误', { lat, lng, message: error.message });
      throw new Error('天气服务连接失败');
    }
    throw error;
  }
}

/**
 * 将 OpenWeatherMap 天气 ID 映射为游戏内天气类型
 * @param weatherId OWM 天气 ID
 * @returns 游戏天气类型
 */
export function mapWeatherToGameType(weatherId: number): GameWeatherType {
  if (weatherId >= 200 && weatherId < 300) return 'stormy';
  if (weatherId >= 300 && weatherId < 400) return 'rainy';
  if (weatherId >= 500 && weatherId < 600) return 'rainy';
  if (weatherId >= 600 && weatherId < 700) return 'snowy';
  if (weatherId >= 700 && weatherId < 800) return 'foggy';
  if (weatherId === 800) return 'sunny';
  if (weatherId > 800 && weatherId <= 804) return 'cloudy';
  return 'cloudy';
}

/**
 * 根据风速判断是否为大风天气
 * @param windSpeed 风速 (m/s)
 * @returns 是否为大风
 */
export function isWindy(windSpeed: number): boolean {
  return windSpeed >= 5.5;
}
