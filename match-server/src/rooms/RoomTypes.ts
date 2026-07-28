import type { WebSocket } from 'ws';
import type { PlayerId } from '../../../src/game/core/types.js';
import type {
  OnlineRoomStatus,
  OnlineRoomView,
  ServerMessage,
} from '../../../src/game/network/protocol.js';
import type { PlayerInputTimeline } from '../simulation/PlayerInputTimeline.js';

export type RoomPlayer = {
  playerId: PlayerId;
  token: string;
  socket: WebSocket | null;
  connected: boolean;
  ready: boolean;
  characterId: string;
  pingMs: number | null;
  rematchReady: boolean;
  disconnectedAt: number | null;
  input: PlayerInputTimeline;
};

export type RoomClock = {
  now: () => number;
};

export type RoomOptions = {
  matchId: string;
  roomCode: string;
  inputDelayTicks: number;
  reconnectGraceMs: number;
  clock?: RoomClock;
};

export function sendMessage(socket: WebSocket | null, message: ServerMessage) {
  if (!socket || socket.readyState !== socket.OPEN) return;
  socket.send(JSON.stringify(message));
}

export function roomView(
  matchId: string,
  roomCode: string,
  status: OnlineRoomStatus,
  players: Partial<Record<PlayerId, RoomPlayer>>,
  inputDelayTicks: number,
  reconnectGraceMs: number,
): OnlineRoomView {
  const views = Object.fromEntries(
    Object.entries(players).map(([id, player]) => [id, {
      playerId: player.playerId,
      connected: player.connected,
      ready: player.ready,
      characterId: player.characterId,
      pingMs: player.pingMs,
      rematchReady: player.rematchReady,
    }]),
  ) as OnlineRoomView['players'];
  return {
    matchId,
    roomCode,
    status,
    players: views,
    inputDelayTicks,
    reconnectGraceMs,
  };
}
