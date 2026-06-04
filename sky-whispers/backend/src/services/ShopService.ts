import { ShopItemRepository } from '@/repositories/ShopItemRepository';
import { InventoryRepository } from '@/repositories/InventoryRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { logger } from '@/utils/logger';
import { NotFoundError, ValidationError } from '@/utils/errors';

const shopItemRepo = new ShopItemRepository();
const inventoryRepo = new InventoryRepository();
const userRepo = new UserRepository();

/**
 * 商店服务 - 处理商店购买、背包管理业务逻辑
 */
export class ShopService {
  /**
   * 获取可购买的物品列表
   * @param category 可选类别筛选
   * @returns 物品列表
   */
  async getItems(category?: string) {
    try {
      if (category) {
        return await shopItemRepo.findByCategory(category);
      }
      return await shopItemRepo.findAvailable();
    } catch (error) {
      logger.error('ShopService.getItems 失败', { category, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 购买物品
   * @param userId 用户 ID
   * @param itemId 物品 ID
   * @param quantity 购买数量
   * @returns 购买结果
   */
  async purchaseItem(userId: number, itemId: number, quantity: number = 1) {
    try {
      const item = await shopItemRepo.findByIdOrFail(itemId);
      const itemData = item as unknown as Record<string, unknown>;

      const now = new Date();
      if (itemData.available_from && new Date(String(itemData.available_from)) > now) {
        throw new ValidationError('该物品尚未上架');
      }
      if (itemData.available_until && new Date(String(itemData.available_until)) < now) {
        throw new ValidationError('该物品已下架');
      }

      const totalCost = Number(itemData.price_coins) * quantity;
      const user = await userRepo.findByIdOrFail(userId);

      if (user.coins < totalCost) {
        throw new ValidationError('金币不足');
      }

      await userRepo.deductCoins(userId, totalCost);
      await inventoryRepo.addItem(userId, itemId, quantity);

      logger.info('物品购买', { userId, itemId, quantity, totalCost });

      return {
        itemId,
        quantity,
        totalCost,
        remainingCoins: user.coins - totalCost,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('ShopService.purchaseItem 失败', { userId, itemId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 获取用户背包
   * @param userId 用户 ID
   * @returns 背包物品列表
   */
  async getInventory(userId: number) {
    try {
      const items = await inventoryRepo.findByUserId(userId);
      return items.map((inv) => ({
        id: inv.id,
        itemId: inv.item_id,
        quantity: inv.quantity,
        isActive: inv.is_active,
        acquiredAt: inv.acquired_at,
        item: inv.get('item') ? {
          name: (inv.get('item') as Record<string, unknown>).name,
          category: (inv.get('item') as Record<string, unknown>).category,
          itemData: (inv.get('item') as Record<string, unknown>).item_data,
        } : null,
      }));
    } catch (error) {
      logger.error('ShopService.getInventory 失败', { userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * 装备物品
   * @param userId 用户 ID
   * @param inventoryId 背包记录 ID
   */
  async equipItem(userId: number, inventoryId: number) {
    try {
      const inventory = await inventoryRepo.findByIdOrFail(inventoryId);
      if (inventory.user_id !== userId) {
        throw new ValidationError('无权操作此物品');
      }

      await inventoryRepo.equipItem(inventoryId);
      logger.info('物品装备', { userId, inventoryId });
      return { inventoryId, isActive: true };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) throw error;
      logger.error('ShopService.equipItem 失败', { userId, inventoryId, error: (error as Error).message });
      throw error;
    }
  }
}
