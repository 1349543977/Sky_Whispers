import Router from '@koa/router';
import Joi from 'joi';
import { SeasonPassController } from '@/controllers/SeasonPassController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/season-pass' });
const seasonPassController = new SeasonPassController();

const claimRewardSchema = Joi.object({
  level: Joi.number().integer().min(1).required(),
});

router.get('/current', async (ctx) => {
  await seasonPassController.getCurrentSeason(ctx);
});

router.use(authMiddleware);

router.get('/:passId/progress', async (ctx) => {
  await seasonPassController.getProgress(ctx);
});

router.post('/:passId/upgrade', async (ctx) => {
  await seasonPassController.upgradeToPremium(ctx);
});

router.post('/:passId/claim', validate({ body: claimRewardSchema }), async (ctx) => {
  await seasonPassController.claimReward(ctx);
});

export default router;
