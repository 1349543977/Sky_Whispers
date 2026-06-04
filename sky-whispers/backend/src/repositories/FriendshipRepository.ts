import { Friendship } from '@/models/Friendship';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';
import { Op } from 'sequelize';

/**
 * 好友关系仓库 - 好友数据访问层
 */
export class FriendshipRepository extends BaseRepository<Friendship> {
  constructor() {
    super(Friendship);
  }

  /**
   * 查找用户的好友列表
   * @param userId 用户 ID
   * @returns 好友关系数组
   */
  async findFriends(userId: number): Promise<Friendship[]> {
    try {
      return await this.findAll({
        where: {
          status: 'accepted',
          [Op.or]: [
            { user_id: userId },
            { friend_id: userId },
          ],
        } as Record<string, unknown>,
        include: ['user', 'friend'],
      });
    } catch (error) {
      logger.error('FriendshipRepository.findFriends 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 查找待处理的好友请求
   * @param userId 用户 ID
   * @returns 待处理的好友请求数组
   */
  async findPending(userId: number): Promise<Friendship[]> {
    try {
      return await this.findAll({
        where: {
          friend_id: userId,
          status: 'pending',
        } as Record<string, unknown>,
        include: ['user'],
      });
    } catch (error) {
      logger.error('FriendshipRepository.findPending 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 查找两个用户之间的好友关系
   * @param userId 用户 ID
   * @param friendId 好友 ID
   * @returns 好友关系实例或 null
   */
  async findExisting(userId: number, friendId: number): Promise<Friendship | null> {
    try {
      return await this.findOne({
        where: {
          [Op.or]: [
            { user_id: userId, friend_id: friendId },
            { user_id: friendId, friend_id: userId },
          ],
        } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('FriendshipRepository.findExisting 失败', { userId, friendId, error: (error as Error).message });
      throw error;
    }
  }
}
