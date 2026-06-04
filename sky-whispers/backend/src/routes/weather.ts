import Router from '@koa/router';
import Joi from 'joi';
import { WeatherController } from '@/controllers/WeatherController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/weather' });
const weatherController = new WeatherController();

const weatherQuerySchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

router.get('/current', validate({ query: weatherQuerySchema }), async (ctx) => {
  await weatherController.getCurrentWeather(ctx);
});

router.get('/forecast', validate({ query: weatherQuerySchema }), async (ctx) => {
  await weatherController.getForecast(ctx);
});

router.use(authMiddleware);

router.post('/sync', async (ctx) => {
  await weatherController.syncWeather(ctx);
});

export default router;
