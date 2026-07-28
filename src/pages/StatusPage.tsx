import { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import {
  isMatchServerConfigured,
  matchServerHttpUrl,
} from '../game/network/matchServerUrl';
import { isSupabaseConfigured } from '../lib/supabase';

type ServiceStatus = 'checking' | 'operational' | 'degraded' | 'not-configured';

export function StatusPage() {
  const [matchServer, setMatchServer] = useState<ServiceStatus>(
    isMatchServerConfigured() ? 'checking' : 'not-configured',
  );

  useEffect(() => {
    if (!isMatchServerConfigured()) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5_000);
    fetch(`${matchServerHttpUrl()}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((response) => setMatchServer(response.ok ? 'operational' : 'degraded'))
      .catch(() => setMatchServer('degraded'))
      .finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Public test status"
        title="Состояние Circle Clash"
        description="Проверка клиентской сборки, аккаунтов и отдельного сервера матчей."
      />
      <div className="service-status-grid">
        <ServiceCard
          name="Игровой клиент"
          status="operational"
          detail={`Сборка ${import.meta.env.VITE_RELEASE || 'local'}`}
        />
        <ServiceCard
          name="Сервер матчей"
          status={matchServer}
          detail="Приватные онлайн-бои и переподключение"
        />
        <ServiceCard
          name="Аккаунты"
          status={isSupabaseConfigured ? 'operational' : 'not-configured'}
          detail="Регистрация, вход и профиль через Supabase"
        />
      </div>
      <p className="status-note">
        Эта страница проверяет доступность сервисов, но не заменяет мониторинг и
        ручной тест полного матча.
      </p>
    </AppShell>
  );
}

function ServiceCard({
  name,
  status,
  detail,
}: {
  name: string;
  status: ServiceStatus;
  detail: string;
}) {
  const labels: Record<ServiceStatus, string> = {
    checking: 'Проверяем',
    operational: 'Работает',
    degraded: 'Недоступен',
    'not-configured': 'Не настроен',
  };
  return (
    <section className={`service-status service-status--${status}`}>
      <span aria-hidden="true" />
      <div>
        <h2>{name}</h2>
        <strong>{labels[status]}</strong>
        <p>{detail}</p>
      </div>
    </section>
  );
}
