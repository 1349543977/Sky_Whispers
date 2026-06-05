"use strict";
// ============================================================
// AudioService - Sound & music management
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioService = void 0;
class AudioService {
    constructor() {
        this.bgm = null;
        this.sfxPool = new Map();
        this.bgmVolume = 0.5;
        this.sfxVolume = 0.8;
        this.bgmEnabled = true;
        this.sfxEnabled = true;
        this.currentBgmUrl = '';
        this.loadSettings();
    }
    loadSettings() {
        var _a, _b, _c, _d;
        try {
            const settings = wx.getStorageSync('sky_whispers_audio_settings');
            if (settings) {
                const parsed = JSON.parse(settings);
                this.bgmEnabled = (_a = parsed.bgmEnabled) !== null && _a !== void 0 ? _a : true;
                this.sfxEnabled = (_b = parsed.sfxEnabled) !== null && _b !== void 0 ? _b : true;
                this.bgmVolume = (_c = parsed.bgmVolume) !== null && _c !== void 0 ? _c : 0.5;
                this.sfxVolume = (_d = parsed.sfxVolume) !== null && _d !== void 0 ? _d : 0.8;
            }
        }
        catch (_e) {
            // Use defaults
        }
    }
    saveSettings() {
        try {
            wx.setStorageSync('sky_whispers_audio_settings', JSON.stringify({
                bgmEnabled: this.bgmEnabled,
                sfxEnabled: this.sfxEnabled,
                bgmVolume: this.bgmVolume,
                sfxVolume: this.sfxVolume,
            }));
        }
        catch (err) {
            console.error('[AudioService] Save settings failed:', err);
        }
    }
    playBgm(url, fadeIn = true) {
        if (!this.bgmEnabled)
            return;
        if (this.currentBgmUrl === url && this.bgm && !this.bgm.paused)
            return;
        this.stopBgm();
        this.bgm = wx.createInnerAudioContext();
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
    stopBgm(fadeOut = true) {
        if (!this.bgm)
            return;
        if (fadeOut) {
            this.fadeBgmOut(500, () => {
                var _a, _b;
                (_a = this.bgm) === null || _a === void 0 ? void 0 : _a.stop();
                (_b = this.bgm) === null || _b === void 0 ? void 0 : _b.destroy();
                this.bgm = null;
                this.currentBgmUrl = '';
            });
        }
        else {
            this.bgm.stop();
            this.bgm.destroy();
            this.bgm = null;
            this.currentBgmUrl = '';
        }
    }
    pauseBgm() {
        if (this.bgm && !this.bgm.paused) {
            this.bgm.pause();
        }
    }
    resumeBgm() {
        if (this.bgm && this.bgm.paused && this.bgmEnabled) {
            this.bgm.play();
        }
    }
    playSfx(name, url) {
        if (!this.sfxEnabled)
            return;
        let audio = this.sfxPool.get(name);
        if (!audio) {
            audio = wx.createInnerAudioContext();
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
    setBgmVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgm) {
            this.bgm.volume = this.bgmVolume;
        }
        this.saveSettings();
    }
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        for (const sfx of this.sfxPool.values()) {
            sfx.volume = this.sfxVolume;
        }
        this.saveSettings();
    }
    setBgmEnabled(enabled) {
        this.bgmEnabled = enabled;
        if (!enabled) {
            this.pauseBgm();
        }
        else {
            this.resumeBgm();
        }
        this.saveSettings();
    }
    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
        this.saveSettings();
    }
    isBgmEnabled() {
        return this.bgmEnabled;
    }
    isSfxEnabled() {
        return this.sfxEnabled;
    }
    fadeBgmIn(duration) {
        if (!this.bgm)
            return;
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
    fadeBgmOut(duration, onComplete) {
        if (!this.bgm) {
            onComplete === null || onComplete === void 0 ? void 0 : onComplete();
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
                onComplete === null || onComplete === void 0 ? void 0 : onComplete();
            }
        }, stepTime);
    }
    destroy() {
        this.stopBgm(false);
        for (const sfx of this.sfxPool.values()) {
            sfx.destroy();
        }
        this.sfxPool.clear();
    }
}
exports.AudioService = AudioService;
//# sourceMappingURL=AudioService.js.map