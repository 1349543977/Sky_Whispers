import Router from '@koa/router';
import Joi from 'joi';
import { ShopController } from '@/controllers/ShopController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/shop' });
const shopController = new ShopController();

const purchaseSchema = Joi.object({
  itemId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).max(99).optional(),
});

const equipSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
});

router.get('/items', async (ctx) => {
  await shopController.getItems(ctx);
});

router.use(authMiddleware);

router.post('/purchase', validate({ body: purchaseSchema }), async (ctx) => {
  await shopController.purchaseItem(ctx);
});

router.get('/inventory', async (ctx) => {
  await shopController.getInventory(ctx);
});

router.post('/equip', validate({ body: equipSchema }), async (ctx) => {
  await shopController.equipItem(ctx);
});

export default router;
