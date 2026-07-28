import { useState, type FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';

export function Auth() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setIsError(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          shouldCreateUser: true,
        },
      });
      if (error) {
        setIsError(true);
        setMessage(error.message);
      } else {
        setMessage('Ссылка отправлена. Откройте письмо на этом устройстве.');
      }
    } catch {
      setIsError(true);
      setMessage('Не удалось отправить письмо. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card">
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          required
        />
        <button type="submit" className="button button--primary" disabled={busy}>
          {busy ? 'Отправляем…' : 'Войти или зарегистрироваться'}
        </button>
      </form>
      {message && (
        <p className={isError ? 'auth-message auth-message--error' : 'auth-message'} role="status">
          {message}
        </p>
      )}
      <p className="auth-privacy">
        Без пароля. После ссылки вход сохранится на этом устройстве.
      </p>
    </section>
  );
}
