import { Gift } from '@/models/Gift';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';
import { Op } from 'sequelize';

/**
 * 礼物仓库 - 礼物数据访问层
 */
export class GiftRepository extends BaseRepository<Gift> {
  constructor() {
    super(Gift);
  }

  /**
   * 查找用户收到的礼物
   * @param receiverId 接收者 ID
   * @returns 礼物数组
   */
  async findReceived(receiverId: number): Promise<Gift[]> {
    try {
      return await this.findAll({
        where: { receiver_id: receiverId } as Record<string, unknown>,
        include: ['sender'],
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      logger.error('GiftRepository.findReceived 失败', { receiverId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 查找用户未领取的礼物
   * @param receiverId 接收者 ID
   * @returns 未领取的礼物数组
   */
  async findUnclaimed(receiverId: number): Promise<Gift[]> {
    try {
      return await this.findAll({
        where: {
          receiver_id: receiverId,
          is_claimed: false,
          expires_at: { [Op.gt]: new Date() } as unknown as Date,
        } as Record<string, unknown>,
        include: ['sender'],
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      logger.error('GiftRepository.findUnclaimed 失败', { receiverId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 创建礼物
   * @param data 礼物数据
   * @returns 新建的礼物实例
   */
  async createGift(data: {
    sender_id: number;
    receiver_id: number;
    gift_type: string;
    gift_data?: Record<string, unknown>;
    message?: string;
    expires_at: Date;
  }): Promise<Gift> {
    try {
      return await this.create({
        ...data,
        gift_data: data.gift_data || {},
        message: data.message || '',
      } as Record<string, unknown>);
    } catch (error) {
      logger.error('GiftRepository.createGift 失败', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 领取礼物
   * @param giftId 礼物 ID
   */
  async claimGift(giftId: number): Promise<Gift> {
    try {
      return await this.updateById(giftId, {
        is_claimed: true,
        claimed_at: new Date(),
      } as Partial<Gift>);
    } catch (error) {
      logger.error('GiftRepository.claimGift 失败', { giftId, error: (error as Error).message });
      throw error;
    }
  }
}
