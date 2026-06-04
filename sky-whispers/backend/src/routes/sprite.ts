import Router from '@koa/router';
import Joi from 'joi';
import { SpriteController } from '@/controllers/SpriteController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/sprites' });
const spriteController = new SpriteController();

const catchSchema = Joi.object({
  spriteTypeId: Joi.number().integer().positive().required(),
  currentWeather: Joi.string().valid('sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'windy').required(),
});

router.use(authMiddleware);

router.get('/collection', async (ctx) => {
  await spriteController.getCollection(ctx);
});

router.post('/catch', validate({ body: catchSchema }), async (ctx) => {
  await spriteController.attemptCatch(ctx);
});

router.post('/:id/feed', async (ctx) => {
  await spriteController.feedSprite(ctx);
});

router.get('/codex', async (ctx) => {
  await spriteController.getCodex(ctx);
});

export default router;
