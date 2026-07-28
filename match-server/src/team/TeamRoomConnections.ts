import type { WebSocket } from 'ws';
import type { PlayerId } from '../../../src/game/core/types.js';
import { NETWORK_PROTOCOL_VERSION } from '../../../src/game/network/protocol.js';
import { sendMessage } from '../rooms/RoomTypes.js';
import type { TeamMatchRoom } from './TeamMatchRoom.js';

export class TeamRoomConnections {
  constructor(private readonly room: TeamMatchRoom) {}

  connect(playerId: PlayerId, socket: WebSocket) {
    const player = this.room.player(playerId);
    player.socket?.close(4001, 'Reconnected elsewhere');
    Object.assign(player, {
      socket,
      connected: true,
      disconnectedAt: null,
    });
    this.room.match?.setAiTakeover(playerId, false);
    if (this.room.status === 'disconnected' && this.room.everyPlayer((item) => item.connected)) {
      this.room.status = this.room.match?.snapshot.matchWinner ? 'finished' : 'playing';
    }
    sendMessage(socket, {
      type: 'connected',
      protocolVersion: NETWORK_PROTOCOL_VERSION,
      playerId,
      room: this.room.view,
    });
    this.room.output.room();
    this.room.output.snapshotTo(socket);
  }

  disconnect(playerId: PlayerId, socket: WebSocket) {
    const player = this.room.player(playerId);
    if (player.socket !== socket) return;
    Object.assign(player, {
      socket: null,
      connected: false,
      pendingPingAt: null,
      disconnectedAt: this.room.now(),
    });
    if (this.room.status === 'playing') {
      this.room.status = 'disconnected';
      this.room.match?.setAiTakeover(playerId, true);
    }
    this.room.output.room();
  }

  checkDeadline() {
    const match = this.room.match;
    if (this.room.status !== 'disconnected' || !match) return;
    const disconnected = (['player1', 'player2'] as const)
      .find((id) => !this.room.players[id]?.connected);
    if (!disconnected) return;
    const since = this.room.players[disconnected]?.disconnectedAt ?? this.room.now();
    if (this.room.now() - since < this.room.reconnectGraceMs) return;
    const winner: PlayerId = disconnected === 'player1' ? 'player2' : 'player1';
    match.forfeit(winner);
    this.room.status = 'finished';
    this.room.output.snapshot();
    this.room.output.room();
  }
}
