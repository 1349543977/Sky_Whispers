// ============================================================
// ApiClient - HTTP client for backend API
// ============================================================

import {
  ApiResponse,
  PaginatedResponse,
  User,
  Island,
  Plant,
  PlantType,
  WeatherSprite,
  SpriteType,
  Friendship,
  Gift,
  ShopItem,
  UserInventory,
  SeasonPass,
  SeasonPassProgress,
  StepRecord,
  WeatherData,
  GiftType,
} from '../types';
import { API } from '../utils/constants';
import { StorageService } from './StorageService';

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  data?: Record<string, unknown>;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private storageService: StorageService;
  private retryCount: number;
  private retryDelay: number;

  constructor(baseUrl: string, storageService: StorageService) {
    this.baseUrl = baseUrl;
    this.storageService = storageService;
    this.retryCount = API.RETRY_COUNT;
    this.retryDelay = API.RETRY_DELAY;
  }

  private async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const token = this.storageService.get<string>('auth_token', '');
    const url = this.buildUrl(config.path, config.params);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        const response = await this.wxRequest<T>(url, {
          method: config.method,
          data: config.data,
          headers,
        });
        return response;
      } catch (err) {
        lastError = err as Error;
        if (attempt < this.retryCount) {
          await this.delay(this.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }

  private wxRequest<T>(
    url: string,
    options: {
      method: string;
      data?: Record<string, unknown>;
      headers: Record<string, string>;
    },
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: options.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
        data: options.data,
        header: options.headers,
        timeout: API.TIMEOUT,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data as ApiResponse<T>);
          } else if (res.statusCode === 401) {
            // Token expired, clear and reject
            this.storageService.remove('auth_token');
            reject(new Error('Unauthorized'));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(res.data)}`));
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg));
        },
      });
    });
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const query = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      if (query) url += `?${query}`;
    }
    return url;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ---- Auth ----

  async login(code: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request({
      method: 'POST',
      path: '/api/v1/auth/login',
      data: { code },
    });
  }

  // ---- User ----

  async getUser(): Promise<ApiResponse<User>> {
    return this.request({ method: 'GET', path: '/api/v1/user/profile' });
  }

  async updateUser(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request({ method: 'PUT', path: '/api/v1/user/profile', data });
  }

  // ---- Island ----

  async getIsland(): Promise<ApiResponse<Island>> {
    return this.request({ method: 'GET', path: '/api/v1/island' });
  }

  async updateIsland(data: Partial<Island>): Promise<ApiResponse<Island>> {
    return this.request({ method: 'PUT', path: '/api/v1/island', data });
  }

  async visitIsland(friendId: string): Promise<ApiResponse<{ island: Island; owner: User }>> {
    return this.request({
      method: 'GET',
      path: `/api/v1/island/visit/${friendId}`,
    });
  }

  // ---- Plants ----

  async getPlants(params?: { island_id?: string }): Promise<ApiResponse<Plant[]>> {
    return this.request({ method: 'GET', path: '/api/v1/plants', params: params as Record<string, string> });
  }

  async plantSeed(data: { plant_type_id: string; slot_index: number }): Promise<ApiResponse<Plant>> {
    return this.request({ method: 'POST', path: '/api/v1/plants', data });
  }

  async waterPlant(plantId: string): Promise<ApiResponse<Plant>> {
    return this.request({ method: 'POST', path: `/api/v1/plants/${plantId}/water` });
  }

  async harvestPlant(plantId: string): Promise<ApiResponse<{ plant: Plant; coins_earned: number }>> {
    return this.request({ method: 'POST', path: `/api/v1/plants/${plantId}/harvest` });
  }

  async getPlantTypes(params?: { page?: number; page_size?: number }): Promise<ApiResponse<PaginatedResponse<PlantType>>> {
    return this.request({ method: 'GET', path: '/api/v1/plant-types', params });
  }

  // ---- Sprites ----

  async getSprites(): Promise<ApiResponse<WeatherSprite[]>> {
    return this.request({ method: 'GET', path: '/api/v1/sprites' });
  }

  async catchSprite(data: { sprite_type_id: string }): Promise<ApiResponse<WeatherSprite>> {
    return this.request({ method: 'POST', path: '/api/v1/sprites/catch', data });
  }

  async feedSprite(spriteId: string): Promise<ApiResponse<WeatherSprite>> {
    return this.request({ method: 'POST', path: `/api/v1/sprites/${spriteId}/feed` });
  }

  async getSpriteTypes(params?: { page?: number; page_size?: number }): Promise<ApiResponse<PaginatedResponse<SpriteType>>> {
    return this.request({ method: 'GET', path: '/api/v1/sprite-types', params });
  }

  // ---- Weather ----

  async getWeather(params?: { latitude?: number; longitude?: number }): Promise<ApiResponse<WeatherData>> {
    return this.request({ method: 'GET', path: '/api/v1/weather', params: params as Record<string, string | number> });
  }

  // ---- Social ----

  async getFriends(params?: { page?: number; page_size?: number }): Promise<ApiResponse<PaginatedResponse<Friendship>>> {
    return this.request({ method: 'GET', path: '/api/v1/friends', params });
  }

  async sendGift(data: { receiver_id: string; gift_type: GiftType; message: string }): Promise<ApiResponse<Gift>> {
    return this.request({ method: 'POST', path: '/api/v1/gifts', data });
  }

  async getGifts(params?: { status?: string }): Promise<ApiResponse<PaginatedResponse<Gift>>> {
    return this.request({ method: 'GET', path: '/api/v1/gifts', params: params as Record<string, string> });
  }

  async claimGift(giftId: string): Promise<ApiResponse<Gift>> {
    return this.request({ method: 'POST', path: `/api/v1/gifts/${giftId}/claim` });
  }

  // ---- Shop ----

  async getShopItems(params?: { item_type?: string; page?: number; page_size?: number }): Promise<ApiResponse<PaginatedResponse<ShopItem>>> {
    return this.request({ method: 'GET', path: '/api/v1/shop', params: params as Record<string, string | number> });
  }

  async purchaseItem(data: { item_id: string; quantity: number }): Promise<ApiResponse<UserInventory>> {
    return this.request({ method: 'POST', path: '/api/v1/shop/purchase', data });
  }

  async getInventory(params?: { page?: number; page_size?: number }): Promise<ApiResponse<PaginatedResponse<UserInventory>>> {
    return this.request({ method: 'GET', path: '/api/v1/inventory', params });
  }

  // ---- Season Pass ----

  async getSeasonPass(): Promise<ApiResponse<SeasonPass>> {
    return this.request({ method: 'GET', path: '/api/v1/season-pass' });
  }

  async getSeasonPassProgress(): Promise<ApiResponse<SeasonPassProgress>> {
    return this.request({ method: 'GET', path: '/api/v1/season-pass/progress' });
  }

  async claimSeasonPassReward(data: { level: number; is_premium: boolean }): Promise<ApiResponse<UserInventory>> {
    return this.request({ method: 'POST', path: '/api/v1/season-pass/claim', data });
  }

  // ---- Steps ----

  async syncSteps(data: { encrypted_data: string; iv: string }): Promise<ApiResponse<StepRecord>> {
    return this.request({ method: 'POST', path: '/api/v1/steps/sync', data });
  }

  // ---- Ads ----

  async reportAdWatch(data: { ad_type: string; reward_type: string }): Promise<ApiResponse<{ reward_amount: number }>> {
    return this.request({ method: 'POST', path: '/api/v1/ads/watch', data });
  }
}
