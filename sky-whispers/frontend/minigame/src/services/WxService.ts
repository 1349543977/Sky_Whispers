// ============================================================
// WxService - WeChat API wrapper
// ============================================================

export interface WxLocationResult {
  latitude: number;
  longitude: number;
  speed: number | null;
  accuracy: number | null;
}

export interface WxWeRunResult {
  encryptedData: string;
  iv: string;
}

export class WxService {
  private locationPermission: boolean = false;
  private weRunPermission: boolean = false;

  async login(): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code);
          } else {
            reject(new Error(`Login failed: ${res.errMsg}`));
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg));
        },
      });
    });
  }

  async getLocation(): Promise<WxLocationResult> {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.locationPermission = true;
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            speed: res.speed ?? null,
            accuracy: res.accuracy ?? null,
          });
        },
        fail: (err) => {
          this.locationPermission = false;
          reject(new Error(err.errMsg));
        },
      });
    });
  }

  async getWeRunData(): Promise<WxWeRunResult | null> {
    return new Promise((resolve, reject) => {
      wx.getWeRunData({
        success: (res) => {
          this.weRunPermission = true;
          resolve({
            encryptedData: res.encryptedData,
            iv: res.iv,
          });
        },
        fail: (err) => {
          this.weRunPermission = false;
          if (err.errMsg?.includes('auth deny')) {
            console.warn('[WxService] WeRun permission denied');
            resolve(null);
          } else {
            reject(new Error(err.errMsg));
          }
        },
      });
    });
  }

  showModal(options: {
    title: string;
    content: string;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      wx.showModal({
        title: options.title,
        content: options.content,
        showCancel: options.showCancel ?? true,
        confirmText: options.confirmText ?? '确定',
        cancelText: options.cancelText ?? '取消',
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        },
      });
    });
  }

  showToast(options: {
    title: string;
    icon?: 'success' | 'error' | 'none' | 'loading';
    duration?: number;
    mask?: boolean;
  }): void {
    wx.showToast({
      title: options.title,
      icon: options.icon ?? 'none',
      duration: options.duration ?? 1500,
      mask: options.mask ?? false,
    });
  }

  hideToast(): void {
    wx.hideToast();
  }

  showLoading(options: { title?: string; mask?: boolean }): void {
    wx.showLoading({
      title: options.title ?? '加载中...',
      mask: options.mask ?? true,
    });
  }

  hideLoading(): void {
    wx.hideLoading();
  }

  shareAppMessage(options: {
    title: string;
    path?: string;
    imageUrl?: string;
  }): void {
    wx.shareAppMessage({
      title: options.title,
      path: options.path ?? '/pages/index',
      imageUrl: options.imageUrl,
    });
  }

  onShareAppMessage(callback: () => {
    title: string;
    path?: string;
    imageUrl?: string;
  }): void {
    wx.onShareAppMessage(callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSystemInfo(): any {
    return wx.getSystemInfoSync();
  }

  getScreenWidth(): number {
    return wx.getSystemInfoSync().windowWidth;
  }

  getScreenHeight(): number {
    return wx.getSystemInfoSync().windowHeight;
  }

  getPixelRatio(): number {
    return wx.getSystemInfoSync().pixelRatio;
  }

  vibrateShort(): void {
    try {
      wx.vibrateShort({ type: 'light' });
    } catch {
      // Ignore if not supported
    }
  }

  vibrateLong(): void {
    try {
      wx.vibrateLong();
    } catch {
      // Ignore if not supported
    }
  }

  hasLocationPermission(): boolean {
    return this.locationPermission;
  }

  hasWeRunPermission(): boolean {
    return this.weRunPermission;
  }
}
