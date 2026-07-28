import type { FastifyInstance } from 'fastify';
import type { RawData, WebSocket } from 'ws';
import type { ServerConfig } from '../serverConfig.js';
import { RoomError, RoomManager } from '../rooms/RoomManager.js';
import { TeamRoomManager } from '../team/TeamRoomManager.js';
import {
  MessageRateLimiter,
  parseClientMessage,
} from './ClientMessageParser.js';
import { ApiRateLimiter } from './ApiRateLimiter.js';

type RoomParams = { code: string };
type SocketQuery = { matchId?: string; token?: string };

export function registerRoutes(
  app: FastifyInstance,
  rooms: RoomManager,
  teamRooms: TeamRoomManager,
  config: ServerConfig,
) {
  const roomCreates = new ApiRateLimiter(20, 60_000);
  const roomJoins = new ApiRateLimiter(60, 60_000);
  app.get('/health', async () => ({ ok: true, service: 'circle-clash-match-server' }));

  app.post('/rooms', async (request, reply) => {
    if (!roomCreates.allow(request.ip)) return rateLimitError(reply);
    return reply.code(201).send(rooms.createRoom());
  });

  app.post<{ Params: RoomParams }>('/rooms/:code/join', async (request, reply) => {
    if (!roomJoins.allow(request.ip)) return rateLimitError(reply);
    try {
      return reply.code(200).send(rooms.joinRoom(request.params.code));
    } catch (error) {
      return roomError(reply, error);
    }
  });

  app.post('/team-rooms', async (_request, reply) => {
    return reply.code(201).send(teamRooms.createRoom());
  });

  app.post<{ Params: RoomParams }>('/team-rooms/:code/join', async (request, reply) => {
    try {
      return reply.code(200).send(teamRooms.joinRoom(request.params.code));
    } catch (error) {
      return roomError(reply, error);
    }
  });

  app.get<{ Querystring: SocketQuery }>(
    '/ws',
    { websocket: true },
    (socket, request) => {
      if (!originAllowed(request.headers.origin, config.clientOrigins)) {
        socket.close(1008, 'Origin not allowed');
        return;
      }
      const { matchId, token } = request.query;
      if (!matchId || !token) {
        socket.close(1008, 'Missing credentials');
        return;
      }
      connectSocket(socket, matchId, token, rooms, teamRooms);
    },
  );
}

function connectSocket(
  socket: WebSocket,
  matchId: string,
  token: string,
  rooms: RoomManager,
  teamRooms: TeamRoomManager,
) {
  let connection:
    | ReturnType<RoomManager['connect']>
    | ReturnType<TeamRoomManager['connect']>;
  try {
    connection = rooms.connect(matchId, token, socket);
  } catch (error) {
    if (!(error instanceof RoomError) || error.code !== 'ROOM_NOT_FOUND') {
      const code = error instanceof RoomError ? error.code : 'CONNECTION_REJECTED';
      socket.close(1008, code);
      return;
    }
    try {
      connection = teamRooms.connect(matchId, token, socket);
    } catch (teamError) {
      const code = teamError instanceof RoomError
        ? teamError.code
        : 'CONNECTION_REJECTED';
      socket.close(1008, code);
      return;
    }
  }
  const limiter = new MessageRateLimiter();
  socket.on('message', (raw: RawData) => {
    if (!limiter.allow(Date.now())) {
      socket.close(1008, 'Message rate exceeded');
      return;
    }
    const parsed = parseClientMessage(raw);
    if (!parsed.ok) {
      socket.send(JSON.stringify({
        type: 'error',
        code: parsed.reason,
        message: 'Message rejected',
      }));
      return;
    }
    connection.room.handle(connection.playerId, parsed.value);
  });
  socket.on('pong', () => connection.room.recordPong(connection.playerId));
  socket.on('close', () => connection.room.disconnect(connection.playerId, socket));
}

function originAllowed(origin: string | undefined, allowed: string[]) {
  return !origin || allowed.includes(origin);
}

function roomError(
  reply: {
    code: (statusCode: number) => { send: (payload: unknown) => unknown };
  },
  error: unknown,
) {
  if (error instanceof RoomError) {
    return reply.code(error.statusCode).send({
      code: error.code,
      message: error.code,
    });
  }
  throw error;
}

function rateLimitError(reply: {
  code: (statusCode: number) => { send: (payload: unknown) => unknown };
}) {
  return reply.code(429).send({
    code: 'RATE_LIMITED',
    message: 'Too many room requests',
  });
}
