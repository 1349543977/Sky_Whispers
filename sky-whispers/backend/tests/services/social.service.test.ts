import { setupTestDatabase, cleanupTestDatabase } from '../setup';
import { User } from '@/models/User';
import { Friendship } from '@/models/Friendship';
import { Gift } from '@/models/Gift';
import { Island } from '@/models/Island';
import { SocialService } from '@/services/SocialService';
import { NotFoundError, ConflictError, ValidationError } from '@/utils/errors';

import '@/models/index';

describe('SocialService', () => {
  let socialService: SocialService;
  let user1: User;
  let user2: User;
  let user3: User;

  beforeAll(async () => {
    await setupTestDatabase();
    socialService = new SocialService();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await Gift.destroy({ where: {}, truncate: true });
    await Friendship.destroy({ where: {}, truncate: true });
    await Island.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true });

    user1 = await User.create({
      openid: 'social_user1',
      nickname: '用户一',
      avatar_url: 'https://example.com/avatar1.png',
      level: 5,
      exp: 100,
      coins: 500,
      wind_power: 50,
      total_steps: 1000,
    });

    user2 = await User.create({
      openid: 'social_user2',
      nickname: '用户二',
      avatar_url: 'https://example.com/avatar2.png',
      level: 3,
      exp: 50,
      coins: 200,
      wind_power: 30,
      total_steps: 500,
    });

    user3 = await User.create({
      openid: 'social_user3',
      nickname: '用户三',
      avatar_url: 'https://example.com/avatar3.png',
      level: 8,
      exp: 200,
      coins: 1000,
      wind_power: 100,
      total_steps: 3000,
    });
  });

  // =========================================================================
  // 发送好友请求
  // =========================================================================
  describe('sendRequest', () => {
    it('应成功发送好友请求', async () => {
      const result = await socialService.sendRequest(user1.id, user2.id);

      expect(result).toBeDefined();
      expect(result.status).toBe('pending');
      expect(result.friendshipId).toBeDefined();
    });

    it('不能添加自己为好友', async () => {
      await expect(socialService.sendRequest(user1.id, user1.id))
        .rejects.toThrow(ValidationError);
    });

    it('目标用户不存在时应抛出 NotFoundError', async () => {
      await expect(socialService.sendRequest(user1.id, 99999))
        .rejects.toThrow(NotFoundError);
    });

    it('重复发送好友请求应抛出 ConflictError', async () => {
      await socialService.sendRequest(user1.id, user2.id);
      await expect(socialService.sendRequest(user1.id, user2.id))
        .rejects.toThrow(ConflictError);
    });

    it('反向发送好友请求也应抛出 ConflictError', async () => {
      await socialService.sendRequest(user1.id, user2.id);
      await expect(socialService.sendRequest(user2.id, user1.id))
        .rejects.toThrow(ConflictError);
    });
  });

  // =========================================================================
  // 接受好友请求
  // =========================================================================
  describe('acceptRequest', () => {
    let friendship: Friendship;

    beforeEach(async () => {
      friendship = await Friendship.create({
        user_id: user1.id,
        friend_id: user2.id,
        status: 'pending',
      });
    });

    it('应成功接受好友请求', async () => {
      const result = await socialService.acceptRequest(friendship.id, user2.id);

      expect(result).toBeDefined();
      expect(result.status).toBe('accepted');
      expect(result.friendshipId).toBe(friendship.id);
    });

    it('非目标用户不能接受好友请求', async () => {
      await expect(socialService.acceptRequest(friendship.id, user3.id))
        .rejects.toThrow(ValidationError);
    });

    it('已处理的好友请求不能重复接受', async () => {
      await socialService.acceptRequest(friendship.id, user2.id);
      await expect(socialService.acceptRequest(friendship.id, user2.id))
        .rejects.toThrow(ValidationError);
    });

    it('好友请求不存在时应抛出 NotFoundError', async () => {
      await expect(socialService.acceptRequest(99999, user2.id))
        .rejects.toThrow(NotFoundError);
    });
  });

  // =========================================================================
  // 发送雨云礼物
  // =========================================================================
  describe('sendGift - rain_cloud', () => {
    let friendship: Friendship;

    beforeEach(async () => {
      friendship = await Friendship.create({
        user_id: user1.id,
        friend_id: user2.id,
        status: 'accepted',
      });
    });

    it('应成功发送雨云礼物', async () => {
      const result = await socialService.sendGift(
        user1.id, user2.id, 'rain_cloud',
        { moisture_bonus: 20 }, '送你一朵雨云~',
      );

      expect(result).toBeDefined();
      expect(result.giftId).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('只能给好友送礼', async () => {
      await expect(
        socialService.sendGift(user1.id, user3.id, 'rain_cloud'),
      ).rejects.toThrow(ValidationError);
    });

    it('未接受的好友关系不能送礼', async () => {
      await Friendship.create({
        user_id: user1.id,
        friend_id: user3.id,
        status: 'pending',
      });

      await expect(
        socialService.sendGift(user1.id, user3.id, 'rain_cloud'),
      ).rejects.toThrow(ValidationError);
    });
  });

  // =========================================================================
  // 发送微风礼物
  // =========================================================================
  describe('sendGift - breeze', () => {
    let friendship: Friendship;

    beforeEach(async () => {
      friendship = await Friendship.create({
        user_id: user1.id,
        friend_id: user2.id,
        status: 'accepted',
      });
    });

    it('应成功发送微风礼物', async () => {
      const result = await socialService.sendGift(
        user1.id, user2.id, 'breeze',
        { wind_bonus: 10 }, '一阵清风~',
      );

      expect(result).toBeDefined();
      expect(result.giftId).toBeDefined();
    });

    it('礼物应设置过期时间', async () => {
      const result = await socialService.sendGift(
        user1.id, user2.id, 'breeze',
      );

      const expiresAt = new Date(result.expiresAt);
      const now = new Date();
      const diffDays = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(6);
      expect(diffDays).toBeLessThanOrEqual(8);
    });
  });

  // =========================================================================
  // 领取礼物
  // =========================================================================
  describe('claimGift', () => {
    let gift: Gift;

    beforeEach(async () => {
      await Friendship.create({
        user_id: user1.id,
        friend_id: user2.id,
        status: 'accepted',
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      gift = await Gift.create({
        sender_id: user1.id,
        receiver_id: user2.id,
        gift_type: 'rain_cloud',
        gift_data: { moisture_bonus: 20 },
        message: '送你一朵雨云~',
        is_claimed: false,
        expires_at: expiresAt,
      });
    });

    it('应成功领取礼物', async () => {
      const result = await socialService.claimGift(gift.id, user2.id);

      expect(result).toBeDefined();
      expect(result.giftId).toBe(gift.id);
      expect(result.giftType).toBe('rain_cloud');
      expect(result.giftData).toBeDefined();
      expect(result.message).toBe('送你一朵雨云~');
    });

    it('不能领取别人的礼物', async () => {
      await expect(socialService.claimGift(gift.id, user3.id))
        .rejects.toThrow(ValidationError);
    });

    it('不能重复领取礼物', async () => {
      await socialService.claimGift(gift.id, user2.id);
      await expect(socialService.claimGift(gift.id, user2.id))
        .rejects.toThrow('礼物已领取');
    });

    it('过期礼物不能领取', async () => {
      const expiredGift = await Gift.create({
        sender_id: user1.id,
        receiver_id: user2.id,
        gift_type: 'breeze',
        gift_data: {},
        message: '',
        is_claimed: false,
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天过期
      });

      await expect(socialService.claimGift(expiredGift.id, user2.id))
        .rejects.toThrow('礼物已过期');
    });

    it('礼物不存在时应抛出 NotFoundError', async () => {
      await expect(socialService.claimGift(99999, user2.id))
        .rejects.toThrow(NotFoundError);
    });
  });

  // =========================================================================
  // 访问好友岛屿
  // =========================================================================
  describe('getFriends', () => {
    it('应返回已接受的好友列表', async () => {
      await Friendship.create({
        user_id: user1.id,
        friend_id: user2.id,
        status: 'accepted',
      });

      const friends = await socialService.getFriends(user1.id);
      expect(friends.length).toBe(1);
      expect(friends[0].friendId).toBe(user2.id);
    });

    it('待处理的好友请求不应出现在好友列表', async () => {
      await Friendship.create({
        user_id: user1.id,
        friend_id: user2.id,
        status: 'pending',
      });

      const friends = await socialService.getFriends(user1.id);
      expect(friends.length).toBe(0);
    });

    it('无好友时应返回空列表', async () => {
      const friends = await socialService.getFriends(user1.id);
      expect(friends).toEqual([]);
    });
  });

  // =========================================================================
  // 获取待处理的好友请求
  // =========================================================================
  describe('getPendingRequests', () => {
    it('应返回待处理的好友请求', async () => {
      await Friendship.create({
        user_id: user2.id,
        friend_id: user1.id,
        status: 'pending',
      });

      const pending = await socialService.getPendingRequests(user1.id);
      expect(pending.length).toBe(1);
      expect(pending[0].userId).toBe(user2.id);
    });

    it('已接受的好友请求不应出现在待处理列表', async () => {
      await Friendship.create({
        user_id: user2.id,
        friend_id: user1.id,
        status: 'accepted',
      });

      const pending = await socialService.getPendingRequests(user1.id);
      expect(pending.length).toBe(0);
    });
  });

  // =========================================================================
  // 获取收到的礼物
  // =========================================================================
  describe('getReceivedGifts', () => {
    it('应返回收到的礼物列表', async () => {
      await Gift.create({
        sender_id: user1.id,
        receiver_id: user2.id,
        gift_type: 'rain_cloud',
        gift_data: {},
        message: '你好',
        is_claimed: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const gifts = await socialService.getReceivedGifts(user2.id);
      expect(gifts.length).toBe(1);
    });
  });

  // =========================================================================
  // 获取未领取的礼物
  // =========================================================================
  describe('getUnclaimedGifts', () => {
    it('应返回未领取且未过期的礼物', async () => {
      await Gift.create({
        sender_id: user1.id,
        receiver_id: user2.id,
        gift_type: 'breeze',
        gift_data: {},
        message: '',
        is_claimed: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const gifts = await socialService.getUnclaimedGifts(user2.id);
      expect(gifts.length).toBe(1);
    });

    it('已领取的礼物不应出现在未领取列表', async () => {
      await Gift.create({
        sender_id: user1.id,
        receiver_id: user2.id,
        gift_type: 'breeze',
        gift_data: {},
        message: '',
        is_claimed: true,
        claimed_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const gifts = await socialService.getUnclaimedGifts(user2.id);
      expect(gifts.length).toBe(0);
    });
  });
});
