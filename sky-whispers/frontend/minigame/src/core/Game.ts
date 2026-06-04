// ============================================================
// Game - Main game class
// ============================================================

import { SceneName, GameEvent } from '../types';
import { Renderer } from './Renderer';
import { Camera } from './Camera';
import { Input } from './Input';
import { Scheduler } from './Scheduler';
import { EventManager } from './EventManager';
import { Scene, SceneManager } from './Scene';
import { Tween } from './Tween';

// Scene imports
import { BootScene } from '../scenes/BootScene';
import { MainScene } from '../scenes/MainScene';
import { SocialScene } from '../scenes/SocialScene';
import { ShopScene } from '../scenes/ShopScene';
import { CodexScene } from '../scenes/CodexScene';
import { SettingsScene } from '../scenes/SettingsScene';

export class Game {
  private renderer: Renderer;
  private camera: Camera;
  private input: Input;
  private scheduler: Scheduler;
  private sceneManager: SceneManager;
  private eventManager: EventManager;
  private paused: boolean = false;
  private initialized: boolean = false;

  constructor() {
    this.renderer = new Renderer();
    this.camera = new Camera(this.renderer.width, this.renderer.height);
    this.input = new Input();
    this.scheduler = new Scheduler();
    this.sceneManager = new SceneManager(this.renderer, this.input);
    this.eventManager = EventManager.getInstance();
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    console.log('[Game] Initializing Sky Whispers...');

    // Register scenes
    this.registerScenes();

    // Setup game loop
    this.scheduler.setUpdateCallback((dt) => this.update(dt));
    this.scheduler.setFixedUpdateCallback((dt) => this.fixedUpdate(dt));
    this.scheduler.setRenderCallback(() => this.render());

    // Setup lifecycle handlers
    this.setupLifecycle();

    this.initialized = true;
    this.eventManager.emit(GameEvent.GameInit);

    console.log('[Game] Initialization complete');
  }

  async run(): Promise<void> {
    await this.init();

    // Switch to boot scene
    await this.sceneManager.switchTo(SceneName.Boot);

    // Start game loop
    this.scheduler.start();

    console.log('[Game] Running...');
  }

  private registerScenes(): void {
    this.sceneManager.register(new BootScene(this.renderer, this.input));
    this.sceneManager.register(new MainScene(this.renderer, this.input));
    this.sceneManager.register(new SocialScene(this.renderer, this.input));
    this.sceneManager.register(new ShopScene(this.renderer, this.input));
    this.sceneManager.register(new CodexScene(this.renderer, this.input));
    this.sceneManager.register(new SettingsScene(this.renderer, this.input));
  }

  private setupLifecycle(): void {
    wx.onShow(() => {
      if (this.paused) {
        this.paused = false;
        this.scheduler.resume();
        this.eventManager.emit(GameEvent.GameResume);
        console.log('[Game] Resumed');
      }
    });

    wx.onHide(() => {
      this.paused = true;
      this.scheduler.pause();
      this.eventManager.emit(GameEvent.GamePause);
      console.log('[Game] Paused');
    });
  }

  private update(dt: number): void {
    if (this.paused) return;

    this.camera.update(dt);
    Tween.update(dt * 1000); // Tween expects ms
    this.sceneManager.update(dt);
  }

  private fixedUpdate(dt: number): void {
    if (this.paused) return;
    this.sceneManager.fixedUpdate(dt);
  }

  private render(): void {
    if (this.paused) return;
    this.sceneManager.render();
    this.renderer.render();
  }

  getRenderer(): Renderer {
    return this.renderer;
  }

  getCamera(): Camera {
    return this.camera;
  }

  getInput(): Input {
    return this.input;
  }

  getSceneManager(): SceneManager {
    return this.sceneManager;
  }
}
