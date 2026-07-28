import type { OnlineConnectionStatus } from '../../game/network/OnlineSocket';

const labels: Record<OnlineConnectionStatus, string> = {
  connecting: 'Подключение…',
  connected: 'В сети',
  reconnecting: 'Переподключение…',
  disconnected: 'Связь потеряна',
};

export function NetworkStatusBadge({
  status,
  pingMs,
}: {
  status: OnlineConnectionStatus;
  pingMs: number | null;
}) {
  return (
    <span className={`network-badge network-badge--${status}`}>
      <span aria-hidden="true" />
      {labels[status]}
      {pingMs !== null && status === 'connected' ? ` · ${pingMs} ms` : ''}
    </span>
  );
}
