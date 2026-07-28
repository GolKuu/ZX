// @vitest-environment jsdom

import { StrictMode, act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../../app/providers';
import { GameCanvas } from '../bridge/GameCanvas';
import { createTestMatchConfig } from './testFixtures';

const lifecycle = vi.hoisted(() => ({ created: 0, destroyed: 0 }));

vi.mock('phaser', () => ({
  default: {
    Game: class {
      readonly scale = { refresh: vi.fn() };
      private readonly canvas = document.createElement('canvas');

      constructor(config: { parent: HTMLElement }) {
        lifecycle.created += 1;
        config.parent.append(this.canvas);
      }

      destroy(removeCanvas: boolean) {
        lifecycle.destroyed += 1;
        if (removeCanvas) this.canvas.remove();
      }
    },
  },
}));

vi.mock('../config/gameConfig', () => ({
  createGameConfig: (parent: HTMLElement) => ({ parent }),
}));

class ResizeObserverMock {
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('GameCanvas lifecycle', () => {
  beforeEach(() => {
    lifecycle.created = 0;
    lifecycle.destroyed = 0;
    globalThis.ResizeObserver = ResizeObserverMock;
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('keeps one canvas in Strict Mode and cleans up after repeated opening', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(
        <StrictMode>
          <AppProviders>
            <GameCanvas
              matchConfig={createTestMatchConfig()}
              onExit={() => undefined}
              onReturnToSetup={() => undefined}
            />
          </AppProviders>
        </StrictMode>,
      );
    });
    expect(host.querySelectorAll('canvas')).toHaveLength(1);

    await act(async () => root.render(<div>Меню</div>));
    expect(host.querySelectorAll('canvas')).toHaveLength(0);

    await act(async () => {
      root.render(
        <AppProviders>
          <GameCanvas
            matchConfig={createTestMatchConfig()}
            onExit={() => undefined}
            onReturnToSetup={() => undefined}
          />
        </AppProviders>,
      );
    });
    expect(host.querySelectorAll('canvas')).toHaveLength(1);

    await act(async () => root.unmount());
    expect(host.querySelectorAll('canvas')).toHaveLength(0);
    expect(lifecycle.destroyed).toBe(lifecycle.created);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
