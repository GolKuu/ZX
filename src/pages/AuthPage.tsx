import { Auth } from '../components/Auth';
import { AuthIntro } from '../components/auth/AuthIntro';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';

export function AuthPage() {
  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Supabase Auth"
        title="Вход в профиль"
        description="Существующая авторизация сохранена и отделена от игровой симуляции."
      />
      <div className="two-column">
        <AuthIntro />
        <Auth />
      </div>
    </AppShell>
  );
}
