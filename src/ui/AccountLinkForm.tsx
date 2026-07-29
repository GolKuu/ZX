import type { FormEvent } from 'react';
import styles from './AccountLinkDialog.module.css';

export type AccountRequestState = 'idle' | 'sending' | 'sent' | 'error';

export function AccountLinkForm({
  email,
  errorMessage,
  requestState,
  titleId,
  onChange,
  onSubmit,
}: {
  readonly email: string;
  readonly errorMessage: string;
  readonly requestState: AccountRequestState;
  readonly titleId: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (requestState === 'sent') {
    return (
      <div className={styles.sent} role="status">
        <h2 id={titleId}>Проверьте почту</h2>
        <p>Мы отправили безопасную ссылку входа на <strong>{email}</strong>.</p>
      </div>
    );
  }
  return (
    <>
      <h2 id={titleId}>Привязать аккаунт</h2>
      <p>Получите ссылку входа без пароля и сохраните игровой прогресс.</p>
      <form onSubmit={onSubmit}>
        <label htmlFor="account-email">Email</label>
        <input
          autoComplete="email"
          autoFocus
          id="account-email"
          placeholder="name@example.com"
          required
          type="email"
          value={email}
          onChange={(event) => onChange(event.target.value)}
        />
        {requestState === 'error' && <small role="alert">{errorMessage}</small>}
        <button disabled={requestState === 'sending'} type="submit">
          {requestState === 'sending' ? 'Отправляем…' : 'Отправить ссылку'}
        </button>
      </form>
    </>
  );
}
