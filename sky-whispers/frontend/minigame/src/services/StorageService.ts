// ============================================================
// StorageService - Local storage wrapper with type safety
// ============================================================

export class StorageService {
  private prefix: string;

  constructor(prefix: string = 'sky_whispers_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      wx.setStorageSync(this.getKey(key), serialized);
    } catch (err) {
      console.error(`[StorageService] Failed to set "${key}":`, err);
    }
  }

  get<T>(key: string, defaultValue: T): T {
    try {
      const raw = wx.getStorageSync(this.getKey(key));
      if (raw === '' || raw === undefined || raw === null) {
        return defaultValue;
      }
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[StorageService] Failed to get "${key}":`, err);
      return defaultValue;
    }
  }

  remove(key: string): void {
    try {
      wx.removeStorageSync(this.getKey(key));
    } catch (err) {
      console.error(`[StorageService] Failed to remove "${key}":`, err);
    }
  }

  has(key: string): boolean {
    try {
      const raw = wx.getStorageSync(this.getKey(key));
      return raw !== '' && raw !== undefined && raw !== null;
    } catch {
      return false;
    }
  }

  clear(): void {
    try {
      wx.clearStorageSync();
    } catch (err) {
      console.error('[StorageService] Failed to clear storage:', err);
    }
  }

  getAllKeys(): string[] {
    try {
      const info = wx.getStorageInfoSync();
      return info.keys
        .filter((k) => k.startsWith(this.prefix))
        .map((k) => k.substring(this.prefix.length));
    } catch {
      return [];
    }
  }

  getStorageSize(): number {
    try {
      const info = wx.getStorageInfoSync();
      return info.currentSize;
    } catch {
      return 0;
    }
  }
}
