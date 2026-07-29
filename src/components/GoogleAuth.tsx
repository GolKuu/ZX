import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export function GoogleAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isActive) return;
      setSession(data.session);
      setErrorMessage(error?.message ?? '');
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return;
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    setIsBusy(true);
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsBusy(false);
    }
  }

  async function signOut() {
    setIsBusy(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signOut();
    setErrorMessage(error?.message ?? '');
    setIsBusy(false);
  }

  if (!isSupabaseConfigured) {
    return (
      <section className="auth-card">
        <h1>Настройте Supabase</h1>
        <p>Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файл .env.</p>
      </section>
    );
  }

  if (isLoading) {
    return <p className="auth-status">Проверяем авторизацию…</p>;
  }

  return (
    <section className="auth-card">
      {session ? (
        <>
          <p className="auth-label">Вы вошли как</p>
          <h1>{session.user.email ?? 'Пользователь Google'}</h1>
          <button className="auth-button auth-button--secondary" onClick={signOut} disabled={isBusy}>
            {isBusy ? 'Выходим…' : 'Выйти'}
          </button>
        </>
      ) : (
        <>
          <h1>Добро пожаловать</h1>
          <p>Войдите, чтобы продолжить.</p>
          <button className="auth-button" onClick={signInWithGoogle} disabled={isBusy}>
            <span className="google-mark" aria-hidden="true">G</span>
            {isBusy ? 'Открываем Google…' : 'Войти через Google'}
          </button>
        </>
      )}
      {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
    </section>
  );
}
