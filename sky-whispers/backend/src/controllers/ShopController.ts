import { Context } from 'koa';
import { ShopService } from '@/services/ShopService';
import type { ApiResponse } from '@/types';

const shopService = new ShopService();

/**
 * 商店控制器
 */
export class ShopController {
  /**
   * 获取商店物品列表
   * @route GET /api/v1/shop/items
   */
  async getItems(ctx: Context): Promise<void> {
    const { category } = ctx.query as { category?: string };

    const result = await shopService.getItems(category);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 购买物品
   * @route POST /api/v1/shop/purchase
   */
  async purchaseItem(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { itemId, quantity } = ctx.request.body as { itemId: number; quantity?: number };

    const result = await shopService.purchaseItem(userId, itemId, quantity);

    ctx.body = {
      code: 0,
      message: '购买成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 获取用户背包
   * @route GET /api/v1/shop/inventory
   */
  async getInventory(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await shopService.getInventory(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 装备物品
   * @route POST /api/v1/shop/equip
   */
  async equipItem(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { inventoryId } = ctx.request.body as { inventoryId: number };

    const result = await shopService.equipItem(userId, inventoryId);

    ctx.body = {
      code: 0,
      message: '装备成功',
      data: result,
    } satisfies ApiResponse;
  }
}
