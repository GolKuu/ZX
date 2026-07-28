import { CharacterSelector } from '../game/CharacterSelector';
import type { OnlineMatchClient } from '../../game/network/OnlineMatchClient';
import type { OnlineRoomView } from '../../game/network/protocol';
import type { OnlineConnectionStatus } from '../../game/network/OnlineSocket';
import { NetworkStatusBadge } from './NetworkStatusBadge';
import { OnlinePlayerStatus } from './OnlinePlayerStatus';
import { RoomInviteCard } from './RoomInviteCard';

export function OnlineRoomLobby({
  client,
  room,
  status,
  pingMs,
  error,
  onLeave,
}: {
  client: OnlineMatchClient;
  room: OnlineRoomView;
  status: OnlineConnectionStatus;
  pingMs: number | null;
  error: string;
  onLeave: () => void;
}) {
  const localId = client.credentials.playerId;
  const opponentId = localId === 'player1' ? 'player2' : 'player1';
  const local = room.players[localId];
  const opponent = room.players[opponentId];
  const inviteUrl = `${window.location.origin}/online/${room.roomCode}`;

  return (
    <div className="online-room">
      <div className="online-room__topline">
        <NetworkStatusBadge status={status} pingMs={pingMs} />
        <button type="button" className="button button--secondary" onClick={onLeave}>
          Выйти из комнаты
        </button>
      </div>
      <RoomInviteCard roomCode={room.roomCode} inviteUrl={inviteUrl} />
      <div className="online-players">
        <OnlinePlayerStatus title="Вы" player={local} />
        <span className="online-versus">VS</span>
        <OnlinePlayerStatus title="Друг" player={opponent} />
      </div>
      {local && (
        <CharacterSelector
          playerId={localId}
          value={local.characterId}
          opponentCharacterId={opponent?.characterId ?? local.characterId}
          onChange={(characterId) => client.selectCharacter(characterId)}
        />
      )}
      <section className="online-ready">
        <div>
          <p className="eyebrow">Подтверждение</p>
          <h2>{opponent ? 'Оба игрока в комнате' : 'Ждём второго игрока'}</h2>
          <p>После готовности обоих сервер автоматически запустит бой.</p>
        </div>
        <button
          type="button"
          className="button button--primary button--large"
          disabled={!opponent || status !== 'connected'}
          onClick={() => client.setReady(!local?.ready)}
        >
          {local?.ready ? 'Отменить готовность' : 'Я готов'}
        </button>
      </section>
      {error && <p className="setup-error" role="alert">{error}</p>}
    </div>
  );
}
