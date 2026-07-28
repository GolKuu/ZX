import type { WebSocket } from 'ws';
import { circleFighters } from '../../../src/game/data/characters/circleFighters.js';
import type { PlayerId } from '../../../src/game/core/types.js';
import {
  NETWORK_PROTOCOL_VERSION,
  SNAPSHOT_INTERVAL_TICKS,
  type ClientControlMessage,
  type OnlineRoomStatus,
} from '../../../src/game/network/protocol.js';
import { AuthoritativeMatch } from '../simulation/AuthoritativeMatch.js';
import { PlayerInputTimeline } from '../simulation/PlayerInputTimeline.js';
import {
  roomView,
  sendMessage,
  type RoomOptions,
  type RoomPlayer,
} from './RoomTypes.js';

const PLAYER_IDS: readonly PlayerId[] = ['player1', 'player2'];

export class MatchRoom {
  readonly matchId: string;
  readonly roomCode: string;
  readonly players: Partial<Record<PlayerId, RoomPlayer>> = {};
  private readonly clock;
  private status: OnlineRoomStatus = 'waiting';
  private match: AuthoritativeMatch | null = null;
  private wallTick = 0;

  constructor(private readonly options: RoomOptions) {
    this.matchId = options.matchId;
    this.roomCode = options.roomCode;
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
    const player = this.requiredPlayer(playerId);
    player.socket?.close(4001, 'Reconnected elsewhere');
    player.socket = socket;
    player.connected = true;
    player.disconnectedAt = null;
    if (this.status === 'disconnected' && this.everyPlayer((item) => item.connected)) {
      this.status = this.match?.snapshot.matchWinner ? 'finished' : 'playing';
      this.match?.setPaused(false);
    }
    sendMessage(socket, {
      type: 'connected',
      protocolVersion: NETWORK_PROTOCOL_VERSION,
      playerId,
      room: this.view,
    });
    this.broadcastRoom();
    this.broadcastSnapshotTo(socket);
  }

  disconnect(playerId: PlayerId, socket: WebSocket) {
    const player = this.requiredPlayer(playerId);
    if (player.socket !== socket) return;
    player.socket = null;
    player.connected = false;
    player.pendingPingAt = null;
    player.disconnectedAt = this.clock.now();
    if (this.status === 'playing') {
      this.status = 'disconnected';
      this.match?.setPaused(true);
    }
    this.broadcastRoom();
  }

  handle(playerId: PlayerId, message: ClientControlMessage) {
    const player = this.requiredPlayer(playerId);
    if (message.type === 'selectCharacter') this.selectCharacter(player, message.characterId);
    else if (message.type === 'setReady') this.setReady(player, message.ready);
    else if (message.type === 'rematch') this.setRematch(player, message.ready);
    else if (message.type === 'input') this.receiveInput(player, message.payload);
    else if (message.type === 'ping') {
      sendMessage(player.socket, {
        type: 'pong',
        clientTime: message.clientTime,
        serverTime: this.clock.now(),
      });
    } else if (message.type === 'leave') {
      player.socket?.close(1000, 'Player left');
    }
  }

  tick() {
    this.wallTick += 1;
    this.checkReconnectDeadline();
    if (this.status === 'playing' && this.match) {
      this.match.step(this.inputTimelines);
      if (this.match.snapshot.matchWinner) {
        this.status = 'finished';
        this.broadcastRoom();
      }
      if (this.match.tick % SNAPSHOT_INTERVAL_TICKS === 0) this.broadcastSnapshot();
    }
    if (this.wallTick % 60 === 0) this.pingPlayers();
  }

  recordPong(playerId: PlayerId) {
    const player = this.requiredPlayer(playerId);
    if (player.pendingPingAt === null) return;
    player.pingMs = Math.max(0, this.clock.now() - player.pendingPingAt);
    player.pendingPingAt = null;
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

  private selectCharacter(player: RoomPlayer, characterId: string) {
    if (!['waiting', 'lobby'].includes(this.status)) return;
    if (!circleFighters.some((fighter) => fighter.id === characterId)) return;
    player.characterId = characterId;
    this.clearReadiness();
    this.broadcastRoom();
  }

  private setReady(player: RoomPlayer, ready: boolean) {
    if (!['waiting', 'lobby'].includes(this.status)) return;
    player.ready = ready;
    if (this.everyPlayer((item) => item.ready && item.connected)) this.startMatch();
    this.broadcastRoom();
  }

  private setRematch(player: RoomPlayer, ready: boolean) {
    if (this.status !== 'finished' || !this.match) return;
    player.rematchReady = ready;
    if (this.everyPlayer((item) => item.rematchReady && item.connected)) {
      this.players.player1!.rematchReady = false;
      this.players.player2!.rematchReady = false;
      this.match.rematch(this.inputTimelines);
      this.status = 'playing';
      this.broadcastSnapshot();
    }
    this.broadcastRoom();
  }

  private receiveInput(
    player: RoomPlayer,
    packet: Extract<ClientControlMessage, { type: 'input' }>['payload'],
  ) {
    if (this.status !== 'playing' || !this.match) return;
    if (packet.matchId !== this.matchId) return this.error(player, 'MATCH_ID', 'Wrong match');
    const error = player.input.enqueue(packet, this.match.tick);
    if (error) this.error(player, error, 'Input rejected');
  }

  private startMatch() {
    const characters = {
      player1: this.players.player1!.characterId,
      player2: this.players.player2!.characterId,
    };
    this.match = new AuthoritativeMatch(characters);
    this.status = 'playing';
    this.broadcastSnapshot();
  }

  private checkReconnectDeadline() {
    if (this.status !== 'disconnected' || !this.match) return;
    const disconnected = PLAYER_IDS.find((id) => !this.players[id]?.connected);
    if (!disconnected) return;
    const since = this.players[disconnected]?.disconnectedAt ?? this.clock.now();
    if (this.clock.now() - since < this.options.reconnectGraceMs) return;
    const winner: PlayerId = disconnected === 'player1' ? 'player2' : 'player1';
    this.match.forfeit(winner);
    this.status = 'finished';
    this.broadcastSnapshot();
    this.broadcastRoom();
  }

  private pingPlayers() {
    PLAYER_IDS.forEach((id) => {
      const player = this.players[id];
      if (!player?.socket || !player.connected) return;
      player.pendingPingAt = this.clock.now();
      player.socket.ping();
    });
  }

  private broadcastRoom() {
    PLAYER_IDS.forEach((id) =>
      sendMessage(this.players[id]?.socket ?? null, { type: 'roomState', room: this.view }),
    );
  }

  private broadcastSnapshot() {
    PLAYER_IDS.forEach((id) => this.broadcastSnapshotTo(this.players[id]?.socket ?? null));
  }

  private broadcastSnapshotTo(socket: WebSocket | null) {
    if (!this.match) return;
    sendMessage(socket, {
      type: 'snapshot',
      matchId: this.matchId,
      serverTick: this.match.tick,
      snapshot: this.match.snapshot,
      processedSequences: {
        player1: this.players.player1?.input.lastProcessedSequence ?? 0,
        player2: this.players.player2?.input.lastProcessedSequence ?? 0,
      },
    });
  }

  private clearReadiness() {
    PLAYER_IDS.forEach((id) => {
      if (this.players[id]) this.players[id]!.ready = false;
    });
  }

  private everyPlayer(predicate: (player: RoomPlayer) => boolean) {
    return PLAYER_IDS.every((id) => {
      const player = this.players[id];
      return player ? predicate(player) : false;
    });
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

  private error(player: RoomPlayer, code: string, message: string) {
    sendMessage(player.socket, { type: 'error', code, message });
  }
}
