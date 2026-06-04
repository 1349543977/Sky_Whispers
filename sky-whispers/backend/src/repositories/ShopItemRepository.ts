import { ShopItem } from '@/models/ShopItem';
import { BaseRepository } from '@/repositories/BaseRepository';
import { logger } from '@/utils/logger';
import { Op } from 'sequelize';

/**
 * 商店物品仓库 - 商店物品数据访问层
 */
export class ShopItemRepository extends BaseRepository<ShopItem> {
  constructor() {
    super(ShopItem);
  }

  /**
   * 查找当前可购买的物品
   * @returns 可购买的物品数组
   */
  async findAvailable(): Promise<ShopItem[]> {
    try {
      const now = new Date();
      return await this.findAll({
        where: {
          [Op.or]: [
            { available_from: null },
            { available_from: { [Op.lte]: now } as unknown as Date },
          ],
          [Op.and]: [
            {
              [Op.or]: [
                { available_until: null },
                { available_until: { [Op.gte]: now } as unknown as Date },
              ],
            },
          ],
        } as Record<string, unknown>,
        order: [['category', 'ASC'], ['price_coins', 'ASC']],
      });
    } catch (error) {
      logger.error('ShopItemRepository.findAvailable 失败', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 根据类别查找物品
   * @param category 物品类别
   * @returns 物品数组
   */
  async findByCategory(category: string): Promise<ShopItem[]> {
    try {
      return await this.findAll({
        where: { category } as Record<string, unknown>,
        order: [['price_coins', 'ASC']],
      });
    } catch (error) {
      logger.error('ShopItemRepository.findByCategory 失败', { category, error: (error as Error).message });
      throw error;
    }
  }
}
