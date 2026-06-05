import { Scene } from '../core/Scene';
import { Renderer } from '../core/Renderer';
import { Input } from '../core/Input';
export declare class BootScene extends Scene {
    private apiClient;
    private wxService;
    private storageService;
    private loadingProgress;
    private loadingText;
    private loadingSteps;
    private currentStep;
    constructor(renderer: Renderer, input: Input);
    onLoad(): Promise<void>;
    private setupLoadingSteps;
    private delay;
    private getSceneManager;
    update(_dt: number): void;
    fixedUpdate(_dt: number): void;
    render(): void;
    onUnload(): void;
}
//# sourceMappingURL=BootScene.d.ts.map