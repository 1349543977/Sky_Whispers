// ============================================================
// Scene - Scene management with stack-based navigation
// ============================================================

import { SceneName } from '../types';
import { EventManager } from './EventManager';
import { GameEvent } from '../types';
import { Renderer } from './Renderer';
import { Input } from './Input';
import { LAYERS } from '../utils/constants';

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
  private transitionAlpha: number = 0;
  private isTransitioning: boolean = false;
  private transitionCallback: (() => void) | null = null;

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

  async switchWithTransition(
    sceneName: string,
    type: 'fade' | 'slideLeft' | 'slideRight' | 'slideUp' = 'fade',
  ): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const fadeOutDuration = 300;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const fadeOut = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / fadeOutDuration, 1);
        this.transitionAlpha = progress;

        if (progress < 1) {
          requestAnimationFrame(fadeOut);
        } else {
          // Switch scene at peak
          this.switchTo(sceneName as SceneName);

          // Fade in new scene
          const fadeInStart = Date.now();
          const fadeInDuration = 400;

          const fadeIn = () => {
            const elapsed = Date.now() - fadeInStart;
            const progress = Math.min(elapsed / fadeInDuration, 1);
            this.transitionAlpha = 1 - progress;

            if (progress < 1) {
              requestAnimationFrame(fadeIn);
            } else {
              this.transitionAlpha = 0;
              this.isTransitioning = false;
              resolve();
            }
          };
          requestAnimationFrame(fadeIn);
        }
      };
      requestAnimationFrame(fadeOut);
    });
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

    // Draw transition overlay if transitioning
    if (this.transitionAlpha > 0) {
      this.renderer.setAlpha(
        this.transitionAlpha,
        LAYERS.OVERLAY,
        (ctx) => {
          ctx.fillStyle = '#FAFBFD';
          ctx.fillRect(0, 0, this.renderer.width, this.renderer.height);
        },
      );
    }
  }
}
