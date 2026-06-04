import { Context } from 'koa';
import { PlantService } from '@/services/PlantService';
import { IslandRepository } from '@/repositories/IslandRepository';
import type { ApiResponse } from '@/types';

const plantService = new PlantService();
const islandRepo = new IslandRepository();

/**
 * 植物控制器
 */
export class PlantController {
  /**
   * 获取岛屿植物列表
   * @route GET /api/v1/plants/:islandId
   */
  async getIslandPlants(ctx: Context): Promise<void> {
    const islandId = Number(ctx.params.islandId);

    const result = await plantService.getIslandPlants(islandId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 种植种子
   * @route POST /api/v1/plants/plant
   */
  async plantSeed(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { plantTypeId } = ctx.request.body as { plantTypeId: number };

    const island = await islandRepo.findByUserId(userId);
    if (!island) {
      ctx.body = { code: 404, message: '岛屿不存在', data: null } satisfies ApiResponse;
      return;
    }

    const result = await plantService.plantSeed(island.id, plantTypeId);

    ctx.body = {
      code: 0,
      message: '种植成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 浇水
   * @route POST /api/v1/plants/:id/water
   */
  async waterPlant(ctx: Context): Promise<void> {
    const plantId = Number(ctx.params.id);

    const result = await plantService.waterPlant(plantId);

    ctx.body = {
      code: 0,
      message: '浇水成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 收获植物
   * @route POST /api/v1/plants/:id/harvest
   */
  async harvestPlant(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const plantId = Number(ctx.params.id);

    const result = await plantService.harvestPlant(plantId, userId);

    ctx.body = {
      code: 0,
      message: '收获成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 计算植物生长
   * @route POST /api/v1/plants/calculate-growth
   */
  async calculateGrowth(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const island = await islandRepo.findByUserId(userId);
    if (!island) {
      ctx.body = { code: 404, message: '岛屿不存在', data: null } satisfies ApiResponse;
      return;
    }

    const result = await plantService.calculateGrowth(island.id);

    ctx.body = {
      code: 0,
      message: '计算完成',
      data: result,
    } satisfies ApiResponse;
  }
}
