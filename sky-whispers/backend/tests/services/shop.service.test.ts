import { setupTestDatabase, cleanupTestDatabase } from '../setup';
import { User } from '@/models/User';
import { ShopItem } from '@/models/ShopItem';
import { UserInventory } from '@/models/UserInventory';
import { ShopService } from '@/services/ShopService';
import { NotFoundError, ValidationError } from '@/utils/errors';

import '@/models/index';

describe('ShopService', () => {
  let shopService: ShopService;
  let testUser: User;
  let coinItem: ShopItem;
  let seasonalItem: ShopItem;
  let expiredItem: ShopItem;
  let upcomingItem: ShopItem;

  beforeAll(async () => {
    await setupTestDatabase();
    shopService = new ShopService();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await UserInventory.destroy({ where: {}, truncate: true });
    await ShopItem.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });

    testUser = await User.create({
      openid: 'shop_test_user',
      nickname: '商店测试用户',
      avatar_url: '',
      level: 1,
      exp: 0,
      coins: 1000,
      wind_power: 0,
      total_steps: 0,
    });

    coinItem = await ShopItem.create({
      name: '浮岛皮肤-樱花',
      category: 'skin',
      price_coins: 200,
      price_rmb: 0,
      item_data: { skin_id: 2, color: 'pink' },
      is_seasonal: false,
      season_id: null,
      available_from: null,
      available_until: null,
    });

    seasonalItem = await ShopItem.create({
      name: '夏日特效',
      category: 'effect',
      price_coins: 500,
      price_rmb: 0,
      item_data: { effect_id: 10, particles: 'sunshine' },
      is_seasonal: true,
      season_id: 1,
      available_from: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
      available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
    });

    expiredItem = await ShopItem.create({
      name: '冬季限定',
      category: 'effect',
      price_coins: 300,
      price_rmb: 0,
      item_data: { effect_id: 5 },
      is_seasonal: true,
      season_id: 4,
      available_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      available_until: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 昨天过期
    });

    upcomingItem = await ShopItem.create({
      name: '秋季新品',
      category: 'prop',
      price_coins: 150,
      price_rmb: 0,
      item_data: { prop_id: 3 },
      is_seasonal: true,
      season_id: 3,
      available_from: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
      available_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });
  });

  // =========================================================================
  // 获取物品列表
  // =========================================================================
  describe('getItems', () => {
    it('应返回所有可购买的物品', async () => {
      const items = await shopService.getItems();
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('按类别筛选应返回对应物品', async () => {
      const skins = await shopService.getItems('skin');
      expect(skins.length).toBeGreaterThanOrEqual(1);
      skins.forEach((item: ShopItem) => {
        expect(item.category).toBe('skin');
      });
    });

    it('不存在的类别应返回空数组', async () => {
      const items = await shopService.getItems('nonexistent');
      expect(items.length).toBe(0);
    });
  });

  // =========================================================================
  // 金币购买
  // =========================================================================
  describe('purchaseItem - coins', () => {
    it('应成功用金币购买物品', async () => {
      const result = await shopService.purchaseItem(testUser.id, coinItem.id, 1);

      expect(result).toBeDefined();
      expect(result.itemId).toBe(coinItem.id);
      expect(result.quantity).toBe(1);
      expect(result.totalCost).toBe(200);
      expect(result.remainingCoins).toBe(800);
    });

    it('购买多个数量应正确计算总价', async () => {
      const result = await shopService.purchaseItem(testUser.id, coinItem.id, 3);

      expect(result.quantity).toBe(3);
      expect(result.totalCost).toBe(600);
      expect(result.remainingCoins).toBe(400);
    });

    it('金币不足时应抛出 ValidationError', async () => {
      const poorUser = await User.create({
        openid: 'poor_user',
        nickname: '穷用户',
        avatar_url: '',
        level: 1,
        exp: 0,
        coins: 10,
        wind_power: 0,
        total_steps: 0,
      });

      await expect(shopService.purchaseItem(poorUser.id, coinItem.id))
        .rejects.toThrow(ValidationError);
    });

    it('物品不存在时应抛出 NotFoundError', async () => {
      await expect(shopService.purchaseItem(testUser.id, 99999))
        .rejects.toThrow(NotFoundError);
    });

    it('已过期的季节限定物品不能购买', async () => {
      await expect(shopService.purchaseItem(testUser.id, expiredItem.id))
        .rejects.toThrow('该物品已下架');
    });

    it('尚未上架的物品不能购买', async () => {
      await expect(shopService.purchaseItem(testUser.id, upcomingItem.id))
        .rejects.toThrow('该物品尚未上架');
    });

    it('重复购买同一物品应增加数量', async () => {
      await shopService.purchaseItem(testUser.id, coinItem.id, 1);
      await shopService.purchaseItem(testUser.id, coinItem.id, 2);

      const inventory = await shopService.getInventory(testUser.id);
      const item = inventory.find((i) => i.itemId === coinItem.id);
      expect(item).toBeDefined();
      expect(item!.quantity).toBe(3);
    });
  });

  // =========================================================================
  // 人民币购买 (price_rmb > 0)
  // =========================================================================
  describe('purchaseItem - RMB', () => {
    let rmbItem: ShopItem;

    beforeEach(async () => {
      rmbItem = await ShopItem.create({
        name: '高级季票',
        category: 'pass',
        price_coins: 0,
        price_rmb: 30.00,
        item_data: { pass_type: 'premium' },
        is_seasonal: false,
        season_id: null,
        available_from: null,
        available_until: null,
      });
    });

    it('人民币价格为 0 时金币购买应成功', async () => {
      const result = await shopService.purchaseItem(testUser.id, rmbItem.id);
      expect(result.totalCost).toBe(0);
      expect(result.remainingCoins).toBe(1000);
    });
  });

  // =========================================================================
  // 装备物品
  // =========================================================================
  describe('equipItem', () => {
    it('应成功装备物品', async () => {
      await shopService.purchaseItem(testUser.id, coinItem.id);
      const inventory = await shopService.getInventory(testUser.id);
      const invItem = inventory.find((i) => i.itemId === coinItem.id);

      const result = await shopService.equipItem(testUser.id, invItem!.id);

      expect(result).toBeDefined();
      expect(result.inventoryId).toBe(invItem!.id);
      expect(result.isActive).toBe(true);
    });

    it('不能装备别人的物品', async () => {
      const otherUser = await User.create({
        openid: 'other_user',
        nickname: '其他用户',
        avatar_url: '',
        level: 1,
        exp: 0,
        coins: 1000,
        wind_power: 0,
        total_steps: 0,
      });

      await shopService.purchaseItem(otherUser.id, coinItem.id);
      const otherInventory = await shopService.getInventory(otherUser.id);
      const otherInvItem = otherInventory.find((i) => i.itemId === coinItem.id);

      await expect(shopService.equipItem(testUser.id, otherInvItem!.id))
        .rejects.toThrow(ValidationError);
    });

    it('背包记录不存在时应抛出 NotFoundError', async () => {
      await expect(shopService.equipItem(testUser.id, 99999))
        .rejects.toThrow(NotFoundError);
    });
  });

  // =========================================================================
  // 季节限定物品可用性
  // =========================================================================
  describe('季节限定物品可用性', () => {
    it('当前可用的季节限定物品应可购买', async () => {
      const result = await shopService.purchaseItem(testUser.id, seasonalItem.id);
      expect(result.itemId).toBe(seasonalItem.id);
    });

    it('已过期的季节限定物品不能购买', async () => {
      await expect(shopService.purchaseItem(testUser.id, expiredItem.id))
        .rejects.toThrow('该物品已下架');
    });

    it('尚未上架的季节限定物品不能购买', async () => {
      await expect(shopService.purchaseItem(testUser.id, upcomingItem.id))
        .rejects.toThrow('该物品尚未上架');
    });

    it('永久可用的物品应可购买', async () => {
      const result = await shopService.purchaseItem(testUser.id, coinItem.id);
      expect(result.itemId).toBe(coinItem.id);
    });
  });

  // =========================================================================
  // 获取用户背包
  // =========================================================================
  describe('getInventory', () => {
    it('应返回用户背包中的物品', async () => {
      await shopService.purchaseItem(testUser.id, coinItem.id);

      const inventory = await shopService.getInventory(testUser.id);
      expect(inventory.length).toBe(1);
      expect(inventory[0].itemId).toBe(coinItem.id);
      expect(inventory[0].quantity).toBe(1);
      expect(inventory[0].isActive).toBe(false);
    });

    it('空背包应返回空数组', async () => {
      const emptyUser = await User.create({
        openid: 'empty_user',
        nickname: '空背包用户',
        avatar_url: '',
        level: 1,
        exp: 0,
        coins: 0,
        wind_power: 0,
        total_steps: 0,
      });

      const inventory = await shopService.getInventory(emptyUser.id);
      expect(inventory).toEqual([]);
    });
  });
});
