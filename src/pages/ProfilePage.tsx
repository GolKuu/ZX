import { Link } from 'wouter';
import { useAuthEmail } from '../components/auth/useAuthEmail';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { isSupabaseConfigured } from '../lib/supabase';

export function ProfilePage() {
  const email = useAuthEmail();

  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Игрок"
        title="Профиль"
        description="Здесь позже появятся результаты матчей и выбранные настройки."
      />
      <section className="profile-card">
        <span className="profile-card__avatar">C</span>
        <div>
          <h2>{email ?? 'Гость Circle Clash'}</h2>
          <p>
            {email
              ? 'Профиль подключён. Локальный PvP готов к игре.'
              : isSupabaseConfigured
              ? 'Supabase подключён — можно войти в аккаунт.'
              : 'Локальный бой доступен без подключения аккаунта.'}
          </p>
        </div>
        {!email && (
          <Link href="/auth" className="button button--secondary">
            Войти
          </Link>
        )}
      </section>
    </AppShell>
  );
}
