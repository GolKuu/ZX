import { Link } from 'wouter';
import { useAuth } from '../app/authContext';
import { AccountProfile } from '../components/profile/AccountProfile';
import { GuestProfile } from '../components/profile/GuestProfile';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';

export function ProfilePage() {
  const { status, user } = useAuth();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Игровой аккаунт"
        title="Профиль"
        description="Публичная карточка бойца, игровые настройки и безопасность аккаунта."
      />
      {status === 'loading' && <p className="profile-status">Проверяем сессию…</p>}
      {status === 'authenticated' && user && <AccountProfile user={user} />}
      {status === 'guest' && <GuestProfile />}
      {status === 'signedOut' && (
        <section className="profile-card">
          <span className="profile-card__avatar">C</span>
          <div>
            <h2>Вы не вошли</h2>
            <p>Войдите для облачной синхронизации или продолжите в гостевом режиме.</p>
          </div>
          <Link href="/auth" className="button button--primary">Войти</Link>
        </section>
      )}
    </AppShell>
  );
}
