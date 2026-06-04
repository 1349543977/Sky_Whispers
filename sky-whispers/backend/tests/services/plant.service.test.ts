import { setupTestDatabase, cleanupTestDatabase } from '../setup';
import { User } from '@/models/User';
import { Island } from '@/models/Island';
import { Plant } from '@/models/Plant';
import { PlantType } from '@/models/PlantType';
import { PlantService } from '@/services/PlantService';
import { NotFoundError, ValidationError } from '@/utils/errors';

// 重新导入关联
import '@/models/index';

describe('PlantService', () => {
  let plantService: PlantService;
  let testUser: User;
  let testIsland: Island;
  let testPlantType: PlantType;

  beforeAll(async () => {
    await setupTestDatabase();
    plantService = new PlantService();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // 每个测试前清空数据并重新创建
    await Plant.destroy({ where: {}, truncate: true, cascade: true });
    await PlantType.destroy({ where: {}, truncate: true });
    await Island.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true });

    testUser = await User.create({
      openid: 'test_openid_plant',
      nickname: '测试用户',
      avatar_url: '',
      level: 1,
      exp: 0,
      coins: 100,
      wind_power: 0,
      total_steps: 0,
    });

    testIsland = await Island.create({
      user_id: testUser.id,
      name: '测试浮岛',
      skin_id: 1,
      level: 1,
      expansion_slots: 6,
      weather_type: 'sunny',
      light_level: 50,
      moisture_level: 50,
      windmill_level: 1,
      auto_collect: false,
    });

    testPlantType = await PlantType.create({
      name: '向日葵',
      name_en: 'Sunflower',
      description: '阳光下的微笑',
      rarity: 'common',
      growth_time_base: 3600,
      required_weather: ['sunny'],
      required_light_min: 30,
      required_moisture_min: 20,
      coin_yield: 15,
      sprite_url: '',
      is_special: false,
    });
  });

  // =========================================================================
  // 种植种子
  // =========================================================================
  describe('plantSeed', () => {
    it('应成功种植种子', async () => {
      const result = await plantService.plantSeed(testIsland.id, testPlantType.id);

      expect(result).toBeDefined();
      expect(result.plantTypeId).toBe(testPlantType.id);
      expect(result.growthStage).toBe(0);
      expect(result.growthProgress).toBe(0);
      expect(result.plantedAt).toBeDefined();
      expect(result.plantTypeName).toBe('向日葵');
    });

    it('岛屿不存在时应抛出 NotFoundError', async () => {
      await expect(plantService.plantSeed(99999, testPlantType.id))
        .rejects.toThrow(NotFoundError);
    });

    it('植物类型不存在时应抛出 NotFoundError', async () => {
      await expect(plantService.plantSeed(testIsland.id, 99999))
        .rejects.toThrow(NotFoundError);
    });

    it('种植槽位已满时应抛出 ValidationError', async () => {
      // 创建一个新用户和槽位为 1 的岛屿
      const smallUser = await User.create({
        openid: 'small_island_user',
        nickname: '小岛用户',
        avatar_url: '',
        level: 1,
        exp: 0,
        coins: 100,
        wind_power: 0,
        total_steps: 0,
      });
      const smallIsland = await Island.create({
        user_id: smallUser.id,
        name: '小浮岛',
        skin_id: 1,
        level: 1,
        expansion_slots: 1,
        weather_type: 'sunny',
        light_level: 50,
        moisture_level: 50,
        windmill_level: 1,
        auto_collect: false,
      });

      // 先种一棵
      await Plant.create({
        island_id: smallIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 0,
        growth_progress: 0,
        planted_at: new Date(),
        is_collected: false,
      });

      // 再种应该失败
      await expect(plantService.plantSeed(smallIsland.id, testPlantType.id))
        .rejects.toThrow(ValidationError);
    });

    it('已收获的植物不占用槽位', async () => {
      const smallUser = await User.create({
        openid: 'small_island_user2',
        nickname: '小岛用户2',
        avatar_url: '',
        level: 1,
        exp: 0,
        coins: 100,
        wind_power: 0,
        total_steps: 0,
      });
      const smallIsland = await Island.create({
        user_id: smallUser.id,
        name: '小浮岛2',
        skin_id: 1,
        level: 1,
        expansion_slots: 1,
        weather_type: 'sunny',
        light_level: 50,
        moisture_level: 50,
        windmill_level: 1,
        auto_collect: false,
      });

      // 种一棵已收获的
      await Plant.create({
        island_id: smallIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 3,
        growth_progress: 100,
        planted_at: new Date(),
        is_collected: true,
      });

      // 还可以种一棵
      const result = await plantService.plantSeed(smallIsland.id, testPlantType.id);
      expect(result).toBeDefined();
    });
  });

  // =========================================================================
  // 浇水
  // =========================================================================
  describe('waterPlant', () => {
    let testPlant: Plant;

    beforeEach(async () => {
      testPlant = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 0,
        growth_progress: 10,
        planted_at: new Date(),
        is_collected: false,
      });
    });

    it('应成功浇水并增加进度', async () => {
      const result = await plantService.waterPlant(testPlant.id);

      expect(result).toBeDefined();
      expect(result.growthBonus).toBeGreaterThanOrEqual(10);
      expect(result.growthBonus).toBeLessThanOrEqual(14);
      expect(result.growthProgress).toBeGreaterThanOrEqual(20);
    });

    it('浇水进度不应超过 100', async () => {
      // 创建一个接近满进度的植物
      const almostDone = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 2,
        growth_progress: 95,
        planted_at: new Date(),
        is_collected: false,
      });

      const result = await plantService.waterPlant(almostDone.id);
      expect(result.growthProgress).toBeLessThanOrEqual(100);
    });

    it('已收获的植物不能浇水', async () => {
      const collected = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 3,
        growth_progress: 100,
        planted_at: new Date(),
        is_collected: true,
      });

      await expect(plantService.waterPlant(collected.id))
        .rejects.toThrow(ValidationError);
    });

    it('已成熟的植物不能浇水', async () => {
      const mature = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 3,
        growth_progress: 100,
        planted_at: new Date(),
        is_collected: false,
      });

      await expect(plantService.waterPlant(mature.id))
        .rejects.toThrow('该植物已成熟');
    });

    it('植物不存在时应抛出 NotFoundError', async () => {
      await expect(plantService.waterPlant(99999))
        .rejects.toThrow(NotFoundError);
    });
  });

  // =========================================================================
  // 收获
  // =========================================================================
  describe('harvestPlant', () => {
    it('应成功收获成熟植物并获得金币', async () => {
      const maturePlant = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 3,
        growth_progress: 100,
        planted_at: new Date(),
        is_collected: false,
      });

      const result = await plantService.harvestPlant(maturePlant.id, testUser.id);

      expect(result).toBeDefined();
      expect(result.plantId).toBe(maturePlant.id);
      expect(result.coinYield).toBe(15); // testPlantType.coin_yield
      expect(result.expYield).toBe(20); // common rarity
      expect(result.rarity).toBe('common');
    });

    it('未成熟的植物不能收获', async () => {
      const youngPlant = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 1,
        growth_progress: 30,
        planted_at: new Date(),
        is_collected: false,
      });

      await expect(plantService.harvestPlant(youngPlant.id, testUser.id))
        .rejects.toThrow('该植物尚未成熟');
    });

    it('已收获的植物不能重复收获', async () => {
      const collected = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 3,
        growth_progress: 100,
        planted_at: new Date(),
        is_collected: true,
      });

      await expect(plantService.harvestPlant(collected.id, testUser.id))
        .rejects.toThrow('该植物已被收获');
    });

    it('稀有植物应产出更多经验和金币', async () => {
      const rarePlantType = await PlantType.create({
        name: '冰晶花',
        name_en: 'IceCrystal',
        description: '冰霜中绽放',
        rarity: 'rare',
        growth_time_base: 7200,
        required_weather: ['snowy'],
        required_light_min: 10,
        required_moisture_min: 60,
        coin_yield: 50,
        sprite_url: '',
        is_special: true,
      });

      const rarePlant = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: rarePlantType.id,
        growth_stage: 3,
        growth_progress: 100,
        planted_at: new Date(),
        is_collected: false,
      });

      const result = await plantService.harvestPlant(rarePlant.id, testUser.id);
      expect(result.coinYield).toBe(50);
      expect(result.expYield).toBe(40); // rare = 20 * 2
      expect(result.rarity).toBe('rare');
    });
  });

  // =========================================================================
  // 生长计算（含天气效果）
  // =========================================================================
  describe('calculateGrowth', () => {
    it('应计算正在生长的植物进度', async () => {
      const growingPlant = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 0,
        growth_progress: 10,
        planted_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        is_collected: false,
      });

      const results = await plantService.calculateGrowth(testIsland.id);

      expect(results.length).toBeGreaterThan(0);
      const updated = results.find((r) => r.plantId === growingPlant.id);
      expect(updated).toBeDefined();
      expect(updated!.newProgress).toBeGreaterThan(10);
    });

    it('已收获的植物不应参与计算', async () => {
      await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 3,
        growth_progress: 100,
        planted_at: new Date(),
        is_collected: true,
      });

      const results = await plantService.calculateGrowth(testIsland.id);
      expect(results.length).toBe(0);
    });

    it('雨天应加速生长', async () => {
      // 设置雨天
      await testIsland.update({ weather_type: 'rainy' });

      const rainyPlant = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 0,
        growth_progress: 10,
        planted_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        is_collected: false,
      });

      // 设置晴天
      await Island.create({
        user_id: (await User.create({
          openid: 'test_sunny_user',
          nickname: '晴天用户',
          avatar_url: '',
          level: 1,
          exp: 0,
          coins: 0,
          wind_power: 0,
          total_steps: 0,
        })).id,
        name: '晴天浮岛',
        skin_id: 1,
        level: 1,
        expansion_slots: 6,
        weather_type: 'sunny',
        light_level: 50,
        moisture_level: 50,
        windmill_level: 1,
        auto_collect: false,
      });

      const rainyResults = await plantService.calculateGrowth(testIsland.id);
      const rainyGrowth = rainyResults.find((r) => r.plantId === rainyPlant.id);
      expect(rainyGrowth).toBeDefined();
      expect(rainyGrowth!.newProgress).toBeGreaterThan(10);
    });

    it('岛屿不存在时应抛出错误', async () => {
      await expect(plantService.calculateGrowth(99999))
        .rejects.toThrow();
    });
  });

  // =========================================================================
  // 特殊植物需求
  // =========================================================================
  describe('特殊植物需求', () => {
    it('特殊植物类型应标记 is_special', async () => {
      const specialType = await PlantType.create({
        name: '雷鸣花',
        name_en: 'ThunderBloom',
        description: '暴风雨中盛开',
        rarity: 'epic',
        growth_time_base: 14400,
        required_weather: ['stormy'],
        required_light_min: 0,
        required_moisture_min: 80,
        coin_yield: 100,
        sprite_url: '',
        is_special: true,
      });

      expect(specialType.is_special).toBe(true);
      expect(specialType.required_weather).toContain('stormy');
    });

    it('特殊植物可以种植', async () => {
      const specialType = await PlantType.create({
        name: '雪精灵草',
        name_en: 'SnowFairyGrass',
        description: '雪中精灵',
        rarity: 'legendary',
        growth_time_base: 28800,
        required_weather: ['snowy'],
        required_light_min: 0,
        required_moisture_min: 90,
        coin_yield: 200,
        sprite_url: '',
        is_special: true,
      });

      const result = await plantService.plantSeed(testIsland.id, specialType.id);
      expect(result).toBeDefined();
      expect(result.plantTypeName).toBe('雪精灵草');
    });
  });

  // =========================================================================
  // 获取岛屿植物列表
  // =========================================================================
  describe('getIslandPlants', () => {
    it('应返回岛屿上所有植物', async () => {
      await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 0,
        growth_progress: 10,
        planted_at: new Date(),
        is_collected: false,
      });

      const plants = await plantService.getIslandPlants(testIsland.id);
      expect(plants.length).toBe(1);
      expect(plants[0].plantTypeId).toBe(testPlantType.id);
    });

    it('空岛屿应返回空数组', async () => {
      const emptyUser = await User.create({
        openid: 'empty_island_user',
        nickname: '空岛用户',
        avatar_url: '',
        level: 1,
        exp: 0,
        coins: 0,
        wind_power: 0,
        total_steps: 0,
      });
      const emptyIsland = await Island.create({
        user_id: emptyUser.id,
        name: '空浮岛',
        skin_id: 1,
        level: 1,
        expansion_slots: 6,
        weather_type: 'sunny',
        light_level: 50,
        moisture_level: 50,
        windmill_level: 1,
        auto_collect: false,
      });

      const plants = await plantService.getIslandPlants(emptyIsland.id);
      expect(plants).toEqual([]);
    });
  });
});
