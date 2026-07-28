import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { NetworkStatusBadge } from '../components/online/NetworkStatusBadge';
import { OnlineGameCanvas } from '../game/bridge/OnlineGameCanvas';
import type { PlayerId } from '../game/core/types';
import type { OnlineMatchClient } from '../game/network/OnlineMatchClient';
import { ensureRoomConnection } from '../game/network/RoomConnection';
import { useOnlineClientState } from '../game/network/useOnlineClientState';
import { onlineRoomStore } from '../stores/onlineRoomStore';

export function OnlineFightPage() {
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
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (client || !roomCode) return;
    ensureRoomConnection(roomCode)
      .then(setClient)
      .catch(() => navigate(`/online/${roomCode}`));
  }, [client, navigate, roomCode]);

  if (!client || !state.room) {
    return <main className="fight-page"><p className="route-loading">Восстанавливаем матч…</p></main>;
  }
  const characters = roomCharacters(state.room.players);
  const winner = snapshot?.matchWinner ?? null;

  return (
    <main className="fight-page online-fight">
      <div className="online-fight__network">
        <NetworkStatusBadge status={state.connectionStatus} pingMs={state.pingMs} />
        <span>Комната {state.room.roomCode}</span>
      </div>
      <OnlineGameCanvas
        client={client}
        characters={characters}
        onExit={exit}
        onReturnToRoom={exit}
      />
      {(state.room.status === 'disconnected' ||
        state.connectionStatus === 'reconnecting') && (
        <div className="match-overlay" role="alertdialog" aria-modal="true">
          <div>
            <p className="eyebrow">Матч на паузе</p>
            <h2>Восстанавливаем соединение</h2>
            <p>Сервер хранит место игрока 30 секунд. Бой продолжится с подтверждённого состояния.</p>
            <button className="button button--secondary" onClick={exit}>Выйти</button>
          </div>
        </div>
      )}
      {winner && (
        <div className="match-overlay" role="dialog" aria-modal="true">
          <div>
            <p className="eyebrow">Авторитетный результат сервера</p>
            <h2>{winner === client.credentials.playerId ? 'Вы победили!' : 'Друг победил'}</h2>
            <p>
              Счёт: {snapshot?.wins.player1 ?? 0} : {snapshot?.wins.player2 ?? 0}
            </p>
            <button
              className="button button--primary"
              disabled={Boolean(local?.rematchReady)}
              onClick={() => client.requestRematch(true)}
            >
              {local?.rematchReady ? 'Ждём друга…' : 'Повторный матч'}
            </button>
            <button className="button button--secondary" onClick={exit}>В меню</button>
          </div>
        </div>
      )}
    </main>
  );
}

function roomCharacters(
  players: Partial<Record<PlayerId, { characterId: string }>>,
): Record<PlayerId, string> {
  return {
    player1: players.player1?.characterId ?? 'granite',
    player2: players.player2?.characterId ?? 'shira',
  };
}
