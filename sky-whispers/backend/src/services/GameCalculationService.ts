import { logger } from '@/utils/logger';

/**
 * 游戏计算服务 - 所有游戏公式计算集中管理
 */
export class GameCalculationService {
  /** 稀有度经验倍率 */
  private static readonly RARITY_EXP_MULTIPLIER: Record<string, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  };

  /** 稀有度捕获率修正 */
  private static readonly RARITY_CATCH_MODIFIER: Record<string, number> = {
    common: 1.0,
    uncommon: 0.8,
    rare: 0.6,
    epic: 0.4,
    legendary: 0.2,
  };

  /** 生长阶段阈值 */
  private static readonly GROWTH_STAGE_THRESHOLDS = [0, 25, 50, 75];

  /** 基础浇水增加进度 */
  private static readonly WATER_BONUS_BASE = 10;

  /** 步数转风之力比率 */
  private static readonly STEPS_TO_WIND_POWER_RATE = 0.01;

  /** 喂食基础幸福度增加 */
  private static readonly FEED_HAPPINESS_BASE = 15;

  /**
   * 计算生长进度
   * @param currentProgress 当前进度
   * @param plantedAt 种植时间
   * @param weatherType 天气类型
   * @param lightLevel 光照等级
   * @param moistureLevel 湿度等级
   * @returns 新的生长进度 (0-100)
   */
  calculateGrowthProgress(
    currentProgress: number,
    plantedAt: Date,
    weatherType: string,
    lightLevel: number,
    moistureLevel: number,
  ): number {
    try {
      const elapsedMs = Date.now() - new Date(plantedAt).getTime();
      const elapsedHours = elapsedMs / (1000 * 60 * 60);

      const weatherMultiplier = this.getWeatherGrowthMultiplier(weatherType);
      const lightFactor = lightLevel / 100;
      const moistureFactor = moistureLevel / 100;

      const growthIncrement = elapsedHours * weatherMultiplier * (0.5 + 0.25 * lightFactor + 0.25 * moistureFactor);

      return Math.min(100, Math.round(currentProgress + growthIncrement));
    } catch (error) {
      logger.error('GameCalculationService.calculateGrowthProgress 失败', { error: (error as Error).message });
      return currentProgress;
    }
  }

  /**
   * 根据进度计算生长阶段
   * @param progress 生长进度 (0-100)
   * @returns 生长阶段 (0-3)
   */
  calculateGrowthStage(progress: number): number {
    if (progress >= GameCalculationService.GROWTH_STAGE_THRESHOLDS[3]) return 3;
    if (progress >= GameCalculationService.GROWTH_STAGE_THRESHOLDS[2]) return 2;
    if (progress >= GameCalculationService.GROWTH_STAGE_THRESHOLDS[1]) return 1;
    return 0;
  }

  /**
   * 计算浇水增加的进度
   * @returns 增加的进度值
   */
  calculateWaterBonus(): number {
    return GameCalculationService.WATER_BONUS_BASE + Math.floor(Math.random() * 5);
  }

  /**
   * 计算收获获得的经验
   * @param rarity 植物稀有度
   * @returns 经验值
   */
  calculateHarvestExp(rarity: string): number {
    const baseExp = 20;
    const multiplier = GameCalculationService.RARITY_EXP_MULTIPLIER[rarity] || 1;
    return Math.round(baseExp * multiplier);
  }

  /**
   * 计算捕获率
   * @param baseCatchRate 基础捕获率
   * @param rarity 精灵稀有度
   * @returns 实际捕获率
   */
  calculateCatchRate(baseCatchRate: number, rarity: string): number {
    const modifier = GameCalculationService.RARITY_CATCH_MODIFIER[rarity] || 1;
    return Math.min(1, baseCatchRate * modifier);
  }

  /**
   * 计算喂食增加的幸福度
   * @param spriteLevel 精灵等级
   * @returns 增加的幸福度
   */
  calculateFeedHappinessGain(spriteLevel: number): number {
    const levelReduction = Math.floor(spriteLevel / 5) * 2;
    return Math.max(5, GameCalculationService.FEED_HAPPINESS_BASE - levelReduction);
  }

  /**
   * 将步数转换为风之力
   * @param steps 步数
   * @returns 风之力数量
   */
  calculateStepsToWindPower(steps: number): number {
    return Math.floor(steps * GameCalculationService.STEPS_TO_WIND_POWER_RATE);
  }

  /**
   * 计算升级所需经验
   * @param currentLevel 当前等级
   * @returns 所需经验
   */
  calculateExpToNextLevel(currentLevel: number): number {
    return Math.round(100 * Math.pow(1.2, currentLevel - 1));
  }

  /**
   * 计算金币产出
   * @param baseYield 基础产出
   * @param plantLevel 植物等级
   * @param weatherBonus 天气加成
   * @returns 金币数量
   */
  calculateCoinYield(baseYield: number, plantLevel: number, weatherBonus: number = 0): number {
    const levelBonus = 1 + (plantLevel - 1) * 0.1;
    return Math.round(baseYield * levelBonus * (1 + weatherBonus));
  }

  /**
   * 获取天气对生长的倍率
   * @param weatherType 天气类型
   * @returns 生长倍率
   */
  private getWeatherGrowthMultiplier(weatherType: string): number {
    const multipliers: Record<string, number> = {
      sunny: 1.2,
      cloudy: 1.0,
      rainy: 1.5,
      stormy: 0.8,
      snowy: 0.6,
      foggy: 0.9,
      windy: 1.1,
    };
    return multipliers[weatherType] || 1.0;
  }
}
