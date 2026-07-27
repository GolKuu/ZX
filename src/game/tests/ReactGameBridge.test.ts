import { describe, expect, it, vi } from 'vitest';
import { GameEvents } from '../bridge/GameEvents';
import { ReactGameBridge } from '../bridge/ReactGameBridge';

describe('ReactGameBridge', () => {
  it('unsubscribes listeners cleanly', () => {
    const bridge = new ReactGameBridge();
    const listener = vi.fn();
    const unsubscribe = bridge.on(GameEvents.pauseChanged, listener);

    bridge.emit(GameEvents.pauseChanged, { paused: true });
    unsubscribe();
    bridge.emit(GameEvents.pauseChanged, { paused: false });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ paused: true });
  });
});
