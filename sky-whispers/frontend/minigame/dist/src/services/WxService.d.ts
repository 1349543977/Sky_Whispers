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
export declare class WxService {
    private locationPermission;
    private weRunPermission;
    login(): Promise<string>;
    getLocation(): Promise<WxLocationResult>;
    getWeRunData(): Promise<WxWeRunResult | null>;
    showModal(options: {
        title: string;
        content: string;
        showCancel?: boolean;
        confirmText?: string;
        cancelText?: string;
    }): Promise<boolean>;
    showToast(options: {
        title: string;
        icon?: 'success' | 'error' | 'none' | 'loading';
        duration?: number;
        mask?: boolean;
    }): void;
    hideToast(): void;
    showLoading(options: {
        title?: string;
        mask?: boolean;
    }): void;
    hideLoading(): void;
    shareAppMessage(options: {
        title: string;
        path?: string;
        imageUrl?: string;
    }): void;
    onShareAppMessage(callback: () => {
        title: string;
        path?: string;
        imageUrl?: string;
    }): void;
    getSystemInfo(): any;
    getScreenWidth(): number;
    getScreenHeight(): number;
    getPixelRatio(): number;
    vibrateShort(): void;
    vibrateLong(): void;
    hasLocationPermission(): boolean;
    hasWeRunPermission(): boolean;
}
