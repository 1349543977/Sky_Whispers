import { setupTestDatabase, cleanupTestDatabase } from '../setup';
import { User } from '@/models/User';
import { Friendship } from '@/models/Friendship';
import { Gift } from '@/models/Gift';

describe('Social Features Integration Tests', () => {
  let user1Id: number;
  let user2Id: number;

  beforeAll(async () => {
    await setupTestDatabase();

    const user1 = await User.create({
      openid: 'social_user_1',
      nickname: '社交用户1',
      avatar_url: '',
      level: 1,
      exp: 0,
      coins: 0,
      wind_power: 0,
      total_steps: 0,
    } as Record<string, unknown>);
    user1Id = user1.id;

    const user2 = await User.create({
      openid: 'social_user_2',
      nickname: '社交用户2',
      avatar_url: '',
      level: 1,
      exp: 0,
      coins: 0,
      wind_power: 0,
      total_steps: 0,
    } as Record<string, unknown>);
    user2Id = user2.id;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('好友系统', () => {
    it('应该能发送好友请求', async () => {
      const friendship = await Friendship.create({
        user_id: user1Id,
        friend_id: user2Id,
        status: 'pending',
      } as Record<string, unknown>);

      expect(friendship.id).toBeDefined();
      expect(friendship.status).toBe('pending');
    });

    it('不能重复创建好友关系', async () => {
      await expect(
        Friendship.create({
          user_id: user1Id,
          friend_id: user2Id,
          status: 'pending',
        } as Record<string, unknown>),
      ).rejects.toThrow();
    });

    it('应该能接受好友请求', async () => {
      const friendship = await Friendship.findOne({
        where: { user_id: user1Id, friend_id: user2Id } as Record<string, unknown>,
      });
      expect(friendship).not.toBeNull();

      await friendship!.update({ status: 'accepted' } as Record<string, unknown>);
      await friendship!.reload();

      expect(friendship!.status).toBe('accepted');
    });

    it('应该能查询好友列表', async () => {
      const friendships = await Friendship.findAll({
        where: { status: 'accepted' } as Record<string, unknown>,
      });

      expect(friendships.length).toBeGreaterThan(0);
    });
  });

  describe('礼物系统', () => {
    it('应该能创建礼物', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const gift = await Gift.create({
        sender_id: user1Id,
        receiver_id: user2Id,
        gift_type: 'rain_cloud',
        gift_data: { amount: 1 },
        message: '送你一朵雨云！',
        is_claimed: false,
        expires_at: expiresAt,
      } as Record<string, unknown>);

      expect(gift.id).toBeDefined();
      expect(gift.gift_type).toBe('rain_cloud');
      expect(gift.is_claimed).toBe(false);
    });

    it('应该能领取礼物', async () => {
      const gifts = await Gift.findAll({
        where: { receiver_id: user2Id, is_claimed: false } as Record<string, unknown>,
      });
      const gift = gifts[0];

      await gift.update({ is_claimed: true, claimed_at: new Date() } as Record<string, unknown>);
      await gift.reload();

      expect(gift.is_claimed).toBe(true);
      expect(gift.claimed_at).toBeDefined();
    });

    it('应该能查询已领取的礼物', async () => {
      const claimed = await Gift.findAll({
        where: { receiver_id: user2Id, is_claimed: true } as Record<string, unknown>,
      });

      expect(claimed.length).toBeGreaterThan(0);
    });
  });
});
