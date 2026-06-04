import Router from '@koa/router';
import Joi from 'joi';
import { AuthController } from '@/controllers/AuthController';
import { authMiddleware } from '@/middleware/auth';
import { validate } from '@/middleware/validator';

const router = new Router({ prefix: '/api/v1/auth' });
const authController = new AuthController();

/** 登录验证 schema */
const loginSchema = Joi.object({
  code: Joi.string().required().messages({
    'any.required': '微信登录凭证不能为空',
  }),
});

/** 刷新令牌验证 schema */
const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': '刷新令牌不能为空',
  }),
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [认证]
 *     summary: 微信小程序登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 description: 微信登录凭证
 *     responses:
 *       200:
 *         description: 登录成功
 */
router.post('/login', validate({ body: loginSchema }), async (ctx) => {
  await authController.login(ctx);
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [认证]
 *     summary: 刷新访问令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 刷新成功
 */
router.post('/refresh', validate({ body: refreshSchema }), async (ctx) => {
  await authController.refresh(ctx);
});

export default router;
