import { useState, type FormEvent } from 'react';
import { AUTH_MESSAGES, isStrongPassword, PASSWORD_HINT } from '../../lib/authMessages';
import { supabase } from '../../lib/supabase';

export function RegisterForm() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isStrongPassword(password)) {
      setIsError(true);
      setMessage(PASSWORD_HINT);
      return;
    }
    setBusy(true);
    setIsError(false);
    await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?confirmed=1`,
        data: { nickname: nickname.trim() },
      },
    });
    setMessage(AUTH_MESSAGES.register);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <label htmlFor="register-nickname">Ник</label>
      <input
        id="register-nickname"
        minLength={3}
        maxLength={24}
        autoComplete="nickname"
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        required
      />
      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <label htmlFor="register-password">Пароль</label>
      <input
        id="register-password"
        type="password"
        minLength={8}
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        aria-describedby="password-hint"
        required
      />
      <small id="password-hint">{PASSWORD_HINT}</small>
      <button className="button button--primary" disabled={busy}>
        {busy ? 'Создаём…' : 'Создать аккаунт'}
      </button>
      {message && (
        <p className={isError ? 'auth-message auth-message--error' : 'auth-message'} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
