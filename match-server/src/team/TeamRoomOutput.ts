import type { WebSocket } from 'ws';
import { sendMessage, type RoomPlayer } from '../rooms/RoomTypes.js';
import type { TeamMatchRoom } from './TeamMatchRoom.js';

export class TeamRoomOutput {
  constructor(private readonly roomSource: TeamMatchRoom) {}

  room() {
    this.roomSource.eachPlayer((player) =>
      sendMessage(player.socket, { type: 'roomState', room: this.roomSource.view }),
    );
  }

  snapshot() {
    this.roomSource.eachPlayer((player) => this.snapshotTo(player.socket));
  }

  snapshotTo(socket: WebSocket | null) {
    const match = this.roomSource.match;
    if (!match) return;
    sendMessage(socket, {
      type: 'snapshot',
      matchId: this.roomSource.matchId,
      serverTick: match.tick,
      snapshot: match.snapshot,
      processedSequences: {
        player1: this.roomSource.players.player1?.input.lastProcessedSequence ?? 0,
        player2: this.roomSource.players.player2?.input.lastProcessedSequence ?? 0,
      },
    });
  }

  ping() {
    this.roomSource.eachPlayer((player) => {
      if (!player.socket || !player.connected) return;
      player.pendingPingAt = this.roomSource.now();
      player.socket.ping();
    });
  }

  pong(player: RoomPlayer, clientTime: number) {
    sendMessage(player.socket, {
      type: 'pong',
      clientTime,
      serverTime: this.roomSource.now(),
    });
  }

  error(player: RoomPlayer, code: string, message: string) {
    sendMessage(player.socket, { type: 'error', code, message });
  }
}
