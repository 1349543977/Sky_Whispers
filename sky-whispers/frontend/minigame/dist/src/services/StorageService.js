"use strict";
// ============================================================
// StorageService - Local storage wrapper with type safety
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
class StorageService {
    constructor(prefix = 'sky_whispers_') {
        this.prefix = prefix;
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            wx.setStorageSync(this.getKey(key), serialized);
        }
        catch (err) {
            console.error(`[StorageService] Failed to set "${key}":`, err);
        }
    }
    get(key, defaultValue) {
        try {
            const raw = wx.getStorageSync(this.getKey(key));
            if (raw === '' || raw === undefined || raw === null) {
                return defaultValue;
            }
            return JSON.parse(raw);
        }
        catch (err) {
            console.error(`[StorageService] Failed to get "${key}":`, err);
            return defaultValue;
        }
    }
    remove(key) {
        try {
            wx.removeStorageSync(this.getKey(key));
        }
        catch (err) {
            console.error(`[StorageService] Failed to remove "${key}":`, err);
        }
    }
    has(key) {
        try {
            const raw = wx.getStorageSync(this.getKey(key));
            return raw !== '' && raw !== undefined && raw !== null;
        }
        catch (_a) {
            return false;
        }
    }
    clear() {
        try {
            wx.clearStorageSync();
        }
        catch (err) {
            console.error('[StorageService] Failed to clear storage:', err);
        }
    }
    getAllKeys() {
        try {
            const info = wx.getStorageInfoSync();
            return info.keys
                .filter((k) => k.startsWith(this.prefix))
                .map((k) => k.substring(this.prefix.length));
        }
        catch (_a) {
            return [];
        }
    }
    getStorageSize() {
        try {
            const info = wx.getStorageInfoSync();
            return info.currentSize;
        }
        catch (_a) {
            return 0;
        }
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=StorageService.js.map