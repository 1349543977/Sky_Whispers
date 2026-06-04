import Router from '@koa/router';
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/user';
import islandRoutes from '@/routes/island';
import weatherRoutes from '@/routes/weather';
import plantRoutes from '@/routes/plant';
import spriteRoutes from '@/routes/sprite';
import socialRoutes from '@/routes/social';
import shopRoutes from '@/routes/shop';
import seasonPassRoutes from '@/routes/seasonPass';
import adRoutes from '@/routes/ad';
import stepRoutes from '@/routes/step';
import adminRoutes from '@/routes/admin';

const router = new Router();

/** 健康检查 */
router.get('/health', (ctx) => {
  ctx.body = {
    code: 0,
    message: 'ok',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  };
});

/** 挂载所有路由 */
router.use(authRoutes.routes(), authRoutes.allowedMethods());
router.use(userRoutes.routes(), userRoutes.allowedMethods());
router.use(islandRoutes.routes(), islandRoutes.allowedMethods());
router.use(weatherRoutes.routes(), weatherRoutes.allowedMethods());
router.use(plantRoutes.routes(), plantRoutes.allowedMethods());
router.use(spriteRoutes.routes(), spriteRoutes.allowedMethods());
router.use(socialRoutes.routes(), socialRoutes.allowedMethods());
router.use(shopRoutes.routes(), shopRoutes.allowedMethods());
router.use(seasonPassRoutes.routes(), seasonPassRoutes.allowedMethods());
router.use(adRoutes.routes(), adRoutes.allowedMethods());
router.use(stepRoutes.routes(), stepRoutes.allowedMethods());
router.use(adminRoutes.routes(), adminRoutes.allowedMethods());

export default router;
