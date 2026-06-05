export declare class AudioService {
    private bgm;
    private sfxPool;
    private bgmVolume;
    private sfxVolume;
    private bgmEnabled;
    private sfxEnabled;
    private currentBgmUrl;
    constructor();
    private loadSettings;
    private saveSettings;
    playBgm(url: string, fadeIn?: boolean): void;
    stopBgm(fadeOut?: boolean): void;
    pauseBgm(): void;
    resumeBgm(): void;
    playSfx(name: string, url: string): void;
    setBgmVolume(volume: number): void;
    setSfxVolume(volume: number): void;
    setBgmEnabled(enabled: boolean): void;
    setSfxEnabled(enabled: boolean): void;
    isBgmEnabled(): boolean;
    isSfxEnabled(): boolean;
    private fadeBgmIn;
    private fadeBgmOut;
    destroy(): void;
}
