import Router from '@koa/router';
import Joi from 'joi';
import { IslandController } from '@/controllers/IslandController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/island' });
const islandController = new IslandController();

const visitSchema = Joi.object({
  interactionType: Joi.string().valid('water', 'breeze', 'gift', 'view').required(),
});

const changeSkinSchema = Joi.object({
  skinId: Joi.number().integer().positive().required(),
});

const updateWeatherSchema = Joi.object({
  weatherType: Joi.string().valid('sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'windy').required(),
  lightLevel: Joi.number().integer().min(0).max(100).required(),
  moistureLevel: Joi.number().integer().min(0).max(100).required(),
});

router.use(authMiddleware);

router.get('/', async (ctx) => {
  await islandController.getIsland(ctx);
});

router.post('/:id/visit', validate({ body: visitSchema }), async (ctx) => {
  await islandController.visitIsland(ctx);
});

router.put('/skin', validate({ body: changeSkinSchema }), async (ctx) => {
  await islandController.changeSkin(ctx);
});

router.post('/expand', async (ctx) => {
  await islandController.expandIsland(ctx);
});

router.put('/weather', validate({ body: updateWeatherSchema }), async (ctx) => {
  await islandController.updateWeatherEffects(ctx);
});

export default router;
