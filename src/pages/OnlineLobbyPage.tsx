import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { AppShell } from '../components/layout/AppShell';
import { PageHeader } from '../components/layout/PageHeader';
import { OnlineRoomLobby } from '../components/online/OnlineRoomLobby';
import { OnlineStartPanel } from '../components/online/OnlineStartPanel';
import type { OnlineMatchClient } from '../game/network/OnlineMatchClient';
import {
  createRoomConnection,
  ensureRoomConnection,
} from '../game/network/RoomConnection';
import { useOnlineClientState } from '../game/network/useOnlineClientState';
import { onlineRoomStore } from '../stores/onlineRoomStore';
import { isMatchServerConfigured } from '../game/network/matchServerUrl';

export function OnlineLobbyPage() {
  const params = useParams<{ roomCode?: string }>();
  const routeCode = params.roomCode?.toUpperCase() ?? '';
  const [, navigate] = useLocation();
  const [client, setClient] = useState<OnlineMatchClient | null>(() => {
    const active = onlineRoomStore.get();
    return !routeCode || active?.credentials.roomCode === routeCode ? active : null;
  });
  const [busy, setBusy] = useState(Boolean(routeCode && !client));
  const [error, setError] = useState('');
  const state = useOnlineClientState(client);

  useEffect(() => {
    if (!routeCode || client) return;
    let active = true;
    setBusy(true);
    ensureRoomConnection(routeCode)
      .then((connection) => {
        if (active) setClient(connection);
      })
      .catch((reason: unknown) => {
        if (active) setError(roomErrorMessage(reason));
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [client, routeCode]);

  useEffect(() => {
    if (state.room?.status === 'playing') {
      navigate(`/online-fight/${state.room.roomCode}`);
    }
  }, [navigate, state.room]);

  async function createRoom() {
    setBusy(true);
    setError('');
    try {
      const connection = await createRoomConnection();
      setClient(connection);
      navigate(`/online/${connection.credentials.roomCode}`);
    } catch (reason) {
      setError(roomErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  function leaveRoom() {
    onlineRoomStore.clear();
    setClient(null);
    navigate('/');
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Онлайн 1 на 1"
        title="Приватная комната"
        description="Только игроки с приглашением смогут подключиться к этому бою."
      />
      {!routeCode && !state.room && (
        <OnlineStartPanel
          busy={busy}
          error={error}
          onCreate={createRoom}
          onJoin={(code) => navigate(`/online/${code}`)}
          serverConfigured={isMatchServerConfigured()}
        />
      )}
      {routeCode && busy && !state.room && (
        <section className="center-card"><h2>Подключаемся к комнате…</h2></section>
      )}
      {state.room && client && (
        <OnlineRoomLobby
          client={client}
          room={state.room}
          status={state.connectionStatus}
          pingMs={state.pingMs}
          error={error || state.error}
          onLeave={leaveRoom}
        />
      )}
      {routeCode && error && !state.room && (
        <section className="center-card">
          <h2>Не удалось войти</h2>
          <p className="setup-error">{error}</p>
          <button className="button button--secondary" onClick={() => navigate('/online')}>
            Создать свою комнату
          </button>
        </section>
      )}
    </AppShell>
  );
}

function roomErrorMessage(reason: unknown) {
  if (!(reason instanceof Error)) return 'Не удалось подключиться к комнате.';
  if ('code' in reason && reason.code === 'ROOM_FULL') return 'В комнате уже два игрока.';
  if ('code' in reason && reason.code === 'ROOM_NOT_FOUND') return 'Комната не найдена.';
  return reason.message;
}
