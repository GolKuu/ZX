// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Auth } from '../../components/Auth';

const { signInWithOtp } = vi.hoisted(() => ({
  signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: { signInWithOtp } },
}));

describe('email authentication', () => {
  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    signInWithOtp.mockClear();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('registers or signs in with one email button and a magic link', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<Auth />));

    const input = host.querySelector<HTMLInputElement>('input[type="email"]');
    const button = host.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!input || !button) throw new Error('Email form was not rendered');

    await act(async () => {
      setNativeInputValue(input, 'player@example.com');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => button.click());

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'player@example.com',
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        shouldCreateUser: true,
      },
    });
    expect(host.textContent).toContain('Ссылка отправлена');
    expect(host.querySelectorAll('button')).toHaveLength(1);
    await act(async () => root.unmount());
  });
});

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
}
