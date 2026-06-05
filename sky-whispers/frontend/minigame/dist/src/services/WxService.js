"use strict";
// ============================================================
// WxService - WeChat API wrapper
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.WxService = void 0;
class WxService {
    constructor() {
        this.locationPermission = false;
        this.weRunPermission = false;
    }
    async login() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    if (res.code) {
                        resolve(res.code);
                    }
                    else {
                        reject(new Error(`Login failed: ${res.errMsg}`));
                    }
                },
                fail: (err) => {
                    reject(new Error(err.errMsg));
                },
            });
        });
    }
    async getLocation() {
        return new Promise((resolve, reject) => {
            wx.getLocation({
                type: 'gcj02',
                success: (res) => {
                    var _a, _b;
                    this.locationPermission = true;
                    resolve({
                        latitude: res.latitude,
                        longitude: res.longitude,
                        speed: (_a = res.speed) !== null && _a !== void 0 ? _a : null,
                        accuracy: (_b = res.accuracy) !== null && _b !== void 0 ? _b : null,
                    });
                },
                fail: (err) => {
                    this.locationPermission = false;
                    reject(new Error(err.errMsg));
                },
            });
        });
    }
    async getWeRunData() {
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
                    var _a;
                    this.weRunPermission = false;
                    if ((_a = err.errMsg) === null || _a === void 0 ? void 0 : _a.includes('auth deny')) {
                        console.warn('[WxService] WeRun permission denied');
                        resolve(null);
                    }
                    else {
                        reject(new Error(err.errMsg));
                    }
                },
            });
        });
    }
    showModal(options) {
        return new Promise((resolve) => {
            var _a, _b, _c;
            wx.showModal({
                title: options.title,
                content: options.content,
                showCancel: (_a = options.showCancel) !== null && _a !== void 0 ? _a : true,
                confirmText: (_b = options.confirmText) !== null && _b !== void 0 ? _b : '确定',
                cancelText: (_c = options.cancelText) !== null && _c !== void 0 ? _c : '取消',
                success: (res) => {
                    resolve(res.confirm);
                },
                fail: () => {
                    resolve(false);
                },
            });
        });
    }
    showToast(options) {
        var _a, _b, _c;
        wx.showToast({
            title: options.title,
            icon: (_a = options.icon) !== null && _a !== void 0 ? _a : 'none',
            duration: (_b = options.duration) !== null && _b !== void 0 ? _b : 1500,
            mask: (_c = options.mask) !== null && _c !== void 0 ? _c : false,
        });
    }
    hideToast() {
        wx.hideToast();
    }
    showLoading(options) {
        var _a, _b;
        wx.showLoading({
            title: (_a = options.title) !== null && _a !== void 0 ? _a : '加载中...',
            mask: (_b = options.mask) !== null && _b !== void 0 ? _b : true,
        });
    }
    hideLoading() {
        wx.hideLoading();
    }
    shareAppMessage(options) {
        var _a;
        wx.shareAppMessage({
            title: options.title,
            path: (_a = options.path) !== null && _a !== void 0 ? _a : '/pages/index',
            imageUrl: options.imageUrl,
        });
    }
    onShareAppMessage(callback) {
        wx.onShareAppMessage(callback);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSystemInfo() {
        return wx.getSystemInfoSync();
    }
    getScreenWidth() {
        return wx.getSystemInfoSync().windowWidth;
    }
    getScreenHeight() {
        return wx.getSystemInfoSync().windowHeight;
    }
    getPixelRatio() {
        return wx.getSystemInfoSync().pixelRatio;
    }
    vibrateShort() {
        try {
            wx.vibrateShort({ type: 'light' });
        }
        catch (_a) {
            // Ignore if not supported
        }
    }
    vibrateLong() {
        try {
            wx.vibrateLong();
        }
        catch (_a) {
            // Ignore if not supported
        }
    }
    hasLocationPermission() {
        return this.locationPermission;
    }
    hasWeRunPermission() {
        return this.weRunPermission;
    }
}
exports.WxService = WxService;
//# sourceMappingURL=WxService.js.map