import { useState, type FormEvent } from 'react';
import { AUTH_MESSAGES } from '../../lib/authMessages';
import { supabase } from '../../lib/supabase';

export function LoginForm({ onRecovery }: { onRecovery: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) setMessage(AUTH_MESSAGES.login);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <label htmlFor="login-password">Пароль</label>
      <input
        id="login-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <button className="button button--primary" disabled={busy}>
        {busy ? 'Входим…' : 'Войти'}
      </button>
      <button type="button" className="auth-link" onClick={onRecovery}>
        Забыли пароль?
      </button>
      {message && <p className="auth-message auth-message--error" role="alert">{message}</p>}
    </form>
  );
}
