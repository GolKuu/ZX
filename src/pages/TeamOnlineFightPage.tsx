import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { NetworkStatusBadge } from '../components/online/NetworkStatusBadge';
import { OnlineGameCanvas } from '../game/bridge/OnlineGameCanvas';
import type { OnlineMatchClient } from '../game/network/OnlineMatchClient';
import { ensureTeamRoomConnection } from '../game/network/RoomConnection';
import { useOnlineClientState } from '../game/network/useOnlineClientState';
import { onlineRoomStore } from '../stores/onlineRoomStore';

export function TeamOnlineFightPage() {
  const { roomCode = '' } = useParams<{ roomCode: string }>();
  const [, navigate] = useLocation();
  const [client, setClient] = useState<OnlineMatchClient | null>(
    () => onlineRoomStore.get(),
  );
  const state = useOnlineClientState(client);
  const snapshot = client?.renderSnapshot() ?? null;
  const local = client ? state.room?.players[client.credentials.playerId] : null;
  const exit = useCallback(() => {
    onlineRoomStore.clear();
    navigate('/team-modes');
  }, [navigate]);

  useEffect(() => {
    if (client || !roomCode) return;
    ensureTeamRoomConnection(roomCode)
      .then(setClient)
      .catch(() => navigate(`/online-team/${roomCode}`));
  }, [client, navigate, roomCode]);

  if (!client || !state.room) {
    return (
      <main className="fight-page">
        <p className="route-loading">Восстанавливаем командный матч…</p>
      </main>
    );
  }
  const winner = snapshot?.matchWinner ?? null;

  return (
    <main className="fight-page online-fight">
      <div className="online-fight__network">
        <NetworkStatusBadge status={state.connectionStatus} pingMs={state.pingMs} />
        <span>Комната 2×2 {state.room.roomCode}</span>
      </div>
      <OnlineGameCanvas client={client} onExit={exit} onReturnToRoom={exit} />
      {(state.room.status === 'disconnected' ||
        state.connectionStatus === 'reconnecting') && (
        <div className="match-overlay" role="alertdialog" aria-modal="true">
          <div>
            <p className="eyebrow">Временная замена</p>
            <h2>Отключившегося игрока ведёт ИИ</h2>
            <p>Бой продолжается, а после переподключения сервер вернёт управление игроку.</p>
            <button className="button button--secondary" onClick={exit}>Выйти</button>
          </div>
        </div>
      )}
      {winner && (
        <div className="match-overlay" role="dialog" aria-modal="true">
          <div>
            <p className="eyebrow">Авторитетный результат сервера</p>
            <h2>
              {winner === client.credentials.playerId
                ? 'Ваша команда победила!'
                : 'Команда соперника победила'}
            </h2>
            <button
              className="button button--primary"
              disabled={Boolean(local?.rematchReady)}
              onClick={() => client.requestRematch(true)}
            >
              {local?.rematchReady ? 'Ждём соперника…' : 'Повторный матч'}
            </button>
            <button className="button button--secondary" onClick={exit}>
              К режимам
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
