import type { WebSocket } from 'ws';
import type { PlayerId } from '../../../src/game/core/types.js';
import type {
  OnlineRoomView,
} from '../../../src/game/network/protocol.js';
import type { AuthoritativeMatch } from '../simulation/AuthoritativeMatch.js';
import { sendMessage, type RoomPlayer } from './RoomTypes.js';

const PLAYER_IDS: readonly PlayerId[] = ['player1', 'player2'];

type OutputSource = {
  matchId: string;
  now: () => number;
  view: () => OnlineRoomView;
  match: () => AuthoritativeMatch | null;
  players: () => Partial<Record<PlayerId, RoomPlayer>>;
};

export class RoomOutput {
  constructor(private readonly source: OutputSource) {}

  broadcastRoom() {
    const message = { type: 'roomState' as const, room: this.source.view() };
    PLAYER_IDS.forEach((id) =>
      sendMessage(this.source.players()[id]?.socket ?? null, message),
    );
  }

  broadcastSnapshot() {
    PLAYER_IDS.forEach((id) =>
      this.snapshotTo(this.source.players()[id]?.socket ?? null),
    );
  }

  snapshotTo(socket: WebSocket | null) {
    const match = this.source.match();
    if (!match) return;
    const players = this.source.players();
    sendMessage(socket, {
      type: 'snapshot',
      matchId: this.source.matchId,
      serverTick: match.tick,
      snapshot: match.snapshot,
      processedSequences: {
        player1: players.player1?.input.lastProcessedSequence ?? 0,
        player2: players.player2?.input.lastProcessedSequence ?? 0,
      },
    });
  }

  pingPlayers() {
    PLAYER_IDS.forEach((id) => {
      const player = this.source.players()[id];
      if (!player?.socket || !player.connected) return;
      player.pendingPingAt = this.source.now();
      player.socket.ping();
    });
  }

  recordPong(player: RoomPlayer) {
    if (player.pendingPingAt === null) return;
    player.pingMs = Math.max(0, this.source.now() - player.pendingPingAt);
    player.pendingPingAt = null;
    this.broadcastRoom();
  }

  error(player: RoomPlayer, code: string, message: string) {
    sendMessage(player.socket, { type: 'error', code, message });
  }
}
