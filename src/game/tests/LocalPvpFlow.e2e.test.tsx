// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../../app/providers';
import { AppRouter } from '../../app/router';
import { ControlsPage } from '../../pages/ControlsPage';
import { localPvpStore } from '../../stores/localPvpStore';

vi.mock('../bridge/GameCanvas', () => ({
  GameCanvas: ({ onReturnToSetup }: { onReturnToSetup: () => void }) => (
    <section data-e2e="fight">
      Матч запущен
      <button type="button" onClick={onReturnToSetup}>
        К выбору
      </button>
    </section>
  ),
}));

describe('LOCAL_PVP user flow', () => {
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    localStorage.clear();
    localPvpStore.clear();
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('requires two ready players, starts a match and returns to setup', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await import('../../pages/FightPage');
    const location = memoryLocation({ path: '/local-pvp' });
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

    const fightButton = findButton(host, 'FIGHT!');
    expect(fightButton.disabled).toBe(true);
    const readyInputs = [...host.querySelectorAll<HTMLInputElement>('.ready-card input')];
    await act(async () => readyInputs[0].click());
    expect(fightButton.disabled).toBe(true);
    await act(async () => readyInputs[1].click());
    expect(fightButton.disabled).toBe(false);

    await act(async () => {
      fightButton.click();
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(host.textContent).toContain('Матч запущен');
    expect(localPvpStore.get()).not.toBeNull();

    await act(async () => findButton(host, 'К выбору').click());
    expect(host.textContent).toContain('Подготовка LOCAL_PVP');
    expect(localPvpStore.get()).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
    await act(async () => root.unmount());
  });

  it('captures KeyboardEvent.code, replaces a conflict and persists controls', async () => {
    const location = memoryLocation({ path: '/controls' });
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => {
      root.render(
        <Router hook={location.hook}>
          <ControlsPage />
        </Router>,
      );
    });

    await act(async () => findButton(host, 'KeyA').click());
    await act(async () =>
      window.dispatchEvent(
        new KeyboardEvent('keydown', { code: 'KeyZ', bubbles: true, cancelable: true }),
      ),
    );
    expect(host.textContent).toContain('KeyZ');

    await act(async () => findButton(host, 'KeyZ').click());
    await act(async () =>
      window.dispatchEvent(
        new KeyboardEvent('keydown', { code: 'KeyD', bubbles: true, cancelable: true }),
      ),
    );
    expect(host.textContent).toContain('Конфликт клавиш');
    await act(async () => findButton(host, 'Заменить').click());
    await act(async () => findButton(host, 'Сохранить').click());

    const saved = localStorage.getItem('circle-clash-controls-v3');
    expect(saved).toContain('"MOVE_LEFT":"KeyD"');
    expect(saved).toContain('"MOVE_RIGHT":"KeyZ"');
    await act(async () => root.unmount());
  });

  it('swaps characters instead of assigning the same fighter to both players', async () => {
    const location = memoryLocation({ path: '/local-pvp' });
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

    const playerOnePulse = host.querySelector<HTMLInputElement>(
      'input[name="character-player1"][value="pulse"]',
    );
    if (!playerOnePulse) throw new Error('Player 1 Pulse option not found');
    await act(async () => playerOnePulse.click());

    expect(
      host.querySelector<HTMLInputElement>(
        'input[name="character-player1"][value="pulse"]',
      )?.checked,
    ).toBe(true);
    expect(
      host.querySelector<HTMLInputElement>(
        'input[name="character-player2"][value="comet"]',
      )?.checked,
    ).toBe(true);
    await act(async () => root.unmount());
  });
});

function findButton(host: HTMLElement, text: string) {
  const button = [...host.querySelectorAll('button')].find(
    (item) => item.textContent?.trim() === text,
  );
  if (!(button instanceof HTMLButtonElement)) throw new Error(`Button not found: ${text}`);
  return button;
}
