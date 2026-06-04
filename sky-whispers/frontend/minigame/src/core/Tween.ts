// ============================================================
// Tween - Chainable animation/tween system
// ============================================================

import { EasingFunction } from '../types';
import { linear } from '../utils/easing';

interface TweenAction {
  type: 'to' | 'from' | 'delay' | 'call' | 'repeat' | 'yoyo';
  properties?: Record<string, number>;
  duration?: number;
  easing?: EasingFunction;
  callback?: () => void;
  times?: number;
}

interface ActiveTween {
  target: Record<string, number>;
  actions: TweenAction[];
  currentActionIndex: number;
  elapsed: number;
  startValues: Record<string, number>;
  active: boolean;
  yoyoing: boolean;
  repeatCount: number;
  repeatMax: number;
}

function initAction(tween: ActiveTween): void {
  if (tween.currentActionIndex >= tween.actions.length) {
    tween.active = false;
    return;
  }

  const action = tween.actions[tween.currentActionIndex];
  tween.elapsed = 0;

  if (action.type === 'to' || action.type === 'from') {
    tween.startValues = {};
    if (action.properties) {
      for (const key of Object.keys(action.properties)) {
        tween.startValues[key] = tween.target[key] ?? 0;
      }
    }
  }
}

export class Tween {
  private static tweens: ActiveTween[] = [];
  private target: Record<string, number>;
  private actions: TweenAction[] = [];

  constructor(target: Record<string, number>) {
    this.target = target;
  }

  static create(target: Record<string, number>): Tween {
    return new Tween(target);
  }

  to(properties: Record<string, number>, duration: number, easing?: EasingFunction): Tween {
    this.actions.push({
      type: 'to',
      properties,
      duration,
      easing: easing ?? linear,
    });
    return this;
  }

  from(properties: Record<string, number>, duration: number, easing?: EasingFunction): Tween {
    this.actions.push({
      type: 'from',
      properties,
      duration,
      easing: easing ?? linear,
    });
    return this;
  }

  delay(duration: number): Tween {
    this.actions.push({
      type: 'delay',
      duration,
    });
    return this;
  }

  call(callback: () => void): Tween {
    this.actions.push({
      type: 'call',
      callback,
    });
    return this;
  }

  repeat(times: number): Tween {
    this.actions.push({
      type: 'repeat',
      times,
    });
    return this;
  }

  yoyo(): Tween {
    this.actions.push({
      type: 'yoyo',
    });
    return this;
  }

  start(): ActiveTween {
    const tween: ActiveTween = {
      target: this.target,
      actions: [...this.actions],
      currentActionIndex: 0,
      elapsed: 0,
      startValues: {},
      active: true,
      yoyoing: false,
      repeatCount: 0,
      repeatMax: 0,
    };

    initAction(tween);
    Tween.tweens.push(tween);
    return tween;
  }

  static update(dt: number): void {
    for (let i = Tween.tweens.length - 1; i >= 0; i--) {
      const tween = Tween.tweens[i];
      if (!tween.active) {
        Tween.tweens.splice(i, 1);
        continue;
      }
      Tween.updateTween(tween, dt);
    }
  }

  private static updateTween(tween: ActiveTween, dt: number): void {
    if (tween.currentActionIndex >= tween.actions.length) {
      tween.active = false;
      return;
    }

    const action = tween.actions[tween.currentActionIndex];
    const durationMs = (action.duration ?? 0) * 1000;

    switch (action.type) {
      case 'delay':
        tween.elapsed += dt;
        if (tween.elapsed >= durationMs) {
          tween.currentActionIndex++;
          initAction(tween);
        }
        break;

      case 'to': {
        tween.elapsed += dt;
        const progressTo = Math.min(tween.elapsed / durationMs, 1);
        const easedTo = (action.easing ?? linear)(progressTo);
        if (action.properties) {
          for (const [key, endVal] of Object.entries(action.properties)) {
            const startVal = tween.startValues[key] ?? 0;
            tween.target[key] = startVal + (endVal - startVal) * easedTo;
          }
        }
        if (progressTo >= 1) {
          tween.currentActionIndex++;
          initAction(tween);
        }
        break;
      }

      case 'from': {
        tween.elapsed += dt;
        const progressFrom = Math.min(tween.elapsed / durationMs, 1);
        const easedFrom = (action.easing ?? linear)(progressFrom);
        if (action.properties) {
          for (const [key, fromVal] of Object.entries(action.properties)) {
            const endVal = tween.startValues[key] ?? 0;
            tween.target[key] = fromVal + (endVal - fromVal) * easedFrom;
          }
        }
        if (progressFrom >= 1) {
          tween.currentActionIndex++;
          initAction(tween);
        }
        break;
      }

      case 'call':
        action.callback?.();
        tween.currentActionIndex++;
        initAction(tween);
        break;

      case 'repeat':
        tween.repeatMax = action.times ?? 1;
        tween.repeatCount = 0;
        tween.currentActionIndex = 0;
        initAction(tween);
        break;

      case 'yoyo':
        tween.currentActionIndex = 0;
        initAction(tween);
        break;

      default:
        tween.currentActionIndex++;
        initAction(tween);
    }
  }

  static remove(tween: ActiveTween): void {
    const idx = Tween.tweens.indexOf(tween);
    if (idx !== -1) {
      tween.active = false;
      Tween.tweens.splice(idx, 1);
    }
  }

  static removeAll(): void {
    for (const tween of Tween.tweens) {
      tween.active = false;
    }
    Tween.tweens = [];
  }

  static getActiveCount(): number {
    return Tween.tweens.filter((t) => t.active).length;
  }
}

// Convenience function
export function tween(target: Record<string, number>): Tween {
  return Tween.create(target);
}
