import { FriendshipRepository } from '@/repositories/FriendshipRepository';
import { GiftRepository } from '@/repositories/GiftRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { logger } from '@/utils/logger';
import { NotFoundError, ConflictError, ValidationError } from '@/utils/errors';

const friendshipRepo = new FriendshipRepository();
const giftRepo = new GiftRepository();
const userRepo = new UserRepository();

/** 礼物过期天数 */
const GIFT_EXPIRE_DAYS = 7;

/**
 * 社交服务 - 处理好友、送礼等社交业务逻辑
 */
export class SocialService {
  /**
   * 获取好友列表
   * @param userId 用户 ID
   * @returns 好友列表
   */
  async getFriends(userId: number) {
    try {
      const friendships = await friendshipRepo.findFriends(userId);
      return friendships.map((f) => {
        const isInitiator = f.user_id === userId;
        const friend = isInitiator ? f.get('friend') : f.get('user');
        return {
          friendshipId: f.id,
          friendId: isInitiator ? f.friend_id : f.user_id,
          nickname: (friend as Record<string, unknown>)?.nickname || '',
          avatarUrl: (friend as Record<string, unknown>)?.avatar_url || '',
          level: (friend as Record<string, unknown>)?.level || 1,
          status: f.status,
        };
      });
    } catch (error) {
      logger.error('SocialService.getFriends 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 发送好友请求
   * @param userId 发起者 ID
   * @param friendId 目标用户 ID
   */
  async sendRequest(userId: number, friendId: number) {
    try {
      if (userId === friendId) {
        throw new ValidationError('不能添加自己为好友');
      }

      const friend = await userRepo.findById(friendId);
      if (!friend) {
        throw new NotFoundError('用户', friendId);
      }

      const existing = await friendshipRepo.findExisting(userId, friendId);
      if (existing) {
        throw new ConflictError('好友关系已存在');
      }

      const friendship = await friendshipRepo.create({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      } as Record<string, unknown>);

      logger.info('好友请求发送', { userId, friendId });
      return { friendshipId: friendship.id, status: 'pending' };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof ValidationError) throw error;
      logger.error('SocialService.sendRequest 失败', { userId, friendId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 接受好友请求
   * @param friendshipId 好友关系 ID
   * @param userId 当前用户 ID
   */
  async acceptRequest(friendshipId: number, userId: number) {
    try {
      const friendship = await friendshipRepo.findByIdOrFail(friendshipId);

      if (friendship.friend_id !== userId) {
        throw new ValidationError('无权操作此好友请求');
      }

      if (friendship.status !== 'pending') {
        throw new ValidationError('好友请求已处理');
      }

      await friendshipRepo.updateById(friendshipId, { status: 'accepted' } as Partial<import('@/models/Friendship').Friendship>);
      logger.info('好友请求接受', { friendshipId, userId });
      return { friendshipId, status: 'accepted' };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('SocialService.acceptRequest 失败', { friendshipId, userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 发送礼物
   * @param senderId 发送者 ID
   * @param receiverId 接收者 ID
   * @param giftType 礼物类型
   * @param giftData 礼物数据
   * @param message 留言
   */
  async sendGift(senderId: number, receiverId: number, giftType: string, giftData?: Record<string, unknown>, message?: string) {
    try {
      const friendship = await friendshipRepo.findExisting(senderId, receiverId);
      if (!friendship || friendship.status !== 'accepted') {
        throw new ValidationError('只能给好友送礼');
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + GIFT_EXPIRE_DAYS);

      const gift = await giftRepo.createGift({
        sender_id: senderId,
        receiver_id: receiverId,
        gift_type: giftType,
        gift_data: giftData || {},
        message: message || '',
        expires_at: expiresAt,
      });

      logger.info('礼物发送', { senderId, receiverId, giftType, giftId: gift.id });
      return { giftId: gift.id, expiresAt };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      logger.error('SocialService.sendGift 失败', { senderId, receiverId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 领取礼物
   * @param giftId 礼物 ID
   * @param userId 当前用户 ID
   */
  async claimGift(giftId: number, userId: number) {
    try {
      const gift = await giftRepo.findByIdOrFail(giftId);

      if (gift.receiver_id !== userId) {
        throw new ValidationError('无权领取此礼物');
      }

      if (gift.is_claimed) {
        throw new ValidationError('礼物已领取');
      }

      if (new Date() > new Date(gift.expires_at)) {
        throw new ValidationError('礼物已过期');
      }

      await giftRepo.claimGift(giftId);

      logger.info('礼物领取', { giftId, userId });
      return {
        giftId,
        giftType: gift.gift_type,
        giftData: gift.gift_data,
        message: gift.message,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('SocialService.claimGift 失败', { giftId, userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取待处理的好友请求
   * @param userId 用户 ID
   */
  async getPendingRequests(userId: number) {
    try {
      const pending = await friendshipRepo.findPending(userId);
      return pending.map((f) => ({
        friendshipId: f.id,
        userId: f.user_id,
        nickname: (f.get('user') as Record<string, unknown>)?.nickname || '',
        avatarUrl: (f.get('user') as Record<string, unknown>)?.avatar_url || '',
        createdAt: f.created_at,
      }));
    } catch (error) {
      logger.error('SocialService.getPendingRequests 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取收到的礼物列表
   * @param userId 用户 ID
   */
  async getReceivedGifts(userId: number) {
    try {
      return await giftRepo.findReceived(userId);
    } catch (error) {
      logger.error('SocialService.getReceivedGifts 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取未领取的礼物
   * @param userId 用户 ID
   */
  async getUnclaimedGifts(userId: number) {
    try {
      return await giftRepo.findUnclaimed(userId);
    } catch (error) {
      logger.error('SocialService.getUnclaimedGifts 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }
}
