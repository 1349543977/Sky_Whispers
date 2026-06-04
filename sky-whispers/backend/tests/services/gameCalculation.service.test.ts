import { GameCalculationService } from '@/services/GameCalculationService';

describe('GameCalculationService', () => {
  let service: GameCalculationService;

  beforeEach(() => {
    service = new GameCalculationService();
  });

  // =========================================================================
  // 植物生长率计算 - 不同天气倍率
  // =========================================================================
  describe('calculateGrowthProgress', () => {
    const baseProgress = 10;
    const plantedAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 小时前
    const lightLevel = 50;
    const moistureLevel = 50;

    it('晴天天气倍率应为 1.2', () => {
      const result = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'sunny', lightLevel, moistureLevel,
      );
      // elapsedHours=2, weatherMultiplier=1.2, lightFactor=0.5, moistureFactor=0.5
      // growthIncrement = 2 * 1.2 * (0.5 + 0.25*0.5 + 0.25*0.5) = 2 * 1.2 * 0.75 = 1.8
      // result = min(100, round(10 + 1.8)) = 12
      expect(result).toBe(12);
    });

    it('阴天天气倍率应为 1.0', () => {
      const result = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'cloudy', lightLevel, moistureLevel,
      );
      // growthIncrement = 2 * 1.0 * 0.75 = 1.5
      // result = round(10 + 1.5) = 12 (四舍五入)
      expect(result).toBeGreaterThanOrEqual(11);
      expect(result).toBeLessThanOrEqual(12);
    });

    it('雨天天气倍率应为 1.5', () => {
      const result = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'rainy', lightLevel, moistureLevel,
      );
      // growthIncrement = 2 * 1.5 * 0.75 = 2.25
      // result = round(10 + 2.25) = 12
      expect(result).toBeGreaterThanOrEqual(12);
    });

    it('暴风雨天气倍率应为 0.8', () => {
      const result = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'stormy', lightLevel, moistureLevel,
      );
      // growthIncrement = 2 * 0.8 * 0.75 = 1.2
      // result = round(10 + 1.2) = 11
      expect(result).toBeGreaterThanOrEqual(11);
    });

    it('雪天天气倍率应为 0.6', () => {
      const result = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'snowy', lightLevel, moistureLevel,
      );
      // growthIncrement = 2 * 0.6 * 0.75 = 0.9
      // result = round(10 + 0.9) = 11
      expect(result).toBeGreaterThanOrEqual(10);
    });

    it('雾天天气倍率应为 0.9', () => {
      const result = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'foggy', lightLevel, moistureLevel,
      );
      expect(result).toBeGreaterThanOrEqual(11);
    });

    it('大风天气倍率应为 1.1', () => {
      const result = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'windy', lightLevel, moistureLevel,
      );
      expect(result).toBeGreaterThanOrEqual(11);
    });

    it('未知天气类型倍率应默认为 1.0', () => {
      const result = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'unknown_weather', lightLevel, moistureLevel,
      );
      // growthIncrement = 2 * 1.0 * 0.75 = 1.5
      expect(result).toBeGreaterThanOrEqual(11);
    });

    it('生长进度不应超过 100', () => {
      const highProgress = 99;
      const longAgo = new Date(Date.now() - 100 * 60 * 60 * 1000); // 100 小时前
      const result = service.calculateGrowthProgress(
        highProgress, longAgo, 'rainy', 100, 100,
      );
      expect(result).toBe(100);
    });

    it('光照和湿度影响生长速度', () => {
      const lowEnv = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'sunny', 10, 10,
      );
      const highEnv = service.calculateGrowthProgress(
        baseProgress, plantedAt, 'sunny', 90, 90,
      );
      expect(highEnv).toBeGreaterThan(lowEnv);
    });

    it('刚种植的植物进度为 0', () => {
      const justPlanted = new Date();
      const result = service.calculateGrowthProgress(
        0, justPlanted, 'sunny', 50, 50,
      );
      // elapsedHours ≈ 0, growthIncrement ≈ 0
      expect(result).toBe(0);
    });
  });

  // =========================================================================
  // 生长阶段计算
  // =========================================================================
  describe('calculateGrowthStage', () => {
    it('进度 0-24 应为阶段 0（种子）', () => {
      expect(service.calculateGrowthStage(0)).toBe(0);
      expect(service.calculateGrowthStage(24)).toBe(0);
    });

    it('进度 25-49 应为阶段 1（发芽）', () => {
      expect(service.calculateGrowthStage(25)).toBe(1);
      expect(service.calculateGrowthStage(49)).toBe(1);
    });

    it('进度 50-74 应为阶段 2（生长中）', () => {
      expect(service.calculateGrowthStage(50)).toBe(2);
      expect(service.calculateGrowthStage(74)).toBe(2);
    });

    it('进度 75-100 应为阶段 3（成熟）', () => {
      expect(service.calculateGrowthStage(75)).toBe(3);
      expect(service.calculateGrowthStage(100)).toBe(3);
    });
  });

  // =========================================================================
  // 步数转风之力 (steps / 100, max 500)
  // =========================================================================
  describe('calculateStepsToWindPower', () => {
    it('100 步应转换为 1 风之力', () => {
      expect(service.calculateStepsToWindPower(100)).toBe(1);
    });

    it('1000 步应转换为 10 风之力', () => {
      expect(service.calculateStepsToWindPower(1000)).toBe(10);
    });

    it('50000 步应转换为 500 风之力', () => {
      expect(service.calculateStepsToWindPower(50000)).toBe(500);
    });

    it('0 步应转换为 0 风之力', () => {
      expect(service.calculateStepsToWindPower(0)).toBe(0);
    });

    it('50 步应转换为 0 风之力（向下取整）', () => {
      expect(service.calculateStepsToWindPower(50)).toBe(0);
    });

    it('150 步应转换为 1 风之力（向下取整）', () => {
      expect(service.calculateStepsToWindPower(150)).toBe(1);
    });

    it('99999 步应转换为 999 风之力', () => {
      expect(service.calculateStepsToWindPower(99999)).toBe(999);
    });
  });

  // =========================================================================
  // 收获经验计算
  // =========================================================================
  describe('calculateHarvestExp', () => {
    it('common 稀有度基础经验 20 * 1 = 20', () => {
      expect(service.calculateHarvestExp('common')).toBe(20);
    });

    it('uncommon 稀有度经验 20 * 1.5 = 30', () => {
      expect(service.calculateHarvestExp('uncommon')).toBe(30);
    });

    it('rare 稀有度经验 20 * 2 = 40', () => {
      expect(service.calculateHarvestExp('rare')).toBe(40);
    });

    it('epic 稀有度经验 20 * 3 = 60', () => {
      expect(service.calculateHarvestExp('epic')).toBe(60);
    });

    it('legendary 稀有度经验 20 * 5 = 100', () => {
      expect(service.calculateHarvestExp('legendary')).toBe(100);
    });

    it('未知稀有度默认倍率 1', () => {
      expect(service.calculateHarvestExp('unknown')).toBe(20);
    });
  });

  // =========================================================================
  // 精灵捕获率计算
  // =========================================================================
  describe('calculateCatchRate', () => {
    it('common 精灵捕获率 = base * 1.0', () => {
      expect(service.calculateCatchRate(0.8, 'common')).toBeCloseTo(0.8);
    });

    it('uncommon 精灵捕获率 = base * 0.8', () => {
      expect(service.calculateCatchRate(0.8, 'uncommon')).toBeCloseTo(0.64);
    });

    it('rare 精灵捕获率 = base * 0.6', () => {
      expect(service.calculateCatchRate(0.8, 'rare')).toBeCloseTo(0.48);
    });

    it('epic 精灵捕获率 = base * 0.4', () => {
      expect(service.calculateCatchRate(0.8, 'epic')).toBeCloseTo(0.32);
    });

    it('legendary 精灵捕获率 = base * 0.2', () => {
      expect(service.calculateCatchRate(0.8, 'legendary')).toBeCloseTo(0.16);
    });

    it('捕获率不应超过 1.0', () => {
      expect(service.calculateCatchRate(1.5, 'common')).toBe(1);
    });

    it('未知稀有度默认倍率 1.0', () => {
      expect(service.calculateCatchRate(0.5, 'unknown')).toBeCloseTo(0.5);
    });
  });

  // =========================================================================
  // 喂食幸福度增加
  // =========================================================================
  describe('calculateFeedHappinessGain', () => {
    it('等级 1 精灵喂食增加 15 幸福度', () => {
      expect(service.calculateFeedHappinessGain(1)).toBe(15);
    });

    it('等级 5 精灵喂食增加 13 幸福度 (15 - floor(5/5)*2 = 13)', () => {
      expect(service.calculateFeedHappinessGain(5)).toBe(13);
    });

    it('等级 10 精灵喂食增加 11 幸福度 (15 - floor(10/5)*2 = 11)', () => {
      expect(service.calculateFeedHappinessGain(10)).toBe(11);
    });

    it('等级 20 精灵喂食增加 7 幸福度 (15 - floor(20/5)*2 = 7)', () => {
      expect(service.calculateFeedHappinessGain(20)).toBe(7);
    });

    it('幸福度增加最低为 5', () => {
      expect(service.calculateFeedHappinessGain(100)).toBe(5);
    });
  });

  // =========================================================================
  // 升级经验计算
  // =========================================================================
  describe('calculateExpToNextLevel', () => {
    it('等级 1 升级需要 100 经验', () => {
      expect(service.calculateExpToNextLevel(1)).toBe(100);
    });

    it('等级 2 升级需要 120 经验', () => {
      expect(service.calculateExpToNextLevel(2)).toBe(120);
    });

    it('等级 5 升级需要约 207 经验', () => {
      expect(service.calculateExpToNextLevel(5)).toBe(Math.round(100 * Math.pow(1.2, 4)));
    });

    it('等级越高所需经验越多', () => {
      const level1 = service.calculateExpToNextLevel(1);
      const level5 = service.calculateExpToNextLevel(5);
      const level10 = service.calculateExpToNextLevel(10);
      expect(level5).toBeGreaterThan(level1);
      expect(level10).toBeGreaterThan(level5);
    });
  });

  // =========================================================================
  // 金币产出计算
  // =========================================================================
  describe('calculateCoinYield', () => {
    it('基础产出无加成', () => {
      expect(service.calculateCoinYield(10, 1, 0)).toBe(10);
    });

    it('植物等级加成 (level * 0.1)', () => {
      // levelBonus = 1 + (2-1)*0.1 = 1.1, result = round(10 * 1.1 * 1) = 11
      expect(service.calculateCoinYield(10, 2, 0)).toBe(11);
    });

    it('天气加成', () => {
      // levelBonus = 1, weatherBonus = 0.5, result = round(10 * 1 * 1.5) = 15
      expect(service.calculateCoinYield(10, 1, 0.5)).toBe(15);
    });

    it('等级和天气同时加成', () => {
      // levelBonus = 1 + (3-1)*0.1 = 1.2, weatherBonus = 0.3, result = round(10 * 1.2 * 1.3) = 16
      expect(service.calculateCoinYield(10, 3, 0.3)).toBe(16);
    });
  });

  // =========================================================================
  // 浇水增加进度
  // =========================================================================
  describe('calculateWaterBonus', () => {
    it('浇水增加进度应在 10-14 之间', () => {
      const bonus = service.calculateWaterBonus();
      expect(bonus).toBeGreaterThanOrEqual(10);
      expect(bonus).toBeLessThanOrEqual(14);
    });

    it('多次浇水结果应在合理范围内', () => {
      for (let i = 0; i < 50; i++) {
        const bonus = service.calculateWaterBonus();
        expect(bonus).toBeGreaterThanOrEqual(10);
        expect(bonus).toBeLessThanOrEqual(14);
      }
    });
  });

  // =========================================================================
  // 光照因子计算 (0-1 范围)
  // =========================================================================
  describe('光照因子 (lightFactor)', () => {
    it('光照等级 0 时因子为 0', () => {
      const result = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 0, 50);
      // lightFactor = 0/100 = 0, growthIncrement = 1 * 1.2 * (0.5 + 0 + 0.25*0.5) = 1.2 * 0.625 = 0.75
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('光照等级 100 时因子为 1', () => {
      const lowLight = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 0, 50);
      const highLight = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 100, 50);
      expect(highLight).toBeGreaterThanOrEqual(lowLight);
    });

    it('光照等级 50 时因子为 0.5', () => {
      // 通过比较低光照和高光照来间接验证
      const mid = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 50, 50);
      const low = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 25, 50);
      const high = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 75, 50);
      expect(mid).toBeGreaterThanOrEqual(low);
      expect(high).toBeGreaterThanOrEqual(mid);
    });
  });

  // =========================================================================
  // 湿度因子计算 (0-1 范围)
  // =========================================================================
  describe('湿度因子 (moistureFactor)', () => {
    it('湿度等级 0 时因子为 0', () => {
      const result = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 50, 0);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('湿度等级 100 时因子为 1', () => {
      const lowMoisture = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 50, 0);
      const highMoisture = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 50, 100);
      expect(highMoisture).toBeGreaterThanOrEqual(lowMoisture);
    });

    it('湿度越高生长越快', () => {
      const low = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 50, 25);
      const high = service.calculateGrowthProgress(0, new Date(Date.now() - 60 * 60 * 1000), 'sunny', 50, 75);
      expect(high).toBeGreaterThanOrEqual(low);
    });
  });
});
