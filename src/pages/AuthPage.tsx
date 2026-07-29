import { Auth } from '../components/Auth';
import { AuthIntro } from '../components/auth/AuthIntro';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';

export function AuthPage() {
  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Supabase Auth"
        title="Вход в Circle Clash"
        description="Одна кнопка — и ссылка для безопасного входа уже в почте."
      />
      <div className="auth-layout">
        <AuthIntro />
        <Auth />
      </div>
    </AppShell>
  );
}
