// ============================================================
// Scene - Scene management with stack-based navigation
// ============================================================

import { SceneName } from '../types';
import { EventManager } from './EventManager';
import { GameEvent } from '../types';
import { Renderer } from './Renderer';
import { Input } from './Input';

export abstract class Scene {
  protected renderer: Renderer;
  protected input: Input;
  protected eventManager: EventManager;
  protected name: SceneName;
  protected active: boolean = false;
  protected loaded: boolean = false;

  constructor(name: SceneName, renderer: Renderer, input: Input) {
    this.name = name;
    this.renderer = renderer;
    this.input = input;
    this.eventManager = EventManager.getInstance();
  }

  get sceneName(): SceneName {
    return this.name;
  }

  get isActive(): boolean {
    return this.active;
  }

  get isLoaded(): boolean {
    return this.loaded;
  }

  abstract onLoad(): Promise<void>;
  abstract onUnload(): void;
  abstract update(dt: number): void;
  abstract fixedUpdate(dt: number): void;
  abstract render(): void;

  onEnter(): void {
    this.active = true;
  }

  onExit(): void {
    this.active = false;
  }

  onPause(): void {
    this.active = false;
  }

  onResume(): void {
    this.active = true;
  }
}

export class SceneManager {
  private scenes: Map<SceneName, Scene> = new Map();
  private stack: SceneName[] = [];
  private renderer: Renderer;
  private input: Input;
  private eventManager: EventManager;

  constructor(renderer: Renderer, input: Input) {
    this.renderer = renderer;
    this.input = input;
    this.eventManager = EventManager.getInstance();
  }

  register(scene: Scene): void {
    this.scenes.set(scene.sceneName, scene);
  }

  async switchTo(name: SceneName): Promise<void> {
    const target = this.scenes.get(name);
    if (!target) {
      console.error(`[SceneManager] Scene "${name}" not found`);
      return;
    }

    // Exit current scene
    const currentName = this.getCurrentScene();
    if (currentName) {
      const current = this.scenes.get(currentName);
      current?.onExit();
      current?.onUnload();
    }

    // Load target scene if needed
    if (!target.isLoaded) {
      await target.onLoad();
    }

    // Enter target scene
    target.onEnter();

    // Replace stack
    this.stack = [name];

    this.eventManager.emit(GameEvent.SceneChange, {
      from: currentName ?? SceneName.Boot,
      to: name,
    });
  }

  async push(name: SceneName): Promise<void> {
    const target = this.scenes.get(name);
    if (!target) {
      console.error(`[SceneManager] Scene "${name}" not found`);
      return;
    }

    // Pause current scene
    const currentName = this.getCurrentScene();
    if (currentName) {
      const current = this.scenes.get(currentName);
      current?.onPause();
    }

    // Load target scene if needed
    if (!target.isLoaded) {
      await target.onLoad();
    }

    // Push and enter
    this.stack.push(name);
    target.onEnter();

    this.eventManager.emit(GameEvent.ScenePush, name);
  }

  pop(): void {
    if (this.stack.length <= 1) {
      console.warn('[SceneManager] Cannot pop the last scene');
      return;
    }

    const currentName = this.stack.pop()!;
    const current = this.scenes.get(currentName);
    current?.onExit();
    current?.onUnload();

    // Resume previous scene
    const previousName = this.getCurrentScene();
    if (previousName) {
      const previous = this.scenes.get(previousName);
      previous?.onResume();
    }

    this.eventManager.emit(GameEvent.ScenePop, currentName);
  }

  getCurrentScene(): SceneName | null {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
  }

  getCurrent(): Scene | null {
    const name = this.getCurrentScene();
    return name ? this.scenes.get(name) ?? null : null;
  }

  update(dt: number): void {
    const scene = this.getCurrent();
    if (scene && scene.isActive) {
      scene.update(dt);
    }
  }

  fixedUpdate(dt: number): void {
    const scene = this.getCurrent();
    if (scene && scene.isActive) {
      scene.fixedUpdate(dt);
    }
  }

  render(): void {
    const scene = this.getCurrent();
    if (scene && scene.isActive) {
      scene.render();
    }
  }
}
