import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../app/authContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';
import { LoginForm } from './auth/LoginForm';
import { PasswordUpdateForm } from './auth/PasswordUpdateForm';
import { RecoveryForm } from './auth/RecoveryForm';
import { RegisterForm } from './auth/RegisterForm';

export type AuthView = 'login' | 'register' | 'recovery' | 'reset';

export function Auth() {
  const [view, setView] = useState<AuthView>(() =>
    new URLSearchParams(window.location.search).get('mode') === 'reset' ? 'reset' : 'login',
  );
  const [, navigate] = useLocation();
  const { enterGuestMode, status } = useAuth();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setView('reset');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="auth-stack">
        <SupabaseSetupMessage />
        <GuestButton onGuest={enterGuestMode} navigate={navigate} />
      </div>
    );
  }
  if (status === 'authenticated' && view !== 'reset') {
    return (
      <section className="auth-card">
        <p className="auth-message">Вы уже вошли в аккаунт.</p>
        <button className="button button--primary" onClick={() => navigate('/profile')}>
          Открыть профиль
        </button>
      </section>
    );
  }

  return (
    <section className="auth-card">
      {view !== 'reset' && (
        <div className="auth-tabs" role="tablist" aria-label="Способ входа">
          <Tab active={view === 'login'} onClick={() => setView('login')}>Вход</Tab>
          <Tab active={view === 'register'} onClick={() => setView('register')}>Регистрация</Tab>
        </div>
      )}
      {view === 'login' && <LoginForm onRecovery={() => setView('recovery')} />}
      {view === 'register' && <RegisterForm />}
      {view === 'recovery' && <RecoveryForm onBack={() => setView('login')} />}
      {view === 'reset' && <PasswordUpdateForm onDone={() => navigate('/profile')} />}
      {view !== 'reset' && (
        <>
          <div className="auth-divider"><span>или</span></div>
          <GuestButton onGuest={enterGuestMode} navigate={navigate} />
        </>
      )}
      <p className="auth-privacy">
        Email нужен только для входа. Другие игроки его не видят.
      </p>
    </section>
  );
}

function Tab({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={active ? 'auth-tab auth-tab--active' : 'auth-tab'}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function GuestButton({ onGuest, navigate }: {
  onGuest: () => Promise<void>;
  navigate: (path: string) => void;
}) {
  return (
    <button
      type="button"
      className="button button--secondary"
      onClick={() => void onGuest().then(() => navigate('/profile'))}
    >
      Продолжить как гость
    </button>
  );
}
