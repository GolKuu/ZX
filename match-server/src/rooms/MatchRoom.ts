import type { WebSocket } from 'ws';
import type { PlayerId } from '../../../src/game/core/types.js';
import {
  SNAPSHOT_INTERVAL_TICKS,
  type ClientControlMessage,
  type OnlineRoomStatus,
} from '../../../src/game/network/protocol.js';
import { AuthoritativeMatch } from '../simulation/AuthoritativeMatch.js';
import { PlayerInputTimeline } from '../simulation/PlayerInputTimeline.js';
import { RoomCommands } from './RoomCommands.js';
import { RoomConnections } from './RoomConnections.js';
import { RoomOutput } from './RoomOutput.js';
import { roomView, type RoomOptions, type RoomPlayer } from './RoomTypes.js';

const PLAYER_IDS: readonly PlayerId[] = ['player1', 'player2'];

export class MatchRoom {
  readonly matchId: string;
  readonly roomCode: string;
  readonly players: Partial<Record<PlayerId, RoomPlayer>> = {};
  private readonly clock;
  private readonly output;
  private readonly commands;
  private readonly connections;
  private status: OnlineRoomStatus = 'waiting';
  private match: AuthoritativeMatch | null = null;
  private wallTick = 0;

  constructor(private readonly options: RoomOptions) {
    this.matchId = options.matchId;
    this.roomCode = options.roomCode;
    this.clock = options.clock ?? { now: () => Date.now() };
    this.output = new RoomOutput({
      matchId: this.matchId,
      now: () => this.clock.now(),
      view: () => this.view,
      match: () => this.match,
      players: () => this.players,
    });
    this.commands = new RoomCommands({
      matchId: this.matchId,
      status: () => this.status,
      setStatus: (status) => { this.status = status; },
      match: () => this.match,
      players: () => this.players,
      inputs: () => this.inputTimelines,
      startMatch: () => this.startMatch(),
      output: this.output,
      now: () => this.clock.now(),
    });
    this.connections = new RoomConnections({
      reconnectGraceMs: options.reconnectGraceMs,
      now: () => this.clock.now(),
      status: () => this.status,
      setStatus: (status) => { this.status = status; },
      view: () => this.view,
      match: () => this.match,
      players: () => this.players,
      output: this.output,
    });
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

  handle(playerId: PlayerId, message: ClientControlMessage) {
    this.commands.handle(this.requiredPlayer(playerId), message);
  }

  tick() {
    this.wallTick += 1;
    this.connections.checkDeadline();
    if (this.status === 'playing' && this.match) {
      this.match.step(this.inputTimelines);
      if (this.match.snapshot.matchWinner) {
        this.status = 'finished';
        this.output.broadcastRoom();
      }
      if (this.match.tick % SNAPSHOT_INTERVAL_TICKS === 0) {
        this.output.broadcastSnapshot();
      }
    }
    if (this.wallTick % 60 === 0) this.output.pingPlayers();
  }

  recordPong(playerId: PlayerId) {
    this.output.recordPong(this.requiredPlayer(playerId));
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

  private startMatch() {
    this.match = new AuthoritativeMatch({
      player1: this.players.player1!.characterId,
      player2: this.players.player2!.characterId,
    });
    this.status = 'playing';
    this.output.broadcastSnapshot();
  }

  private get inputTimelines() {
    return {
      player1: this.players.player1!.input,
      player2: this.players.player2!.input,
    };
  }

  private requiredPlayer(playerId: PlayerId) {
    const player = this.players[playerId];
    if (!player) throw new Error('PLAYER_NOT_FOUND');
    return player;
  }
}
