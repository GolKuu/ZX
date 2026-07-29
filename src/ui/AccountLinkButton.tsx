'use client';

import { type FormEvent, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSupabaseClient } from '@/src/lib/supabase';
import {
  AccountLinkForm,
  type AccountRequestState,
} from './AccountLinkForm';
import dialogStyles from './AccountLinkDialog.module.css';
import buttonStyles from './AccountLinkButton.module.css';

export function AccountLinkButton() {
  const titleId = useId();
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [requestState, setRequestState] = useState<AccountRequestState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let active = true;
    void getSupabaseClient().then((client) => {
      if (client === null || !active) return;
      void client.auth.getSession().then(({ data }) => {
        if (active) setAccountEmail(data.session?.user.email ?? null);
      });
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        setAccountEmail(session?.user.email ?? null);
        if (session !== null) setDialogOpen(false);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!dialogOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.code === 'Escape') setDialogOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [dialogOpen]);

  const openDialog = () => {
    setRequestState('idle');
    setErrorMessage('');
    setDialogOpen(true);
  };

  const sendLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = await getSupabaseClient();
    if (client === null) {
      setErrorMessage('Подключение аккаунтов пока не настроено.');
      setRequestState('error');
      return;
    }

    setRequestState('sending');
    setErrorMessage('');
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true,
      },
    });
    if (error !== null) {
      setErrorMessage('Не удалось отправить ссылку. Попробуйте ещё раз.');
      setRequestState('error');
      return;
    }
    setRequestState('sent');
  };

  const signOut = async () => {
    const client = await getSupabaseClient();
    if (client === null) return;
    await client.auth.signOut();
    setAccountEmail(null);
    setDialogOpen(false);
  };

  return (
    <>
      <button
        className={buttonStyles.trigger}
        data-connected={accountEmail !== null}
        type="button"
        onClick={openDialog}
      >
        <i aria-hidden="true" />
        <span>{accountEmail ?? 'Привязать аккаунт'}</span>
      </button>

      {dialogOpen && createPortal(
        <div
          className={dialogStyles.scrim}
          onMouseDown={() => setDialogOpen(false)}
        >
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={dialogStyles.dialog}
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Закрыть"
              className={dialogStyles.close}
              type="button"
              onClick={() => setDialogOpen(false)}
            >
              ×
            </button>
            <span className={dialogStyles.kicker}>CC//ID</span>
            {accountEmail === null ? (
              <AccountLinkForm
                email={email}
                errorMessage={errorMessage}
                requestState={requestState}
                titleId={titleId}
                onChange={setEmail}
                onSubmit={sendLink}
              />
            ) : (
              <div className={dialogStyles.connected}>
                <h2 id={titleId}>Аккаунт привязан</h2>
                <p>Вы вошли с адресом <strong>{accountEmail}</strong>.</p>
                <button type="button" onClick={signOut}>Выйти из аккаунта</button>
              </div>
            )}
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
