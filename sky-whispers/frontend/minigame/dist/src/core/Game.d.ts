import { Renderer } from './Renderer';
import { Camera } from './Camera';
import { Input } from './Input';
import { SceneManager } from './Scene';
export declare class Game {
    private renderer;
    private camera;
    private input;
    private scheduler;
    private sceneManager;
    private eventManager;
    private paused;
    private initialized;
    constructor();
    init(): Promise<void>;
    run(): Promise<void>;
    private registerScenes;
    private setupLifecycle;
    private update;
    private fixedUpdate;
    private render;
    getRenderer(): Renderer;
    getCamera(): Camera;
    getInput(): Input;
    getSceneManager(): SceneManager;
}
//# sourceMappingURL=Game.d.ts.map