import { IslandRepository } from '@/repositories/IslandRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { getCurrentWeather, getWeatherForecast, mapWeatherToGameType } from '@/utils/weather';
import { logger } from '@/utils/logger';
import { NotFoundError } from '@/utils/errors';

const islandRepo = new IslandRepository();
const userRepo = new UserRepository();

/**
 * 天气服务 - 处理天气相关业务逻辑
 */
export class WeatherService {
  /**
   * 获取当前天气
   * @param lat 纬度
   * @param lng 经度
   * @returns 天气信息
   */
  async getCurrentWeather(lat: number, lng: number) {
    try {
      const weatherData = await getCurrentWeather(lat, lng);
      const gameWeatherType = mapWeatherToGameType(weatherData.weather[0].id);

      return {
        location: weatherData.name,
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        weatherMain: weatherData.weather[0].main,
        weatherDescription: weatherData.weather[0].description,
        windSpeed: weatherData.wind.speed,
        cloudiness: weatherData.clouds.all,
        gameWeatherType,
        lightLevel: this.calculateLightLevel(weatherData),
        moistureLevel: this.calculateMoistureLevel(weatherData),
      };
    } catch (error) {
      logger.error('WeatherService.getCurrentWeather 失败', { lat, lng, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取天气预报
   * @param lat 纬度
   * @param lng 经度
   * @returns 天气预报信息
   */
  async getForecast(lat: number, lng: number) {
    try {
      const forecastData = await getWeatherForecast(lat, lng);

      return forecastData.list.map((item) => ({
        datetime: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        weatherMain: item.weather[0].main,
        gameWeatherType: mapWeatherToGameType(item.weather[0].id),
        windSpeed: item.wind.speed,
      }));
    } catch (error) {
      logger.error('WeatherService.getForecast 失败', { lat, lng, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 同步天气到用户岛屿
   * @param userId 用户 ID
   */
  async syncWeather(userId: number) {
    try {
      const user = await userRepo.findByIdOrFail(userId);

      if (!user.location_lat || !user.location_lng) {
        return { message: '请先设置位置信息' };
      }

      const weatherInfo = await this.getCurrentWeather(
        Number(user.location_lat),
        Number(user.location_lng),
      );

      const island = await islandRepo.findByUserId(userId);
      if (!island) {
        throw new NotFoundError('岛屿');
      }

      await islandRepo.updateWeather(island.id, weatherInfo.gameWeatherType);
      await islandRepo.updateEnvironment(island.id, weatherInfo.lightLevel, weatherInfo.moistureLevel);

      logger.info('天气同步到岛屿', { userId, weatherType: weatherInfo.gameWeatherType });

      return {
        weatherType: weatherInfo.gameWeatherType,
        lightLevel: weatherInfo.lightLevel,
        moistureLevel: weatherInfo.moistureLevel,
        temperature: weatherInfo.temperature,
        humidity: weatherInfo.humidity,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error('WeatherService.syncWeather 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 根据天气数据计算光照等级
   * @param weatherData 天气数据
   * @returns 光照等级 (0-100)
   */
  private calculateLightLevel(weatherData: { weather: Array<{ id: number }>; clouds: { all: number } }): number {
    const weatherId = weatherData.weather[0].id;
    const cloudiness = weatherData.clouds.all;

    let baseLight = 80;
    if (weatherId >= 200 && weatherId < 300) baseLight = 30;
    else if (weatherId >= 500 && weatherId < 600) baseLight = 40;
    else if (weatherId >= 600 && weatherId < 700) baseLight = 50;
    else if (weatherId === 800) baseLight = 100;
    else if (weatherId > 800) baseLight = 60;

    const cloudFactor = 1 - (cloudiness / 200);
    return Math.round(Math.max(0, Math.min(100, baseLight * cloudFactor)));
  }

  /**
   * 根据天气数据计算湿度等级
   * @param weatherData 天气数据
   * @returns 湿度等级 (0-100)
   */
  private calculateMoistureLevel(weatherData: { main: { humidity: number }; weather: Array<{ id: number }> }): number {
    const humidity = weatherData.main.humidity;
    const weatherId = weatherData.weather[0].id;

    let bonus = 0;
    if (weatherId >= 200 && weatherId < 300) bonus = 30;
    else if (weatherId >= 300 && weatherId < 600) bonus = 40;
    else if (weatherId >= 600 && weatherId < 700) bonus = 20;

    return Math.round(Math.max(0, Math.min(100, humidity + bonus)));
  }
}
