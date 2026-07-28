// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../../app/providers';
import { AppRouter } from '../../app/router';

vi.mock('../bridge/GameCanvas', () => ({
  GameCanvas: () => <div data-testid="game-canvas">Арена загружена</div>,
}));

const routes = [
  ['/', 'Выбери режим'],
  ['/local-pvp', 'Подготовка LOCAL_PVP'],
  ['/fight', 'Готовим арену…'],
  ['/training', 'В разработке'],
  ['/characters', 'Персонажи'],
  ['/controls', 'Управление'],
  ['/profile', 'Профиль'],
  ['/auth', 'Вход в профиль'],
] as const;

describe('application routes', () => {
  beforeEach(() => Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }));
  afterEach(() => document.body.replaceChildren());

  it('opens every route and returns to the menu without console errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const location = memoryLocation({ path: '/' });
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(
        <Router hook={location.hook}>
          <AppProviders>
            <AppRouter />
          </AppProviders>
        </Router>,
      );
    });

    for (const [path, expectedText] of routes) {
      await act(async () => {
        location.navigate(path);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(host.textContent).toContain(expectedText);
    }

    await act(async () => location.navigate('/'));
    expect(host.textContent).toContain('Выбери режим');
    expect(host.querySelectorAll('button:disabled')).toHaveLength(4);
    expect(consoleError).not.toHaveBeenCalled();
    await act(async () => root.unmount());
  });
});
