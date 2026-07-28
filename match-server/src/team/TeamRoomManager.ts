import { randomBytes } from 'node:crypto';
import type { WebSocket } from 'ws';
import type { PlayerId } from '../../../src/game/core/types.js';
import type { RoomCredentials } from '../../../src/game/network/protocol.js';
import type { ServerConfig } from '../serverConfig.js';
import { normalizeCode, RoomError } from '../rooms/RoomManager.js';
import { TeamMatchRoom } from './TeamMatchRoom.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class TeamRoomManager {
  private readonly byCode = new Map<string, TeamMatchRoom>();
  private readonly byId = new Map<string, TeamMatchRoom>();

  constructor(
    private readonly config: Pick<ServerConfig, 'inputDelayTicks' | 'reconnectGraceMs'>,
    private readonly now = () => Date.now(),
  ) {}

  createRoom() {
    const room = new TeamMatchRoom({
      roomCode: this.uniqueCode(),
      matchId: randomBytes(16).toString('hex'),
      inputDelayTicks: this.config.inputDelayTicks,
      reconnectGraceMs: this.config.reconnectGraceMs,
      clock: { now: this.now },
    });
    this.byCode.set(room.roomCode, room);
    this.byId.set(room.matchId, room);
    return this.addPlayer(room, 'player1');
  }

  joinRoom(code: string) {
    const room = this.byCode.get(normalizeCode(code));
    if (!room) throw new RoomError('ROOM_NOT_FOUND', 404);
    if (room.players.player2) throw new RoomError('ROOM_FULL', 409);
    return this.addPlayer(room, 'player2');
  }

  connect(matchId: string, token: string, socket: WebSocket) {
    const room = this.byId.get(matchId);
    if (!room) throw new RoomError('ROOM_NOT_FOUND', 404);
    const playerId = room.authenticate(token);
    if (!playerId) throw new RoomError('INVALID_TOKEN', 401);
    room.connect(playerId, socket);
    return { room, playerId };
  }

  tickAll() {
    this.byId.forEach((room) => room.tick());
  }

  getRoom(code: string) {
    return this.byCode.get(normalizeCode(code)) ?? null;
  }

  private addPlayer(room: TeamMatchRoom, playerId: PlayerId): RoomCredentials {
    const playerToken = randomBytes(32).toString('hex');
    room.addPlayer(playerId, playerToken);
    return {
      matchId: room.matchId,
      roomCode: room.roomCode,
      playerId,
      playerToken,
    };
  }

  private uniqueCode() {
    let code = '';
    do {
      code = [...randomBytes(8)]
        .map((byte) => ALPHABET[byte % ALPHABET.length])
        .join('');
    } while (this.byCode.has(code));
    return code;
  }
}
