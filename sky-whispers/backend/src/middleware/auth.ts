import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { AuthError } from '@/utils/errors';
import type { JwtPayload } from '@/types';

/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token，将用户信息附加到 ctx.state
 */
export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  try {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('缺少认证令牌');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    ctx.state.userId = decoded.userId;
    ctx.state.openid = decoded.openid;
    ctx.state.isAdmin = decoded.isAdmin;

    await next();
  } catch (error) {
    if (error instanceof AuthError) throw error;
    if (jwt.JsonWebTokenError.name === (error as Error).constructor.name) {
      throw new AuthError('认证令牌无效或已过期');
    }
    throw error;
  }
}

/**
 * 管理员权限中间件
 * 检查当前用户是否为管理员
 */
export async function adminMiddleware(ctx: Context, next: Next): Promise<void> {
  if (!ctx.state.isAdmin) {
    throw new AuthError('需要管理员权限');
  }
  await next();
}
