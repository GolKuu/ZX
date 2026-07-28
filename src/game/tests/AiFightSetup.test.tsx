// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '../../app/providers';
import { AiFightSetupPage } from '../../pages/AiFightSetupPage';
import { localPvpStore } from '../../stores/localPvpStore';

describe('AI fight setup', () => {
  beforeEach(() => Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }));
  afterEach(() => {
    localPvpStore.clear();
    document.body.replaceChildren();
  });

  it('starts a match with the selected difficulty', async () => {
    const location = memoryLocation({ path: '/vs-ai', record: true });
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(
        <Router hook={location.hook}>
          <AppProviders>
            <AiFightSetupPage />
          </AppProviders>
        </Router>,
      );
    });

    const veryHard = host.querySelector<HTMLInputElement>(
      'input[name="ai-difficulty"][value="VERY_HARD"]',
    );
    const start = [...host.querySelectorAll('button')].find(
      (button) => button.textContent === 'Бой против ИИ',
    );
    await act(async () => veryHard?.click());
    await act(async () => start?.click());

    expect(location.history[location.history.length - 1]).toBe('/fight');
    expect(localPvpStore.get()).toMatchObject({
      aiPlayerId: 'player2',
      aiDifficulty: 'VERY_HARD',
    });
    await act(async () => root.unmount());
  });
});
