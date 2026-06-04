// ============================================================
// Input - Touch input handler with gesture recognition
// ============================================================

import { TouchPoint, TouchEvent as GameTouchEvent } from '../types';
import { pointInRect } from '../utils/math';

export interface TouchTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  onTouchStart?: (point: TouchPoint) => void;
  onTouchEnd?: (point: TouchPoint) => void;
  onTouchMove?: (point: TouchPoint) => void;
  onTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
}

type InputCallback = (event: GameTouchEvent) => void;

interface WxTouch {
  identifier: number;
  clientX: number;
  clientY: number;
}

interface WxTouchEvent {
  touches: WxTouch[];
  changedTouches: WxTouch[];
  timeStamp: number;
}

export class Input {
  private targets: TouchTarget[] = [];
  private activeTouches: Map<number, TouchPoint> = new Map();
  private longPressTimers: Map<number, number> = new Map();
  private touchStartPoints: Map<number, TouchPoint> = new Map();
  private globalListeners: Map<string, InputCallback[]> = new Map();
  private longPressThreshold: number = 500;
  private tapDistanceThreshold: number = 10;
  private isDragging: boolean = false;
  private dragStartPoint: TouchPoint | null = null;
  private dragThreshold: number = 5;

  constructor() {
    this.bindWxEvents();
  }

  private bindWxEvents(): void {
    wx.onTouchStart((e: WxTouchEvent) => {
      this.handleTouchStart(this.convertWxEvent(e, 'touchstart'));
    });
    wx.onTouchMove((e: WxTouchEvent) => {
      this.handleTouchMove(this.convertWxEvent(e, 'touchmove'));
    });
    wx.onTouchEnd((e: WxTouchEvent) => {
      this.handleTouchEnd(this.convertWxEvent(e, 'touchend'));
    });
    wx.onTouchCancel((e: WxTouchEvent) => {
      this.handleTouchEnd(this.convertWxEvent(e, 'touchend'));
    });
  }

  private convertWxEvent(
    e: WxTouchEvent,
    type: 'touchstart' | 'touchmove' | 'touchend',
  ): GameTouchEvent {
    return {
      type,
      touches: e.touches.map((t: WxTouch) => ({
        identifier: t.identifier,
        x: t.clientX,
        y: t.clientY,
      })),
      changedTouches: e.changedTouches.map((t: WxTouch) => ({
        identifier: t.identifier,
        x: t.clientX,
        y: t.clientY,
      })),
      timeStamp: e.timeStamp,
    };
  }

  addTarget(target: TouchTarget): void {
    this.targets.push(target);
  }

  removeTarget(id: string): void {
    this.targets = this.targets.filter((t) => t.id !== id);
  }

  clearTargets(): void {
    this.targets = [];
  }

  on(event: string, callback: InputCallback): () => void {
    if (!this.globalListeners.has(event)) {
      this.globalListeners.set(event, []);
    }
    this.globalListeners.get(event)!.push(callback);
    return () => {
      const list = this.globalListeners.get(event);
      if (list) {
        const idx = list.indexOf(callback);
        if (idx !== -1) list.splice(idx, 1);
      }
    };
  }

  private emitGlobal(event: string, data: GameTouchEvent): void {
    const list = this.globalListeners.get(event);
    if (list) {
      for (const cb of list) {
        try {
          cb(data);
        } catch (err) {
          console.error('[Input] Global listener error:', err);
        }
      }
    }
  }

  private handleTouchStart(event: GameTouchEvent): void {
    this.emitGlobal('touchstart', event);

    for (const touch of event.changedTouches) {
      this.activeTouches.set(touch.identifier, touch);
      this.touchStartPoints.set(touch.identifier, { ...touch });

      // Start long press timer
      const timerId = setTimeout(() => {
        this.handleLongPress(touch);
      }, this.longPressThreshold) as unknown as number;
      this.longPressTimers.set(touch.identifier, timerId);

      // Check targets
      for (const target of this.targets) {
        if (pointInRect(touch.x, touch.y, target.x, target.y, target.width, target.height)) {
          target.onTouchStart?.(touch);
        }
      }
    }
  }

  private handleTouchMove(event: GameTouchEvent): void {
    this.emitGlobal('touchmove', event);

    for (const touch of event.changedTouches) {
      this.activeTouches.set(touch.identifier, touch);

      // Cancel long press if moved too far
      const startPoint = this.touchStartPoints.get(touch.identifier);
      if (startPoint) {
        const dx = touch.x - startPoint.x;
        const dy = touch.y - startPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.dragThreshold && !this.isDragging) {
          this.isDragging = true;
          this.dragStartPoint = startPoint;
          this.cancelLongPress(touch.identifier);
        }
      }

      // Check targets
      for (const target of this.targets) {
        if (pointInRect(touch.x, touch.y, target.x, target.y, target.width, target.height)) {
          target.onTouchMove?.(touch);
        }
      }
    }
  }

  private handleTouchEnd(event: GameTouchEvent): void {
    this.emitGlobal('touchend', event);

    for (const touch of event.changedTouches) {
      // Cancel long press timer
      this.cancelLongPress(touch.identifier);

      const startPoint = this.touchStartPoints.get(touch.identifier);

      // Check for tap
      if (startPoint && !this.isDragging) {
        const dx = touch.x - startPoint.x;
        const dy = touch.y - startPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= this.tapDistanceThreshold) {
          this.handleTap(touch);
        }
      }

      // Check targets
      for (const target of this.targets) {
        target.onTouchEnd?.(touch);
      }

      this.activeTouches.delete(touch.identifier);
      this.touchStartPoints.delete(touch.identifier);
    }

    this.isDragging = false;
    this.dragStartPoint = null;
  }

  private handleTap(touch: TouchPoint): void {
    for (const target of this.targets) {
      if (pointInRect(touch.x, touch.y, target.x, target.y, target.width, target.height)) {
        target.onTap?.(touch);
      }
    }
  }

  private handleLongPress(touch: TouchPoint): void {
    for (const target of this.targets) {
      if (pointInRect(touch.x, touch.y, target.x, target.y, target.width, target.height)) {
        target.onLongPress?.(touch);
      }
    }
    this.longPressTimers.delete(touch.identifier);
  }

  private cancelLongPress(identifier: number): void {
    const timerId = this.longPressTimers.get(identifier);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      this.longPressTimers.delete(identifier);
    }
  }

  get isPressed(): boolean {
    return this.activeTouches.size > 0;
  }

  getActiveTouches(): TouchPoint[] {
    return Array.from(this.activeTouches.values());
  }
}
