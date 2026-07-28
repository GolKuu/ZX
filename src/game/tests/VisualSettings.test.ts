// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { applyLocalAccessibility } from '../../lib/settingsSync';
import { defaultGameSettings, settingsStore } from '../../stores/settingsStore';

describe('visual settings', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('class');
    document.documentElement.style.removeProperty('--ui-scale');
  });

  it('keeps the full cartoon particle range', () => {
    settingsStore.save({ ...defaultGameSettings, bloodLevel: 3 });
    expect(settingsStore.load().bloodLevel).toBe(3);
  });

  it('applies interface scale and reduced motion to the document', () => {
    applyLocalAccessibility({
      ...defaultGameSettings,
      uiScale: 1.25,
      reducedMotion: true,
    });

    expect(document.documentElement.style.getPropertyValue('--ui-scale')).toBe('1.25');
    expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
  });
});
