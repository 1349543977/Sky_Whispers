import { setupTestDatabase, cleanupTestDatabase } from '../setup';
import { User } from '@/models/User';
import { Island } from '@/models/Island';

describe('User & Island Model Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('应该能创建用户', async () => {
    const user = await User.create({
      openid: 'test_openid_001',
      nickname: '测试旅行者',
      avatar_url: '',
      level: 1,
      exp: 0,
      coins: 0,
      wind_power: 0,
      total_steps: 0,
    } as Record<string, unknown>);

    expect(user.id).toBeDefined();
    expect(user.openid).toBe('test_openid_001');
    expect(user.nickname).toBe('测试旅行者');
    expect(user.level).toBe(1);
  });

  it('应该能为用户创建岛屿', async () => {
    const user = await User.create({
      openid: 'test_openid_002',
      nickname: '岛屿主人',
      avatar_url: '',
      level: 1,
      exp: 0,
      coins: 0,
      wind_power: 0,
      total_steps: 0,
    } as Record<string, unknown>);

    const island = await Island.create({
      user_id: user.id,
      name: '我的浮岛',
      skin_id: 1,
      level: 1,
      expansion_slots: 6,
      weather_type: 'sunny',
      light_level: 50,
      moisture_level: 50,
      windmill_level: 1,
      auto_collect: false,
    } as Record<string, unknown>);

    expect(island.id).toBeDefined();
    expect(island.user_id).toBe(user.id);
    expect(island.weather_type).toBe('sunny');
  });

  it('openid 应该唯一', async () => {
    await User.create({
      openid: 'unique_openid',
      nickname: '用户1',
      avatar_url: '',
      level: 1,
      exp: 0,
      coins: 0,
      wind_power: 0,
      total_steps: 0,
    } as Record<string, unknown>);

    await expect(
      User.create({
        openid: 'unique_openid',
        nickname: '用户2',
        avatar_url: '',
        level: 1,
        exp: 0,
        coins: 0,
        wind_power: 0,
        total_steps: 0,
      } as Record<string, unknown>),
    ).rejects.toThrow();
  });

  it('用户默认值应正确', async () => {
    const user = await User.create({
      openid: 'default_test_user',
      nickname: '默认值测试',
      avatar_url: '',
      level: 1,
      exp: 0,
      coins: 0,
      wind_power: 0,
      total_steps: 0,
    } as Record<string, unknown>);

    expect(user.coins).toBe(0);
    expect(user.wind_power).toBe(0);
    expect(user.total_steps).toBe(0);
    expect(user.level).toBe(1);
  });
});
