import { useState, type FormEvent } from 'react';
import { AUTH_MESSAGES } from '../../lib/authMessages';
import { supabase } from '../../lib/supabase';

export function RecoveryForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    setMessage(AUTH_MESSAGES.recovery);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <h2>Восстановление пароля</h2>
      <label htmlFor="recovery-email">Email</label>
      <input
        id="recovery-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <button className="button button--primary" disabled={busy}>
        {busy ? 'Отправляем…' : 'Отправить письмо'}
      </button>
      <button type="button" className="auth-link" onClick={onBack}>Назад ко входу</button>
      {message && <p className="auth-message" role="status">{message}</p>}
    </form>
  );
}
