import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../app/authContext';
import { deleteCurrentAccount } from '../../lib/accountApi';
import { AUTH_MESSAGES, isStrongPassword, PASSWORD_HINT } from '../../lib/authMessages';
import { supabase } from '../../lib/supabase';

export function SecurityPanel({ email }: { email: string }) {
  const [, navigate] = useLocation();
  const { signOut } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [deleteText, setDeleteText] = useState('');
  const [message, setMessage] = useState('');

  async function changeEmail(event: FormEvent) {
    event.preventDefault();
    await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: `${window.location.origin}/profile` },
    );
    setMessage(AUTH_MESSAGES.emailChange);
    setNewEmail('');
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (!isStrongPassword(password) || password !== confirmation) {
      setMessage(password !== confirmation ? 'Пароли не совпадают.' : PASSWORD_HINT);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? AUTH_MESSAGES.unknown : AUTH_MESSAGES.passwordChanged);
    if (!error) {
      setPassword('');
      setConfirmation('');
    }
  }

  async function removeAccount() {
    setMessage('');
    try {
      await deleteCurrentAccount();
      await supabase.auth.signOut({ scope: 'local' });
      navigate('/');
    } catch {
      setMessage('Не удалось удалить аккаунт. Войдите заново и повторите.');
    }
  }

  return (
    <section className="account-panel account-panel--wide security-panel">
      <div>
        <h2>Безопасность</h2>
        <p><strong>{email}</strong> виден только вам и используется только для входа.</p>
      </div>
      <form onSubmit={changeEmail} className="inline-account-form">
        <label>Новый email
          <input type="email" autoComplete="email" value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)} required />
        </label>
        <button className="button button--secondary">Сменить email</button>
      </form>
      <form onSubmit={changePassword} className="inline-account-form">
        <label>Новый пароль
          <input type="password" autoComplete="new-password" minLength={8} value={password}
            onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <label>Повторите пароль
          <input type="password" autoComplete="new-password" minLength={8} value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)} required />
        </label>
        <button className="button button--secondary">Сменить пароль</button>
      </form>
      <div className="security-actions">
        <button className="button button--secondary" onClick={() => void signOut().then(() => navigate('/'))}>
          Выйти
        </button>
        <label>Для удаления введите УДАЛИТЬ
          <input value={deleteText} onChange={(event) => setDeleteText(event.target.value)} />
        </label>
        <button className="button button--danger" disabled={deleteText !== 'УДАЛИТЬ'}
          onClick={() => void removeAccount()}>
          Удалить аккаунт навсегда
        </button>
      </div>
      {message && <p className="account-message" role="status">{message}</p>}
    </section>
  );
}
