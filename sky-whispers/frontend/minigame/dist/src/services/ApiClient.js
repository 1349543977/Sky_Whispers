"use strict";
// ============================================================
// ApiClient - HTTP client for backend API
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const constants_1 = require("../utils/constants");
class ApiClient {
    constructor(baseUrl, storageService) {
        this.baseUrl = baseUrl;
        this.storageService = storageService;
        this.retryCount = constants_1.API.RETRY_COUNT;
        this.retryDelay = constants_1.API.RETRY_DELAY;
    }
    async request(config) {
        const token = this.storageService.get('auth_token', '');
        const url = this.buildUrl(config.path, config.params);
        const headers = Object.assign({ 'Content-Type': 'application/json' }, config.headers);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        let lastError = null;
        for (let attempt = 0; attempt <= this.retryCount; attempt++) {
            try {
                const response = await this.wxRequest(url, {
                    method: config.method,
                    data: config.data,
                    headers,
                });
                return response;
            }
            catch (err) {
                lastError = err;
                if (attempt < this.retryCount) {
                    await this.delay(this.retryDelay * (attempt + 1));
                }
            }
        }
        throw lastError !== null && lastError !== void 0 ? lastError : new Error('Request failed after retries');
    }
    wxRequest(url, options) {
        return new Promise((resolve, reject) => {
            wx.request({
                url,
                method: options.method,
                data: options.data,
                header: options.headers,
                timeout: constants_1.API.TIMEOUT,
                success: (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(res.data);
                    }
                    else if (res.statusCode === 401) {
                        // Token expired, clear and reject
                        this.storageService.remove('auth_token');
                        reject(new Error('Unauthorized'));
                    }
                    else {
                        reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(res.data)}`));
                    }
                },
                fail: (err) => {
                    reject(new Error(err.errMsg));
                },
            });
        });
    }
    buildUrl(path, params) {
        let url = `${this.baseUrl}${path}`;
        if (params) {
            const query = Object.entries(params)
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
                .join('&');
            if (query)
                url += `?${query}`;
        }
        return url;
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    // ---- Auth ----
    async login(code) {
        return this.request({
            method: 'POST',
            path: '/api/v1/auth/login',
            data: { code },
        });
    }
    // ---- User ----
    async getUser() {
        return this.request({ method: 'GET', path: '/api/v1/user/profile' });
    }
    async updateUser(data) {
        return this.request({ method: 'PUT', path: '/api/v1/user/profile', data });
    }
    // ---- Island ----
    async getIsland() {
        return this.request({ method: 'GET', path: '/api/v1/island' });
    }
    async updateIsland(data) {
        return this.request({ method: 'PUT', path: '/api/v1/island', data });
    }
    async visitIsland(friendId) {
        return this.request({
            method: 'GET',
            path: `/api/v1/island/visit/${friendId}`,
        });
    }
    // ---- Plants ----
    async getPlants(params) {
        return this.request({ method: 'GET', path: '/api/v1/plants', params: params });
    }
    async plantSeed(data) {
        return this.request({ method: 'POST', path: '/api/v1/plants', data });
    }
    async waterPlant(plantId) {
        return this.request({ method: 'POST', path: `/api/v1/plants/${plantId}/water` });
    }
    async harvestPlant(plantId) {
        return this.request({ method: 'POST', path: `/api/v1/plants/${plantId}/harvest` });
    }
    async getPlantTypes(params) {
        return this.request({ method: 'GET', path: '/api/v1/plant-types', params });
    }
    // ---- Sprites ----
    async getSprites() {
        return this.request({ method: 'GET', path: '/api/v1/sprites' });
    }
    async catchSprite(data) {
        return this.request({ method: 'POST', path: '/api/v1/sprites/catch', data });
    }
    async feedSprite(spriteId) {
        return this.request({ method: 'POST', path: `/api/v1/sprites/${spriteId}/feed` });
    }
    async getSpriteTypes(params) {
        return this.request({ method: 'GET', path: '/api/v1/sprite-types', params });
    }
    // ---- Weather ----
    async getWeather(params) {
        return this.request({ method: 'GET', path: '/api/v1/weather', params: params });
    }
    // ---- Social ----
    async getFriends(params) {
        return this.request({ method: 'GET', path: '/api/v1/friends', params });
    }
    async sendGift(data) {
        return this.request({ method: 'POST', path: '/api/v1/gifts', data });
    }
    async getGifts(params) {
        return this.request({ method: 'GET', path: '/api/v1/gifts', params: params });
    }
    async claimGift(giftId) {
        return this.request({ method: 'POST', path: `/api/v1/gifts/${giftId}/claim` });
    }
    // ---- Shop ----
    async getShopItems(params) {
        return this.request({ method: 'GET', path: '/api/v1/shop', params: params });
    }
    async purchaseItem(data) {
        return this.request({ method: 'POST', path: '/api/v1/shop/purchase', data });
    }
    async getInventory(params) {
        return this.request({ method: 'GET', path: '/api/v1/inventory', params });
    }
    // ---- Season Pass ----
    async getSeasonPass() {
        return this.request({ method: 'GET', path: '/api/v1/season-pass' });
    }
    async getSeasonPassProgress() {
        return this.request({ method: 'GET', path: '/api/v1/season-pass/progress' });
    }
    async claimSeasonPassReward(data) {
        return this.request({ method: 'POST', path: '/api/v1/season-pass/claim', data });
    }
    // ---- Steps ----
    async syncSteps(data) {
        return this.request({ method: 'POST', path: '/api/v1/steps/sync', data });
    }
    // ---- Ads ----
    async reportAdWatch(data) {
        return this.request({ method: 'POST', path: '/api/v1/ads/watch', data });
    }
}
exports.ApiClient = ApiClient;
//# sourceMappingURL=ApiClient.js.map