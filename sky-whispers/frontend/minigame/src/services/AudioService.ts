// ============================================================
// AudioService - Sound & music management
// ============================================================

interface InnerAudioContext {
  src: string;
  loop: boolean;
  volume: number;
  paused: boolean;
  play(): void;
  pause(): void;
  stop(): void;
  seek(position: number): void;
  destroy(): void;
  onPlay(callback: () => void): void;
  onPause(callback: () => void): void;
  onStop(callback: () => void): void;
  onEnded(callback: () => void): void;
  onError(callback: (err: { errMsg: string }) => void): void;
}

export class AudioService {
  private bgm: InnerAudioContext | null = null;
  private sfxPool: Map<string, InnerAudioContext> = new Map();
  private bgmVolume: number = 0.5;
  private sfxVolume: number = 0.8;
  private bgmEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  private currentBgmUrl: string = '';

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const settings = wx.getStorageSync('sky_whispers_audio_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.bgmEnabled = parsed.bgmEnabled ?? true;
        this.sfxEnabled = parsed.sfxEnabled ?? true;
        this.bgmVolume = parsed.bgmVolume ?? 0.5;
        this.sfxVolume = parsed.sfxVolume ?? 0.8;
      }
    } catch {
      // Use defaults
    }
  }

  private saveSettings(): void {
    try {
      wx.setStorageSync('sky_whispers_audio_settings', JSON.stringify({
        bgmEnabled: this.bgmEnabled,
        sfxEnabled: this.sfxEnabled,
        bgmVolume: this.bgmVolume,
        sfxVolume: this.sfxVolume,
      }));
    } catch (err) {
      console.error('[AudioService] Save settings failed:', err);
    }
  }

  playBgm(url: string, fadeIn: boolean = true): void {
    if (!this.bgmEnabled) return;
    if (this.currentBgmUrl === url && this.bgm && !this.bgm.paused) return;

    this.stopBgm();

    this.bgm = wx.createInnerAudioContext() as unknown as InnerAudioContext;
    this.bgm.src = url;
    this.bgm.loop = true;
    this.bgm.volume = fadeIn ? 0 : this.bgmVolume;
    this.bgm.onError((err) => {
      console.error('[AudioService] BGM error:', err);
    });

    this.bgm.play();
    this.currentBgmUrl = url;

    if (fadeIn) {
      this.fadeBgmIn(1000);
    }
  }

  stopBgm(fadeOut: boolean = true): void {
    if (!this.bgm) return;

    if (fadeOut) {
      this.fadeBgmOut(500, () => {
        this.bgm?.stop();
        this.bgm?.destroy();
        this.bgm = null;
        this.currentBgmUrl = '';
      });
    } else {
      this.bgm.stop();
      this.bgm.destroy();
      this.bgm = null;
      this.currentBgmUrl = '';
    }
  }

  pauseBgm(): void {
    if (this.bgm && !this.bgm.paused) {
      this.bgm.pause();
    }
  }

  resumeBgm(): void {
    if (this.bgm && this.bgm.paused && this.bgmEnabled) {
      this.bgm.play();
    }
  }

  playSfx(name: string, url: string): void {
    if (!this.sfxEnabled) return;

    let audio = this.sfxPool.get(name);
    if (!audio) {
      audio = wx.createInnerAudioContext() as unknown as InnerAudioContext;
      audio.src = url;
      audio.volume = this.sfxVolume;
      audio.onError((err) => {
        console.error(`[AudioService] SFX "${name}" error:`, err);
      });
      this.sfxPool.set(name, audio);
    }

    // Reset and play
    audio.stop();
    audio.seek(0);
    audio.play();
  }

  setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      this.bgm.volume = this.bgmVolume;
    }
    this.saveSettings();
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    for (const sfx of this.sfxPool.values()) {
      sfx.volume = this.sfxVolume;
    }
    this.saveSettings();
  }

  setBgmEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.pauseBgm();
    } else {
      this.resumeBgm();
    }
    this.saveSettings();
  }

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    this.saveSettings();
  }

  isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  private fadeBgmIn(duration: number): void {
    if (!this.bgm) return;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = this.bgmVolume / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (this.bgm) {
        this.bgm.volume = Math.min(volumeStep * currentStep, this.bgmVolume);
      }
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);
  }

  private fadeBgmOut(duration: number, onComplete?: () => void): void {
    if (!this.bgm) {
      onComplete?.();
      return;
    }
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = this.bgm.volume / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (this.bgm) {
        this.bgm.volume = Math.max(this.bgm.volume - volumeStep, 0);
      }
      if (currentStep >= steps) {
        clearInterval(timer);
        onComplete?.();
      }
    }, stepTime);
  }

  destroy(): void {
    this.stopBgm(false);
    for (const sfx of this.sfxPool.values()) {
      sfx.destroy();
    }
    this.sfxPool.clear();
  }
}
