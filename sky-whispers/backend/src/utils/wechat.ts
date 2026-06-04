import axios from 'axios';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import type { WechatSessionResponse, WechatAccessTokenResponse } from '@/types';

const WECHAT_API_BASE = 'https://api.weixin.qq.com';

/** access_token 缓存 */
let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * 微信小程序 code2session 接口
 * @param code 微信登录凭证
 * @returns 微信会话信息
 */
export async function code2Session(code: string): Promise<WechatSessionResponse> {
  try {
    const response = await axios.get<WechatSessionResponse>(
      `${WECHAT_API_BASE}/sns/jscode2session`,
      {
        params: {
          appid: config.wechat.appId,
          secret: config.wechat.appSecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
        timeout: 10000,
      },
    );

    const data = response.data;

    if (data.errcode) {
      logger.error('微信 code2session 失败', { errcode: data.errcode, errmsg: data.errmsg });
      throw new Error(`微信登录失败: ${data.errmsg}`);
    }

    logger.info('微信 code2session 成功', { openid: data.openid });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('微信 code2session 网络错误', { message: error.message });
      throw new Error('微信服务连接失败');
    }
    throw error;
  }
}

/**
 * 获取微信 access_token（带缓存）
 * @returns access_token
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && now < tokenExpiresAt) {
    return cachedAccessToken;
  }

  try {
    const response = await axios.get<WechatAccessTokenResponse>(
      `${WECHAT_API_BASE}/cgi-bin/token`,
      {
        params: {
          grant_type: 'client_credential',
          appid: config.wechat.appId,
          secret: config.wechat.appSecret,
        },
        timeout: 10000,
      },
    );

    const data = response.data;

    if (data.errcode) {
      logger.error('获取微信 access_token 失败', { errcode: data.errcode, errmsg: data.errmsg });
      throw new Error(`获取 access_token 失败: ${data.errmsg}`);
    }

    cachedAccessToken = data.access_token;
    tokenExpiresAt = now + (data.expires_in - 300) * 1000;

    logger.info('获取微信 access_token 成功');
    return data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('获取微信 access_token 网络错误', { message: error.message });
      throw new Error('微信服务连接失败');
    }
    throw error;
  }
}
