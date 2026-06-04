import Router from '@koa/router';
import Joi from 'joi';
import { SocialController } from '@/controllers/SocialController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/social' });
const socialController = new SocialController();

const friendRequestSchema = Joi.object({
  friendId: Joi.number().integer().positive().required(),
});

const sendGiftSchema = Joi.object({
  receiverId: Joi.number().integer().positive().required(),
  giftType: Joi.string().valid('rain_cloud', 'breeze', 'plant_seed', 'sprite_food').required(),
  giftData: Joi.object().optional(),
  message: Joi.string().max(200).optional(),
});

router.use(authMiddleware);

router.get('/friends', async (ctx) => {
  await socialController.getFriends(ctx);
});

router.post('/friend-request', validate({ body: friendRequestSchema }), async (ctx) => {
  await socialController.sendRequest(ctx);
});

router.post('/friend-request/:id/accept', async (ctx) => {
  await socialController.acceptRequest(ctx);
});

router.get('/friend-requests/pending', async (ctx) => {
  await socialController.getPendingRequests(ctx);
});

router.post('/gifts/send', validate({ body: sendGiftSchema }), async (ctx) => {
  await socialController.sendGift(ctx);
});

router.post('/gifts/:id/claim', async (ctx) => {
  await socialController.claimGift(ctx);
});

router.get('/gifts/received', async (ctx) => {
  await socialController.getReceivedGifts(ctx);
});

router.get('/gifts/unclaimed', async (ctx) => {
  await socialController.getUnclaimedGifts(ctx);
});

export default router;
