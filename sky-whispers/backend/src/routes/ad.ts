import Router from '@koa/router';
import Joi from 'joi';
import { AdController } from '@/controllers/AdController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/ads' });
const adController = new AdController();

const watchSchema = Joi.object({
  adType: Joi.string().valid('meteor_shower', 'weather_boost', 'daily_bonus').required(),
});

router.use(authMiddleware);

router.post('/watch', validate({ body: watchSchema }), async (ctx) => {
  await adController.recordWatch(ctx);
});

router.get('/available', async (ctx) => {
  await adController.getAvailable(ctx);
});

export default router;
