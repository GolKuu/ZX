import { useEffect, useState } from 'react';
import type { OnlineMatchClient } from './OnlineMatchClient';

export function useOnlineClientState(client: OnlineMatchClient | null) {
  const [, setRevision] = useState(0);

  useEffect(() => {
    if (!client) return;
    return client.subscribe(() => setRevision((revision) => revision + 1));
  }, [client]);

  return {
    room: client?.room ?? null,
    connectionStatus: client?.connectionStatus ?? 'connecting',
    pingMs: client?.pingMs ?? null,
    error: client?.error ?? '',
  } as const;
}
