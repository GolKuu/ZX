import { useState, type FormEvent } from 'react';
import { AUTH_MESSAGES, isStrongPassword, PASSWORD_HINT } from '../../lib/authMessages';
import { supabase } from '../../lib/supabase';

export function PasswordUpdateForm({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isStrongPassword(password) || password !== confirmation) {
      setMessage(password !== confirmation ? 'Пароли не совпадают.' : PASSWORD_HINT);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage(AUTH_MESSAGES.unknown);
      return;
    }
    setPassword('');
    setConfirmation('');
    setMessage(AUTH_MESSAGES.passwordChanged);
    onDone();
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>Новый пароль</h2>
      <label htmlFor="new-password">Новый пароль</label>
      <input
        id="new-password"
        type="password"
        minLength={8}
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <label htmlFor="confirm-password">Повторите пароль</label>
      <input
        id="confirm-password"
        type="password"
        minLength={8}
        autoComplete="new-password"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        required
      />
      <small>{PASSWORD_HINT}</small>
      <button className="button button--primary" disabled={busy}>
        {busy ? 'Сохраняем…' : 'Сменить пароль'}
      </button>
      {message && <p className="auth-message" role="status">{message}</p>}
    </form>
  );
}
