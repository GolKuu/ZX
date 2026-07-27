import { Link } from 'wouter';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { isSupabaseConfigured } from '../lib/supabase';

export function ProfilePage() {
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
          <h2>Гость Circle Clash</h2>
          <p>
            {isSupabaseConfigured
              ? 'Supabase подключён — можно войти в аккаунт.'
              : 'Локальный бой доступен без подключения аккаунта.'}
          </p>
        </div>
        <Link href="/auth" className="button button--secondary">
          Войти
        </Link>
      </section>
    </AppShell>
  );
}
