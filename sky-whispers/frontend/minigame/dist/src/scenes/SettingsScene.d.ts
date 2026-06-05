import { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { Input } from '../core/Input';
export declare class SettingsScene extends Scene {
    private audioService;
    private wxService;
    private toastManager;
    private backButton;
    private bgmToggle;
    private sfxToggle;
    private locationButton;
    private aboutButton;
    private helpButton;
    private bgmEnabled;
    private sfxEnabled;
    private locationEnabled;
    constructor(renderer: Renderer, input: Input);
    onLoad(): Promise<void>;
    private toggleBgm;
    private toggleSfx;
    private requestLocation;
    private showAbout;
    private showHelp;
    private navigateBack;
    update(dt: number): void;
    fixedUpdate(_dt: number): void;
    render(): void;
    private renderSettingRow;
    onUnload(): void;
}
//# sourceMappingURL=SettingsScene.d.ts.map