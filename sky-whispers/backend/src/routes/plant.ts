import Router from '@koa/router';
import Joi from 'joi';
import { PlantController } from '@/controllers/PlantController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/plants' });
const plantController = new PlantController();

const plantSeedSchema = Joi.object({
  plantTypeId: Joi.number().integer().positive().required(),
});

router.use(authMiddleware);

router.get('/:islandId', async (ctx) => {
  await plantController.getIslandPlants(ctx);
});

router.post('/plant', validate({ body: plantSeedSchema }), async (ctx) => {
  await plantController.plantSeed(ctx);
});

router.post('/:id/water', async (ctx) => {
  await plantController.waterPlant(ctx);
});

router.post('/:id/harvest', async (ctx) => {
  await plantController.harvestPlant(ctx);
});

router.post('/calculate-growth', async (ctx) => {
  await plantController.calculateGrowth(ctx);
});

export default router;
