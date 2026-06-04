/** API 统一响应格式 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分页请求参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** 分页响应数据 */
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** JWT Token 载荷 */
export interface JwtPayload {
  userId: number;
  openid: string;
  isAdmin?: boolean;
}

/** 登录请求 */
export interface LoginRequest {
  code: string;
}

/** 登录响应 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
}

/** 用户信息 */
export interface UserInfo {
  id: number;
  nickname: string;
  avatarUrl: string;
  level: number;
  coins: number;
  windPower: number;
}

/** 微信 code2session 响应 */
export interface WechatSessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

/** 微信 access_token 响应 */
export interface WechatAccessTokenResponse {
  access_token: string;
  expires_in: number;
  errcode?: number;
  errmsg?: string;
}

/** 天气 API 响应 */
export interface WeatherApiResponse {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: { temp: number; humidity: number; temp_min: number; temp_max: number };
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  name: string;
}

/** 天气预报 API 响应 */
export interface WeatherForecastResponse {
  list: Array<{
    dt: number;
    main: { temp: number; humidity: number };
    weather: Array<{ id: number; main: string; description: string }>;
    wind: { speed: number };
  }>;
}

/** 游戏内天气类型 */
export type GameWeatherType =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy'
  | 'windy';

/** 植物稀有度 */
export type PlantRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/** 精灵稀有度 */
export type SpriteRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/** 好友关系状态 */
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

/** 礼物类型 */
export type GiftType = 'rain_cloud' | 'breeze' | 'plant_seed' | 'sprite_food';

/** 岛屿访问交互类型 */
export type VisitInteractionType = 'water' | 'breeze' | 'gift' | 'view';

/** 商店物品类别 */
export type ShopCategory = 'skin' | 'effect' | 'prop' | 'pass';

/** 广告交互类型 */
export type AdType = 'meteor_shower' | 'weather_boost' | 'daily_bonus';

/** 季节类型 */
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

/** 植物生长阶段 0-3 */
export type GrowthStage = 0 | 1 | 2 | 3;

/** Koa 上下文扩展状态 */
export interface AppState {
  userId?: number;
  openid?: string;
  isAdmin?: boolean;
}

/** 步数提交请求 */
export interface SubmitStepsRequest {
  steps: number;
  date: string;
}

/** 种植请求 */
export interface PlantSeedRequest {
  plantTypeId: number;
  slotIndex: number;
}

/** 赠送礼物请求 */
export interface SendGiftRequest {
  receiverId: number;
  giftType: GiftType;
  giftData?: Record<string, unknown>;
  message?: string;
}

/** 购买请求 */
export interface PurchaseRequest {
  itemId: number;
  quantity?: number;
}

/** 广告观看请求 */
export interface AdWatchRequest {
  adType: AdType;
}

/** 好友请求 */
export interface FriendRequest {
  friendId: number;
}

/** 季票升级请求 */
export interface SeasonPassUpgradeRequest {
  passId: number;
}
