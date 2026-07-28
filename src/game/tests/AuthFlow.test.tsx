// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Auth } from '../../components/Auth';

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  enterGuestMode: vi.fn(),
}));

vi.mock('../../app/authContext', () => ({
  useAuth: () => ({
    status: 'signedOut',
    user: null,
    enterGuestMode: authMocks.enterGuestMode,
  }),
}));

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      ...authMocks,
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

describe('email account flows', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    Object.values(authMocks).forEach((mock) => mock.mockReset());
    authMocks.enterGuestMode.mockResolvedValue(undefined);
    authMocks.signInWithPassword.mockResolvedValue({
      error: { message: 'User player@example.com does not exist' },
    });
    authMocks.signUp.mockResolvedValue({ error: null });
    authMocks.resetPasswordForEmail.mockResolvedValue({ error: { message: 'not found' } });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root.render(<Auth />));
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    document.body.replaceChildren();
    localStorage.clear();
  });

  it('signs in with email and password without exposing provider errors', async () => {
    await fill('login-email', 'player@example.com');
    await fill('login-password', 'Secret123');
    await clickButton('Войти');

    expect(authMocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'player@example.com',
      password: 'Secret123',
    });
    expect(host.textContent).toContain('Проверьте email и пароль');
    expect(host.textContent).not.toContain('does not exist');
    expect(JSON.stringify(localStorage)).not.toContain('Secret123');
  });

  it('registers with a separate nickname and requests email confirmation', async () => {
    await clickButton('Регистрация');
    await fill('register-nickname', 'CircleHero');
    await fill('register-email', 'hero@example.com');
    await fill('register-password', 'Secret123');
    await clickButton('Создать аккаунт');

    expect(authMocks.signUp).toHaveBeenCalledWith({
      email: 'hero@example.com',
      password: 'Secret123',
      options: {
        emailRedirectTo: `${window.location.origin}/auth?confirmed=1`,
        data: { nickname: 'CircleHero' },
      },
    });
    expect(host.textContent).toContain('письмо с подтверждением');
  });

  it('returns the same recovery response when the provider returns an error', async () => {
    await clickButton('Забыли пароль?');
    await fill('recovery-email', 'unknown@example.com');
    await clickButton('Отправить письмо');

    expect(authMocks.resetPasswordForEmail).toHaveBeenCalled();
    expect(host.textContent).toContain('Если аккаунт с таким адресом существует');
    expect(host.textContent).not.toContain('not found');
  });

  async function fill(id: string, value: string) {
    const input = host.querySelector<HTMLInputElement>(`#${id}`);
    if (!input) throw new Error(`Missing input ${id}`);
    await act(async () => {
      setNativeInputValue(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  async function clickButton(text: string) {
    const button = [...host.querySelectorAll('button')].find(
      (candidate) => candidate.textContent?.trim() === text,
    );
    if (!button) throw new Error(`Missing button ${text}`);
    await act(async () => button.click());
  }
});

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
}
