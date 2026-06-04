import { GameCalculationService } from '@/services/GameCalculationService';

describe('GameCalculationService', () => {
  let service: GameCalculationService;

  beforeEach(() => {
    service = new GameCalculationService();
  });

  describe('calculateGrowthStage', () => {
    it('进度 0 应返回阶段 0', () => {
      expect(service.calculateGrowthStage(0)).toBe(0);
    });

    it('进度 24 应返回阶段 0', () => {
      expect(service.calculateGrowthStage(24)).toBe(0);
    });

    it('进度 25 应返回阶段 1', () => {
      expect(service.calculateGrowthStage(25)).toBe(1);
    });

    it('进度 49 应返回阶段 1', () => {
      expect(service.calculateGrowthStage(49)).toBe(1);
    });

    it('进度 50 应返回阶段 2', () => {
      expect(service.calculateGrowthStage(50)).toBe(2);
    });

    it('进度 74 应返回阶段 2', () => {
      expect(service.calculateGrowthStage(74)).toBe(2);
    });

    it('进度 75 应返回阶段 3', () => {
      expect(service.calculateGrowthStage(75)).toBe(3);
    });

    it('进度 100 应返回阶段 3', () => {
      expect(service.calculateGrowthStage(100)).toBe(3);
    });
  });

  describe('calculateWaterBonus', () => {
    it('应返回 10-14 之间的值', () => {
      for (let i = 0; i < 100; i++) {
        const bonus = service.calculateWaterBonus();
        expect(bonus).toBeGreaterThanOrEqual(10);
        expect(bonus).toBeLessThanOrEqual(14);
      }
    });
  });

  describe('calculateHarvestExp', () => {
    it('common 稀有度应返回 20 经验', () => {
      expect(service.calculateHarvestExp('common')).toBe(20);
    });

    it('uncommon 稀有度应返回 30 经验', () => {
      expect(service.calculateHarvestExp('uncommon')).toBe(30);
    });

    it('rare 稀有度应返回 40 经验', () => {
      expect(service.calculateHarvestExp('rare')).toBe(40);
    });

    it('epic 稀有度应返回 60 经验', () => {
      expect(service.calculateHarvestExp('epic')).toBe(60);
    });

    it('legendary 稀有度应返回 100 经验', () => {
      expect(service.calculateHarvestExp('legendary')).toBe(100);
    });

    it('未知稀有度应使用默认倍率 1', () => {
      expect(service.calculateHarvestExp('unknown')).toBe(20);
    });
  });

  describe('calculateCatchRate', () => {
    it('common 精灵应保持基础捕获率', () => {
      const rate = service.calculateCatchRate(0.5, 'common');
      expect(rate).toBe(0.5);
    });

    it('uncommon 精灵应降低捕获率', () => {
      const rate = service.calculateCatchRate(0.5, 'uncommon');
      expect(rate).toBe(0.4);
    });

    it('rare 精灵应大幅降低捕获率', () => {
      const rate = service.calculateCatchRate(0.5, 'rare');
      expect(rate).toBe(0.3);
    });

    it('epic 精灵应极低捕获率', () => {
      const rate = service.calculateCatchRate(0.5, 'epic');
      expect(rate).toBe(0.2);
    });

    it('legendary 精灵应最低捕获率', () => {
      const rate = service.calculateCatchRate(0.5, 'legendary');
      expect(rate).toBe(0.1);
    });

    it('捕获率不应超过 1', () => {
      const rate = service.calculateCatchRate(2.0, 'common');
      expect(rate).toBe(1);
    });
  });

  describe('calculateFeedHappinessGain', () => {
    it('等级 1 应返回 15 幸福度', () => {
      expect(service.calculateFeedHappinessGain(1)).toBe(15);
    });

    it('等级 5 应返回 13 幸福度', () => {
      expect(service.calculateFeedHappinessGain(5)).toBe(13);
    });

    it('等级 10 应返回 11 幸福度', () => {
      expect(service.calculateFeedHappinessGain(10)).toBe(11);
    });

    it('高等级最低 5 幸福度', () => {
      expect(service.calculateFeedHappinessGain(100)).toBe(5);
    });
  });

  describe('calculateStepsToWindPower', () => {
    it('0 步应返回 0 风之力', () => {
      expect(service.calculateStepsToWindPower(0)).toBe(0);
    });

    it('100 步应返回 1 风之力', () => {
      expect(service.calculateStepsToWindPower(100)).toBe(1);
    });

    it('1000 步应返回 10 风之力', () => {
      expect(service.calculateStepsToWindPower(1000)).toBe(10);
    });

    it('10000 步应返回 100 风之力', () => {
      expect(service.calculateStepsToWindPower(10000)).toBe(100);
    });
  });

  describe('calculateExpToNextLevel', () => {
    it('等级 1 需要 100 经验', () => {
      expect(service.calculateExpToNextLevel(1)).toBe(100);
    });

    it('等级 2 需要 120 经验', () => {
      expect(service.calculateExpToNextLevel(2)).toBe(120);
    });

    it('等级越高需要越多经验', () => {
      const level1 = service.calculateExpToNextLevel(1);
      const level5 = service.calculateExpToNextLevel(5);
      const level10 = service.calculateExpToNextLevel(10);
      expect(level5).toBeGreaterThan(level1);
      expect(level10).toBeGreaterThan(level5);
    });
  });

  describe('calculateCoinYield', () => {
    it('基础产出无加成', () => {
      expect(service.calculateCoinYield(10, 1)).toBe(10);
    });

    it('等级加成', () => {
      const yieldLevel1 = service.calculateCoinYield(10, 1);
      const yieldLevel5 = service.calculateCoinYield(10, 5);
      expect(yieldLevel5).toBeGreaterThan(yieldLevel1);
    });

    it('天气加成', () => {
      const yieldNoBonus = service.calculateCoinYield(10, 1, 0);
      const yieldWithBonus = service.calculateCoinYield(10, 1, 0.5);
      expect(yieldWithBonus).toBeGreaterThan(yieldNoBonus);
    });
  });
});
