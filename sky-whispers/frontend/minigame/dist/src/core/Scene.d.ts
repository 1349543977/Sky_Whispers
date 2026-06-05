import { SceneName } from '../types';
import { EventManager } from './EventManager';
import { Renderer } from './Renderer';
import { Input } from './Input';
export declare abstract class Scene {
    protected renderer: Renderer;
    protected input: Input;
    protected eventManager: EventManager;
    protected name: SceneName;
    protected active: boolean;
    protected loaded: boolean;
    constructor(name: SceneName, renderer: Renderer, input: Input);
    get sceneName(): SceneName;
    get isActive(): boolean;
    get isLoaded(): boolean;
    abstract onLoad(): Promise<void>;
    abstract onUnload(): void;
    abstract update(dt: number): void;
    abstract fixedUpdate(dt: number): void;
    abstract render(): void;
    onEnter(): void;
    onExit(): void;
    onPause(): void;
    onResume(): void;
}
export declare class SceneManager {
    private scenes;
    private stack;
    private renderer;
    private input;
    private eventManager;
    private transitionAlpha;
    private isTransitioning;
    private transitionCallback;
    constructor(renderer: Renderer, input: Input);
    register(scene: Scene): void;
    switchTo(name: SceneName): Promise<void>;
    push(name: SceneName): Promise<void>;
    pop(): void;
    getCurrentScene(): SceneName | null;
    getCurrent(): Scene | null;
    switchWithTransition(sceneName: string, type?: 'fade' | 'slideLeft' | 'slideRight' | 'slideUp'): Promise<void>;
    update(dt: number): void;
    fixedUpdate(dt: number): void;
    render(): void;
}
