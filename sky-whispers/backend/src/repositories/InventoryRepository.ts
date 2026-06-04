import { UserInventory } from '@/models/UserInventory';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';

/**
 * 用户背包仓库 - 用户背包数据访问层
 */
export class InventoryRepository extends BaseRepository<UserInventory> {
  constructor() {
    super(UserInventory);
  }

  /**
   * 查找用户的所有物品
   * @param userId 用户 ID
   * @returns 背包物品数组
   */
  async findByUserId(userId: number): Promise<UserInventory[]> {
    try {
      return await this.findAll({
        where: { user_id: userId } as Record<string, unknown>,
        include: ['item'],
        order: [['acquired_at', 'DESC']],
      });
    } catch (error) {
      logger.error('InventoryRepository.findByUserId 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 查找用户特定物品
   * @param userId 用户 ID
   * @param itemId 物品 ID
   * @returns 背包物品实例或 null
   */
  async findByItem(userId: number, itemId: number): Promise<UserInventory | null> {
    try {
      return await this.findOne({
        where: {
          user_id: userId,
          item_id: itemId,
        } as Record<string, unknown>,
      });
    } catch (error) {
      logger.error('InventoryRepository.findByItem 失败', { userId, itemId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 增加物品数量
   * @param userId 用户 ID
   * @param itemId 物品 ID
   * @param quantity 增加数量
   */
  async addItem(userId: number, itemId: number, quantity: number = 1): Promise<UserInventory> {
    try {
      const existing = await this.findByItem(userId, itemId);
      if (existing) {
        await existing.increment('quantity', { by: quantity });
        return await existing.reload();
      }
      return await this.create({
        user_id: userId,
        item_id: itemId,
        quantity,
      } as Record<string, unknown>);
    } catch (error) {
      logger.error('InventoryRepository.addItem 失败', { userId, itemId, quantity, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 装备物品
   * @param inventoryId 背包记录 ID
   */
  async equipItem(inventoryId: number): Promise<UserInventory> {
    try {
      return await this.updateById(inventoryId, { is_active: true } as Partial<UserInventory>);
    } catch (error) {
      logger.error('InventoryRepository.equipItem 失败', { inventoryId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 卸下物品
   * @param inventoryId 背包记录 ID
   */
  async unequipItem(inventoryId: number): Promise<UserInventory> {
    try {
      return await this.updateById(inventoryId, { is_active: false } as Partial<UserInventory>);
    } catch (error) {
      logger.error('InventoryRepository.unequipItem 失败', { inventoryId, error: (error as Error).message });
      throw error;
    }
  }
}
