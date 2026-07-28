import type { WebSocket } from 'ws';
import type { PlayerId } from '../../../src/game/core/types.js';
import {
  NETWORK_PROTOCOL_VERSION,
  type OnlineRoomStatus,
  type OnlineRoomView,
} from '../../../src/game/network/protocol.js';
import type { AuthoritativeMatch } from '../simulation/AuthoritativeMatch.js';
import type { RoomOutput } from './RoomOutput.js';
import { sendMessage, type RoomPlayer } from './RoomTypes.js';

const PLAYER_IDS: readonly PlayerId[] = ['player1', 'player2'];

type ConnectionHost = {
  reconnectGraceMs: number;
  now: () => number;
  status: () => OnlineRoomStatus;
  setStatus: (status: OnlineRoomStatus) => void;
  view: () => OnlineRoomView;
  match: () => AuthoritativeMatch | null;
  players: () => Partial<Record<PlayerId, RoomPlayer>>;
  output: RoomOutput;
};

export class RoomConnections {
  constructor(private readonly host: ConnectionHost) {}

  connect(playerId: PlayerId, socket: WebSocket) {
    const player = this.player(playerId);
    player.socket?.close(4001, 'Reconnected elsewhere');
    Object.assign(player, {
      socket,
      connected: true,
      disconnectedAt: null,
    });
    if (this.host.status() === 'disconnected' && this.everyPlayer((item) => item.connected)) {
      this.host.setStatus(this.host.match()?.snapshot.matchWinner ? 'finished' : 'playing');
      this.host.match()?.setPaused(false);
    }
    sendMessage(socket, {
      type: 'connected',
      protocolVersion: NETWORK_PROTOCOL_VERSION,
      playerId,
      room: this.host.view(),
    });
    this.host.output.broadcastRoom();
    this.host.output.snapshotTo(socket);
  }

  disconnect(playerId: PlayerId, socket: WebSocket) {
    const player = this.player(playerId);
    if (player.socket !== socket) return;
    Object.assign(player, {
      socket: null,
      connected: false,
      pendingPingAt: null,
      disconnectedAt: this.host.now(),
    });
    if (this.host.status() === 'playing') {
      this.host.setStatus('disconnected');
      this.host.match()?.setPaused(true);
    }
    this.host.output.broadcastRoom();
  }

  checkDeadline() {
    const match = this.host.match();
    if (this.host.status() !== 'disconnected' || !match) return;
    const disconnected = PLAYER_IDS.find((id) => !this.host.players()[id]?.connected);
    if (!disconnected) return;
    const since = this.host.players()[disconnected]?.disconnectedAt ?? this.host.now();
    if (this.host.now() - since < this.host.reconnectGraceMs) return;
    const winner: PlayerId = disconnected === 'player1' ? 'player2' : 'player1';
    match.forfeit(winner);
    this.host.setStatus('finished');
    this.host.output.broadcastSnapshot();
    this.host.output.broadcastRoom();
  }

  private everyPlayer(predicate: (player: RoomPlayer) => boolean) {
    return PLAYER_IDS.every((id) => {
      const player = this.host.players()[id];
      return player ? predicate(player) : false;
    });
  }

  private player(playerId: PlayerId) {
    const player = this.host.players()[playerId];
    if (!player) throw new Error('PLAYER_NOT_FOUND');
    return player;
  }
}
