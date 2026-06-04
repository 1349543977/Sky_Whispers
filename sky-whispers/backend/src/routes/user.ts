import Router from '@koa/router';
import Joi from 'joi';
import { UserController } from '@/controllers/UserController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/user' });
const userController = new UserController();

const updateProfileSchema = Joi.object({
  nickname: Joi.string().max(50).optional(),
  avatarUrl: Joi.string().max(512).optional(),
});

const updateLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  cityCode: Joi.string().max(20).optional(),
});

const submitStepsSchema = Joi.object({
  steps: Joi.number().integer().min(0).max(100000).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     tags: [用户]
 *     summary: 获取用户资料
 *     security:
 *       - BearerAuth: []
 */
router.get('/profile', async (ctx) => {
  await userController.getProfile(ctx);
});

/**
 * @swagger
 * /api/v1/user/profile:
 *   put:
 *     tags: [用户]
 *     summary: 更新用户资料
 *     security:
 *       - BearerAuth: []
 */
router.put('/profile', validate({ body: updateProfileSchema }), async (ctx) => {
  await userController.updateProfile(ctx);
});

/**
 * @swagger
 * /api/v1/user/location:
 *   put:
 *     tags: [用户]
 *     summary: 更新用户位置
 *     security:
 *       - BearerAuth: []
 */
router.put('/location', validate({ body: updateLocationSchema }), async (ctx) => {
  await userController.updateLocation(ctx);
});

/**
 * @swagger
 * /api/v1/user/steps:
 *   post:
 *     tags: [用户]
 *     summary: 提交步数
 *     security:
 *       - BearerAuth: []
 */
router.post('/steps', validate({ body: submitStepsSchema }), async (ctx) => {
  await userController.submitSteps(ctx);
});

export default router;
