import { Auth } from '../components/Auth';
import { AuthIntro } from '../components/auth/AuthIntro';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';

export function AuthPage() {
  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Аккаунт Circle Clash"
        title="Играй как гость или войди"
        description="Регистрация, подтверждение email и восстановление доступа работают через Supabase."
      />
      <div className="auth-layout">
        <AuthIntro />
        <Auth />
      </div>
    </AppShell>
  );
}
