import Router from '@koa/router';
import Joi from 'joi';
import { StepController } from '@/controllers/StepController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/steps' });
const stepController = new StepController();

const submitStepsSchema = Joi.object({
  steps: Joi.number().integer().min(0).max(100000).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});

router.use(authMiddleware);

router.post('/submit', validate({ body: submitStepsSchema }), async (ctx) => {
  await stepController.submitSteps(ctx);
});

router.get('/history', async (ctx) => {
  await stepController.getStepHistory(ctx);
});

export default router;
