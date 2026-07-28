import { useOptionalAuth } from '../app/authContext';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { SyncedSettingsForm } from '../components/profile/SyncedSettingsForm';

export function SettingsPage() {
  const user = useOptionalAuth()?.user;

  return (
    <AppShell compact>
      <PageHeader
        eyebrow="Экран и комфорт"
        title="Настройки"
        description="Масштаб интерфейса, тряска камеры, арена и количество мультяшных частиц для следующего боя."
      />
      <SyncedSettingsForm userId={user?.id} />
    </AppShell>
  );
}
