import type { WebSocket } from 'ws';
import type { PlayerId } from '../../../src/game/core/types.js';
import {
  SNAPSHOT_INTERVAL_TICKS,
  type ClientControlMessage,
  type OnlineRoomStatus,
} from '../../../src/game/network/protocol.js';
import { PlayerInputTimeline } from '../simulation/PlayerInputTimeline.js';
import { roomView, type RoomOptions, type RoomPlayer } from '../rooms/RoomTypes.js';
import { AuthoritativeTeamMatch } from './AuthoritativeTeamMatch.js';
import { TeamRoomCommands } from './TeamRoomCommands.js';
import { TeamRoomConnections } from './TeamRoomConnections.js';
import { TeamRoomOutput } from './TeamRoomOutput.js';

const PLAYER_IDS: readonly PlayerId[] = ['player1', 'player2'];

export class TeamMatchRoom {
  readonly matchId: string;
  readonly roomCode: string;
  readonly reconnectGraceMs: number;
  readonly players: Partial<Record<PlayerId, RoomPlayer>> = {};
  readonly output = new TeamRoomOutput(this);
  status: OnlineRoomStatus = 'waiting';
  match: AuthoritativeTeamMatch | null = null;
  private readonly commands = new TeamRoomCommands(this);
  private readonly connections = new TeamRoomConnections(this);
  private readonly clock;
  private wallTick = 0;

  constructor(private readonly options: RoomOptions) {
    this.matchId = options.matchId;
    this.roomCode = options.roomCode;
    this.reconnectGraceMs = options.reconnectGraceMs;
    this.clock = options.clock ?? { now: () => Date.now() };
  }

  addPlayer(playerId: PlayerId, token: string) {
    if (this.players[playerId]) throw new Error('PLAYER_SLOT_TAKEN');
    this.players[playerId] = {
      playerId,
      token,
      socket: null,
      connected: false,
      ready: false,
      characterId: playerId === 'player1' ? 'granite' : 'shira',
      pingMs: null,
      pendingPingAt: null,
      rematchReady: false,
      disconnectedAt: null,
      input: new PlayerInputTimeline(this.options.inputDelayTicks),
    };
    this.status = this.players.player1 && this.players.player2 ? 'lobby' : 'waiting';
  }

  authenticate(token: string) {
    return PLAYER_IDS.find((id) => this.players[id]?.token === token) ?? null;
  }

  connect(playerId: PlayerId, socket: WebSocket) {
    this.connections.connect(playerId, socket);
  }

  disconnect(playerId: PlayerId, socket: WebSocket) {
    this.connections.disconnect(playerId, socket);
  }

  recordPong(playerId: PlayerId) {
    const player = this.player(playerId);
    if (player.pendingPingAt === null) return;
    player.pingMs = Math.max(0, this.now() - player.pendingPingAt);
    player.pendingPingAt = null;
    this.output.room();
  }

  handle(playerId: PlayerId, message: ClientControlMessage) {
    this.commands.handle(this.player(playerId), message);
  }

  tick() {
    this.wallTick += 1;
    this.connections.checkDeadline();
    if (['playing', 'disconnected'].includes(this.status) && this.match) {
      this.match.step(this.inputTimelines);
      if (this.match.snapshot.matchWinner) {
        this.status = 'finished';
        this.output.room();
      }
      if (this.match.tick % SNAPSHOT_INTERVAL_TICKS === 0) this.output.snapshot();
    }
    if (this.wallTick % 60 === 0) this.output.ping();
  }

  startMatch() {
    this.match = new AuthoritativeTeamMatch({
      player1: this.players.player1!.characterId,
      player2: this.players.player2!.characterId,
    });
    this.status = 'playing';
    this.output.snapshot();
  }

  now() {
    return this.clock.now();
  }

  get view() {
    return roomView(
      this.matchId,
      this.roomCode,
      this.status,
      this.players,
      this.options.inputDelayTicks,
      this.options.reconnectGraceMs,
    );
  }

  get snapshot() {
    return this.match?.snapshot ?? null;
  }

  get inputTimelines() {
    return {
      player1: this.players.player1!.input,
      player2: this.players.player2!.input,
    };
  }

  player(playerId: PlayerId) {
    const player = this.players[playerId];
    if (!player) throw new Error('PLAYER_NOT_FOUND');
    return player;
  }

  eachPlayer(action: (player: RoomPlayer) => void) {
    PLAYER_IDS.forEach((id) => {
      const player = this.players[id];
      if (player) action(player);
    });
  }

  everyPlayer(predicate: (player: RoomPlayer) => boolean) {
    return PLAYER_IDS.every((id) => {
      const player = this.players[id];
      return player ? predicate(player) : false;
    });
  }
}
