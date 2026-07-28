import { randomBytes } from 'node:crypto';
import type { WebSocket } from 'ws';
import type { PlayerId } from '../../../src/game/core/types.js';
import type { RoomCredentials } from '../../../src/game/network/protocol.js';
import type { ServerConfig } from '../serverConfig.js';
import { MatchRoom } from './MatchRoom.js';

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 8;
const MAX_ROOM_AGE_MS = 60 * 60 * 1_000;

type ManagedRoom = {
  room: MatchRoom;
  createdAt: number;
};

export class RoomManager {
  private readonly roomsByCode = new Map<string, ManagedRoom>();
  private readonly roomsById = new Map<string, ManagedRoom>();

  constructor(
    private readonly config: Pick<
      ServerConfig,
      'inputDelayTicks' | 'reconnectGraceMs'
    >,
    private readonly now = () => Date.now(),
  ) {}

  createRoom() {
    const roomCode = this.uniqueCode();
    const matchId = randomBytes(16).toString('hex');
    const managed: ManagedRoom = {
      room: new MatchRoom({
        roomCode,
        matchId,
        inputDelayTicks: this.config.inputDelayTicks,
        reconnectGraceMs: this.config.reconnectGraceMs,
        clock: { now: this.now },
      }),
      createdAt: this.now(),
    };
    this.roomsByCode.set(roomCode, managed);
    this.roomsById.set(matchId, managed);
    return this.addPlayer(managed.room, 'player1');
  }

  joinRoom(code: string) {
    const managed = this.roomsByCode.get(normalizeCode(code));
    if (!managed) throw new RoomError('ROOM_NOT_FOUND', 404);
    if (managed.room.players.player2) throw new RoomError('ROOM_FULL', 409);
    return this.addPlayer(managed.room, 'player2');
  }

  connect(matchId: string, token: string, socket: WebSocket) {
    const managed = this.roomsById.get(matchId);
    if (!managed) throw new RoomError('ROOM_NOT_FOUND', 404);
    const playerId = managed.room.authenticate(token);
    if (!playerId) throw new RoomError('INVALID_TOKEN', 401);
    managed.room.connect(playerId, socket);
    return { room: managed.room, playerId };
  }

  tickAll() {
    this.roomsById.forEach(({ room }) => room.tick());
    this.cleanup();
  }

  getRoom(code: string) {
    return this.roomsByCode.get(normalizeCode(code))?.room ?? null;
  }

  private addPlayer(room: MatchRoom, playerId: PlayerId): RoomCredentials {
    const playerToken = randomBytes(32).toString('hex');
    room.addPlayer(playerId, playerToken);
    return {
      matchId: room.matchId,
      roomCode: room.roomCode,
      playerId,
      playerToken,
    };
  }

  private cleanup() {
    this.roomsById.forEach((managed, matchId) => {
      if (this.now() - managed.createdAt <= MAX_ROOM_AGE_MS) return;
      if (['playing', 'disconnected'].includes(managed.room.view.status)) return;
      this.roomsById.delete(matchId);
      this.roomsByCode.delete(managed.room.roomCode);
    });
  }

  private uniqueCode() {
    let code: string;
    do {
      const bytes = randomBytes(ROOM_CODE_LENGTH);
      code = [...bytes]
        .map((byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length])
        .join('');
    } while (this.roomsByCode.has(code));
    return code;
  }
}

export class RoomError extends Error {
  constructor(
    readonly code: string,
    readonly statusCode: number,
  ) {
    super(code);
  }
}

export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}
