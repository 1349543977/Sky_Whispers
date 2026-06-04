import jwt from 'jsonwebtoken';
import { UserRepository } from '@/repositories/UserRepository';
import { IslandRepository } from '@/repositories/IslandRepository';
import { code2Session } from '@/utils/wechat';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { AuthError } from '@/utils/errors';
import type { JwtPayload, LoginResponse } from '@/types';

const userRepo = new UserRepository();
const islandRepo = new IslandRepository();

/**
 * 认证服务 - 处理微信登录和 JWT 令牌
 */
export class AuthService {
  /**
   * 微信小程序登录
   * @param code 微信登录凭证
   * @returns 登录响应（含 token 和用户信息）
   */
  async login(code: string): Promise<LoginResponse> {
    try {
      const wechatSession = await code2Session(code);

      if (!wechatSession.openid) {
        throw new AuthError('微信登录失败：无法获取 openid');
      }

      let user = await userRepo.findByOpenid(wechatSession.openid);
      let isNewUser = false;

      if (!user) {
        user = await userRepo.create({
          openid: wechatSession.openid,
          unionid: wechatSession.unionid || null,
          nickname: '旅行者',
          avatar_url: '',
          level: 1,
          exp: 0,
          coins: 0,
          wind_power: 0,
          total_steps: 0,
        } as Record<string, unknown>);

        await islandRepo.create({
          user_id: user.id,
          name: '我的浮岛',
          skin_id: 1,
          level: 1,
          expansion_slots: 6,
          weather_type: 'sunny',
          light_level: 50,
          moisture_level: 50,
          windmill_level: 1,
          auto_collect: false,
        } as Record<string, unknown>);

        isNewUser = true;
        logger.info('新用户注册', { userId: user.id, openid: wechatSession.openid });
      }

      await userRepo.updateLastLogin(user.id);

      const payload: JwtPayload = {
        userId: user.id,
        openid: user.openid,
      };

      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      const refreshToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.refreshExpiresIn,
      });

      logger.info('用户登录成功', { userId: user.id, isNewUser });

      return {
        accessToken,
        refreshToken,
        userInfo: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          level: user.level,
          coins: user.coins,
          windPower: user.wind_power,
        },
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      logger.error('AuthService.login 失败', { code, error: (error as Error).message });
      throw new AuthError('登录失败，请重试');
    }
  }

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as JwtPayload;
      const payload: JwtPayload = {
        userId: decoded.userId,
        openid: decoded.openid,
      };

      const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      return { accessToken };
    } catch (error) {
      logger.error('AuthService.refresh 失败', { error: (error as Error).message });
      throw new AuthError('刷新令牌无效或已过期');
    }
  }
}
