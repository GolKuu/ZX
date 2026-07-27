import type { GameEventName, GameEventPayloads } from './GameEvents';

type EventListener<Name extends GameEventName> = (payload: GameEventPayloads[Name]) => void;

export class ReactGameBridge {
  private listeners = new Map<GameEventName, Set<(payload: never) => void>>();

  on<Name extends GameEventName>(name: Name, listener: EventListener<Name>) {
    const listeners = this.listeners.get(name) ?? new Set();
    listeners.add(listener as (payload: never) => void);
    this.listeners.set(name, listeners);

    return () => {
      listeners.delete(listener as (payload: never) => void);
      if (listeners.size === 0) this.listeners.delete(name);
    };
  }

  emit<Name extends GameEventName>(name: Name, payload: GameEventPayloads[Name]) {
    this.listeners.get(name)?.forEach((listener) => listener(payload as never));
  }

  clear() {
    this.listeners.clear();
  }
}
