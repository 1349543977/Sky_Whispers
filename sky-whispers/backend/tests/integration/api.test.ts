import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '@/app';
import { setupTestDatabase, cleanupTestDatabase } from '../setup';
import { User } from '@/models/User';
import { Island } from '@/models/Island';
import { PlantType } from '@/models/PlantType';
import { Plant } from '@/models/Plant';
import { ShopItem } from '@/models/ShopItem';
import { Friendship } from '@/models/Friendship';
import { Gift } from '@/models/Gift';
import { config } from '@/config';

import '@/models/index';

/** 生成测试用 JWT Token */
function generateToken(userId: number, openid: string, isAdmin: boolean = false): string {
  return jwt.sign({ userId, openid, isAdmin }, config.jwt.secret, { expiresIn: '1h' });
}

describe('API Integration Tests', () => {
  let app: ReturnType<typeof createApp>;
  let testUser: User;
  let testIsland: Island;
  let testPlantType: PlantType;
  let authToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await Gift.destroy({ where: {}, truncate: true });
    await Friendship.destroy({ where: {}, truncate: true });
    await Plant.destroy({ where: {}, truncate: true, cascade: true });
    await PlantType.destroy({ where: {}, truncate: true });
    await ShopItem.destroy({ where: {}, truncate: true });
    await Island.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true });

    testUser = await User.create({
      openid: 'integration_test_user',
      nickname: '集成测试用户',
      avatar_url: 'https://example.com/avatar.png',
      level: 5,
      exp: 100,
      coins: 500,
      wind_power: 50,
      total_steps: 2000,
    });

    testIsland = await Island.create({
      user_id: testUser.id,
      name: '测试浮岛',
      skin_id: 1,
      level: 3,
      expansion_slots: 6,
      weather_type: 'sunny',
      light_level: 60,
      moisture_level: 40,
      windmill_level: 2,
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

    authToken = generateToken(testUser.id, testUser.openid);
  });

  // =========================================================================
  // 认证流程
  // =========================================================================
  describe('Auth Flow', () => {
    it('POST /api/v1/auth/login - 缺少 code 应返回 400', async () => {
      const res = await request(app.callback())
        .post('/api/v1/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).not.toBe(0);
    });

    it('POST /api/v1/auth/login - 空 code 应返回验证错误', async () => {
      const res = await request(app.callback())
        .post('/api/v1/auth/login')
        .send({ code: '' });

      expect(res.status).toBe(400);
    });

    it('POST /api/v1/auth/refresh - 缺少 refreshToken 应返回 400', async () => {
      const res = await request(app.callback())
        .post('/api/v1/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
    });

    it('POST /api/v1/auth/refresh - 无效 refreshToken 应返回 401', async () => {
      const res = await request(app.callback())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid_token' });

      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // 获取用户资料
  // =========================================================================
  describe('User Profile', () => {
    it('GET /api/v1/user/profile - 应返回用户资料', async () => {
      const res = await request(app.callback())
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toBeDefined();
    });

    it('GET /api/v1/user/profile - 无 Token 应返回 401', async () => {
      const res = await request(app.callback())
        .get('/api/v1/user/profile');

      expect(res.status).toBe(401);
    });

    it('GET /api/v1/user/profile - 无效 Token 应返回 401', async () => {
      const res = await request(app.callback())
        .get('/api/v1/user/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // 获取岛屿数据
  // =========================================================================
  describe('Island Data', () => {
    it('GET /api/v1/island - 应返回岛屿数据', async () => {
      const res = await request(app.callback())
        .get('/api/v1/island')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
    });

    it('GET /api/v1/island - 无 Token 应返回 401', async () => {
      const res = await request(app.callback())
        .get('/api/v1/island');

      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // 种植和收获流程
  // =========================================================================
  describe('Plant & Harvest Flow', () => {
    it('应完成完整的种植→浇水→收获流程', async () => {
      // 1. 种植
      const plantRes = await request(app.callback())
        .post('/api/v1/plants/plant')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ plantTypeId: testPlantType.id });

      expect(plantRes.status).toBe(200);
      expect(plantRes.body.code).toBe(0);
      expect(plantRes.body.data.growthStage).toBe(0);
      const plantId = plantRes.body.data.id;

      // 2. 浇水
      const waterRes = await request(app.callback())
        .post(`/api/v1/plants/${plantId}/water`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(waterRes.status).toBe(200);
      expect(waterRes.body.code).toBe(0);
      expect(waterRes.body.data.growthBonus).toBeGreaterThanOrEqual(10);

      // 3. 手动设置植物为成熟状态（模拟生长完成）
      await Plant.update(
        { growth_stage: 3, growth_progress: 100, matured_at: new Date() },
        { where: { id: plantId } },
      );

      // 4. 收获
      const harvestRes = await request(app.callback())
        .post(`/api/v1/plants/${plantId}/harvest`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(harvestRes.status).toBe(200);
      expect(harvestRes.body.code).toBe(0);
      expect(harvestRes.body.data.coinYield).toBe(15);
      expect(harvestRes.body.data.expYield).toBe(20);
    });

    it('种植缺少 plantTypeId 应返回 400', async () => {
      const res = await request(app.callback())
        .post('/api/v1/plants/plant')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('收获未成熟植物应返回错误', async () => {
      const plant = await Plant.create({
        island_id: testIsland.id,
        plant_type_id: testPlantType.id,
        growth_stage: 1,
        growth_progress: 30,
        planted_at: new Date(),
        is_collected: false,
      });

      const res = await request(app.callback())
        .post(`/api/v1/plants/${plant.id}/harvest`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // 社交礼物流程
  // =========================================================================
  describe('Social Gift Flow', () => {
    let friendUser: User;
    let friendToken: string;

    beforeEach(async () => {
      friendUser = await User.create({
        openid: 'friend_user',
        nickname: '好友用户',
        avatar_url: '',
        level: 3,
        exp: 50,
        coins: 200,
        wind_power: 20,
        total_steps: 500,
      });

      friendToken = generateToken(friendUser.id, friendUser.openid);

      await Friendship.create({
        user_id: testUser.id,
        friend_id: friendUser.id,
        status: 'accepted',
      });
    });

    it('应完成完整的发送礼物→领取礼物流程', async () => {
      // 1. 发送好友请求（新用户之间）
      const newUser = await User.create({
        openid: 'new_friend',
        nickname: '新朋友',
        avatar_url: '',
        level: 1,
        exp: 0,
        coins: 0,
        wind_power: 0,
        total_steps: 0,
      });

      const requestRes = await request(app.callback())
        .post('/api/v1/social/friend-request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ friendId: newUser.id });

      expect(requestRes.status).toBe(200);
      expect(requestRes.body.data.status).toBe('pending');

      // 2. 发送礼物
      const giftRes = await request(app.callback())
        .post('/api/v1/social/gifts/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          receiverId: friendUser.id,
          giftType: 'rain_cloud',
          giftData: { moisture_bonus: 20 },
          message: '送你一朵雨云~',
        });

      expect(giftRes.status).toBe(200);
      expect(giftRes.body.code).toBe(0);
      const giftId = giftRes.body.data.giftId;

      // 3. 领取礼物
      const claimRes = await request(app.callback())
        .post(`/api/v1/social/gifts/${giftId}/claim`)
        .set('Authorization', `Bearer ${friendToken}`);

      expect(claimRes.status).toBe(200);
      expect(claimRes.body.code).toBe(0);
      expect(claimRes.body.data.giftType).toBe('rain_cloud');
    });

    it('非好友不能发送礼物', async () => {
      const stranger = await User.create({
        openid: 'stranger_user',
        nickname: '陌生人',
        avatar_url: '',
        level: 1,
        exp: 0,
        coins: 0,
        wind_power: 0,
        total_steps: 0,
      });

      const res = await request(app.callback())
        .post('/api/v1/social/gifts/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          receiverId: stranger.id,
          giftType: 'breeze',
        });

      expect(res.status).toBe(400);
    });

    it('获取好友列表应返回已接受的好友', async () => {
      const res = await request(app.callback())
        .get('/api/v1/social/friends')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // 错误响应
  // =========================================================================
  describe('Error Responses', () => {
    it('401 - 无 Token 访问受保护接口', async () => {
      const res = await request(app.callback())
        .get('/api/v1/user/profile');

      expect(res.status).toBe(401);
      expect(res.body.code).not.toBe(0);
    });

    it('404 - 访问不存在的路由', async () => {
      const res = await request(app.callback())
        .get('/api/v1/nonexistent');

      expect(res.status).toBe(404);
    });

    it('422 - 无效的请求参数', async () => {
      const res = await request(app.callback())
        .post('/api/v1/auth/login')
        .send({ code: 12345 }); // code 应为 string

      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // 健康检查
  // =========================================================================
  describe('Health Check', () => {
    it('GET /health - 应返回健康状态', async () => {
      const res = await request(app.callback())
        .get('/health');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.status).toBe('healthy');
    });
  });

  // =========================================================================
  // 商店流程
  // =========================================================================
  describe('Shop Flow', () => {
    let shopItem: ShopItem;

    beforeEach(async () => {
      shopItem = await ShopItem.create({
        name: '测试皮肤',
        category: 'skin',
        price_coins: 100,
        price_rmb: 0,
        item_data: { skin_id: 5 },
        is_seasonal: false,
        season_id: null,
        available_from: null,
        available_until: null,
      });
    });

    it('应完成浏览→购买→装备流程', async () => {
      // 1. 浏览商店
      const itemsRes = await request(app.callback())
        .get('/api/v1/shop/items');

      expect(itemsRes.status).toBe(200);
      expect(itemsRes.body.code).toBe(0);

      // 2. 购买物品
      const purchaseRes = await request(app.callback())
        .post('/api/v1/shop/purchase')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ itemId: shopItem.id, quantity: 1 });

      expect(purchaseRes.status).toBe(200);
      expect(purchaseRes.body.data.totalCost).toBe(100);

      // 3. 查看背包
      const inventoryRes = await request(app.callback())
        .get('/api/v1/shop/inventory')
        .set('Authorization', `Bearer ${authToken}`);

      expect(inventoryRes.status).toBe(200);
      const inventoryId = inventoryRes.body.data[0].id;

      // 4. 装备物品
      const equipRes = await request(app.callback())
        .post('/api/v1/shop/equip')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ inventoryId });

      expect(equipRes.status).toBe(200);
      expect(equipRes.body.data.isActive).toBe(true);
    });
  });
});
