// ============================================================
// EventManager - Type-safe pub/sub event bus
// ============================================================

import { GameEvent, EventPayloads } from '../types';

type EventCallback<T> = T extends undefined ? () => void : (payload: T) => void;

interface EventListener<T> {
  callback: EventCallback<T>;
  once: boolean;
}

export class EventManager {
  private static instance: EventManager;
  private listeners: Map<string, Array<EventListener<unknown>>> = new Map();

  private constructor() {}

  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  on<E extends GameEvent>(
    event: E,
    callback: EventCallback<EventPayloads[E]>,
  ): () => void {
    return this.addListener(event, callback, false);
  }

  once<E extends GameEvent>(
    event: E,
    callback: EventCallback<EventPayloads[E]>,
  ): () => void {
    return this.addListener(event, callback, true);
  }

  off<E extends GameEvent>(
    event: E,
    callback: EventCallback<EventPayloads[E]>,
  ): void {
    const list = this.listeners.get(event);
    if (!list) return;
    const idx = list.findIndex(
      (l) => l.callback === (callback as EventCallback<unknown>),
    );
    if (idx !== -1) {
      list.splice(idx, 1);
    }
    if (list.length === 0) {
      this.listeners.delete(event);
    }
  }

  emit<E extends GameEvent>(
    event: E,
    ...args: EventPayloads[E] extends undefined ? [] : [EventPayloads[E]]
  ): void {
    const list = this.listeners.get(event);
    if (!list || list.length === 0) return;

    const payload = args[0];
    const toRemove: number[] = [];

    for (let i = 0; i < list.length; i++) {
      const listener = list[i];
      try {
        (listener.callback as (p?: unknown) => void)(payload);
      } catch (err) {
        console.error(`[EventManager] Error in listener for "${event}":`, err);
      }
      if (listener.once) {
        toRemove.push(i);
      }
    }

    // Remove once listeners in reverse order
    for (let i = toRemove.length - 1; i >= 0; i--) {
      list.splice(toRemove[i], 1);
    }

    if (list.length === 0) {
      this.listeners.delete(event);
    }
  }

  removeAllListeners(event?: GameEvent): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event: GameEvent): number {
    return this.listeners.get(event)?.length ?? 0;
  }

  private addListener<E extends GameEvent>(
    event: E,
    callback: EventCallback<EventPayloads[E]>,
    once: boolean,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const list = this.listeners.get(event)!;
    list.push({
      callback: callback as EventCallback<unknown>,
      once,
    });

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }
}
