// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FullscreenButton } from '../../components/layout/FullscreenButton';

describe('FullscreenButton', () => {
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  });

  afterEach(() => {
    document.body.replaceChildren();
    Reflect.deleteProperty(document.documentElement, 'requestFullscreen');
    vi.restoreAllMocks();
  });

  it('requests fullscreen from a supported browser', async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => root.render(<FullscreenButton />));
    const button = host.querySelector('button');
    expect(button?.textContent).toContain('На весь экран');

    await act(async () => button?.click());
    expect(requestFullscreen).toHaveBeenCalledOnce();
    await act(async () => root.unmount());
  });
});
