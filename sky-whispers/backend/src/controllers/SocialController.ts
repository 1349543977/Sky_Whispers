import { Context } from 'koa';
import { SocialService } from '@/services/SocialService';
import type { ApiResponse } from '@/types';

const socialService = new SocialService();

/**
 * 社交控制器
 */
export class SocialController {
  /**
   * 获取好友列表
   * @route GET /api/v1/social/friends
   */
  async getFriends(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await socialService.getFriends(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 发送好友请求
   * @route POST /api/v1/social/friend-request
   */
  async sendRequest(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { friendId } = ctx.request.body as { friendId: number };

    const result = await socialService.sendRequest(userId, friendId);

    ctx.body = {
      code: 0,
      message: '请求已发送',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 接受好友请求
   * @route POST /api/v1/social/friend-request/:id/accept
   */
  async acceptRequest(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const friendshipId = Number(ctx.params.id);

    const result = await socialService.acceptRequest(friendshipId, userId);

    ctx.body = {
      code: 0,
      message: '已接受好友请求',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 获取待处理的好友请求
   * @route GET /api/v1/social/friend-requests/pending
   */
  async getPendingRequests(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await socialService.getPendingRequests(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 发送礼物
   * @route POST /api/v1/social/gifts/send
   */
  async sendGift(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const { receiverId, giftType, giftData, message } = ctx.request.body as {
      receiverId: number;
      giftType: string;
      giftData?: Record<string, unknown>;
      message?: string;
    };

    const result = await socialService.sendGift(userId, receiverId, giftType, giftData, message);

    ctx.body = {
      code: 0,
      message: '礼物已发送',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 领取礼物
   * @route POST /api/v1/social/gifts/:id/claim
   */
  async claimGift(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;
    const giftId = Number(ctx.params.id);

    const result = await socialService.claimGift(giftId, userId);

    ctx.body = {
      code: 0,
      message: '礼物已领取',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 获取收到的礼物
   * @route GET /api/v1/social/gifts/received
   */
  async getReceivedGifts(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await socialService.getReceivedGifts(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }

  /**
   * 获取未领取的礼物
   * @route GET /api/v1/social/gifts/unclaimed
   */
  async getUnclaimedGifts(ctx: Context): Promise<void> {
    const userId = ctx.state.userId as number;

    const result = await socialService.getUnclaimedGifts(userId);

    ctx.body = {
      code: 0,
      message: '获取成功',
      data: result,
    } satisfies ApiResponse;
  }
}
