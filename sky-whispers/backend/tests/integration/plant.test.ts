import { setupTestDatabase, cleanupTestDatabase } from '../setup';
import { User } from '@/models/User';
import { Island } from '@/models/Island';
import { Plant } from '@/models/Plant';
import { PlantType } from '@/models/PlantType';

describe('Plant Growth Cycle Integration Tests', () => {
  let testUserId: number;
  let testIslandId: number;
  let testPlantTypeId: number;

  beforeAll(async () => {
    await setupTestDatabase();

    const user = await User.create({
      openid: 'plant_test_user',
      nickname: '植物测试者',
      avatar_url: '',
      level: 1,
      exp: 0,
      coins: 0,
      wind_power: 0,
      total_steps: 0,
    } as Record<string, unknown>);
    testUserId = user.id;

    const island = await Island.create({
      user_id: testUserId,
      name: '测试浮岛',
      skin_id: 1,
      level: 1,
      expansion_slots: 6,
      weather_type: 'sunny',
      light_level: 80,
      moisture_level: 60,
      windmill_level: 1,
      auto_collect: false,
    } as Record<string, unknown>);
    testIslandId = island.id;

    const plantType = await PlantType.create({
      name: '晴天花',
      name_en: 'Sunny Flower',
      description: '只在晴天绽放的花',
      rarity: 'common',
      growth_time_base: 3600,
      required_weather: ['sunny'],
      required_light_min: 30,
      required_moisture_min: 20,
      coin_yield: 15,
      sprite_url: '',
      is_special: false,
    } as Record<string, unknown>);
    testPlantTypeId = plantType.id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('应该能种植种子', async () => {
    const plant = await Plant.create({
      island_id: testIslandId,
      plant_type_id: testPlantTypeId,
      growth_stage: 0,
      growth_progress: 0,
      planted_at: new Date(),
      is_collected: false,
    } as Record<string, unknown>);

    expect(plant.id).toBeDefined();
    expect(plant.plant_type_id).toBe(testPlantTypeId);
    expect(plant.growth_stage).toBe(0);
    expect(plant.growth_progress).toBe(0);
  });

  it('应该能更新植物生长状态', async () => {
    const plants = await Plant.findAll({
      where: { island_id: testIslandId } as Record<string, unknown>,
    });
    const plant = plants[0];

    await plant.update({ growth_progress: 30, growth_stage: 1 } as Record<string, unknown>);
    await plant.reload();

    expect(plant.growth_progress).toBe(30);
    expect(plant.growth_stage).toBe(1);
  });

  it('应该能标记植物为已收获', async () => {
    const plant = await Plant.create({
      island_id: testIslandId,
      plant_type_id: testPlantTypeId,
      growth_stage: 3,
      growth_progress: 100,
      planted_at: new Date(),
      matured_at: new Date(),
      is_collected: false,
    } as Record<string, unknown>);

    await plant.update({ is_collected: true } as Record<string, unknown>);
    await plant.reload();

    expect(plant.is_collected).toBe(true);
  });

  it('植物生长阶段验证', async () => {
    const plant = await Plant.create({
      island_id: testIslandId,
      plant_type_id: testPlantTypeId,
      growth_stage: 0,
      growth_progress: 0,
      planted_at: new Date(),
      is_collected: false,
    } as Record<string, unknown>);

    await plant.update({ growth_progress: 25, growth_stage: 1 } as Record<string, unknown>);
    await plant.reload();
    expect(plant.growth_stage).toBe(1);

    await plant.update({ growth_progress: 50, growth_stage: 2 } as Record<string, unknown>);
    await plant.reload();
    expect(plant.growth_stage).toBe(2);

    await plant.update({ growth_progress: 75, growth_stage: 3 } as Record<string, unknown>);
    await plant.reload();
    expect(plant.growth_stage).toBe(3);
  });
});
