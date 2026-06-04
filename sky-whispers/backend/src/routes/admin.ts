import Router from '@koa/router';
import { AdminController } from '@/controllers/AdminController';
import { authMiddleware, adminMiddleware } from '@/middleware/auth';

const router = new Router({ prefix: '/api/v1/admin' });
const adminController = new AdminController();

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', async (ctx) => {
  await adminController.getDashboard(ctx);
});

router.get('/users', async (ctx) => {
  await adminController.getUsers(ctx);
});

router.get('/users/:id', async (ctx) => {
  await adminController.getUserDetail(ctx);
});

export default router;
