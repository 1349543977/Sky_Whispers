import { GameEvent, EventPayloads } from '../types';
type EventCallback<T> = T extends undefined ? () => void : (payload: T) => void;
export declare class EventManager {
    private static instance;
    private listeners;
    private constructor();
    static getInstance(): EventManager;
    on<E extends GameEvent>(event: E, callback: EventCallback<EventPayloads[E]>): () => void;
    once<E extends GameEvent>(event: E, callback: EventCallback<EventPayloads[E]>): () => void;
    off<E extends GameEvent>(event: E, callback: EventCallback<EventPayloads[E]>): void;
    emit<E extends GameEvent>(event: E, ...args: EventPayloads[E] extends undefined ? [] : [EventPayloads[E]]): void;
    removeAllListeners(event?: GameEvent): void;
    listenerCount(event: GameEvent): number;
    private addListener;
}
export {};
