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
  app.get('/health', async (_request, reply) => {
    reply.header('cache-control', 'no-store');
    return healthPayload();
  });
  app.get('/ready', async (_request, reply) => {
    reply.header('cache-control', 'no-store');
    return { ...healthPayload(), ready: true };
  });
  app.get('/status', async (_request, reply) => {
    reply.header('cache-control', 'no-store');
    return {
      ...healthPayload(),
      rooms: {
        solo: rooms.activeRoomCount(),
        team: teamRooms.activeRoomCount(),
      },
    };
  });

  app.post('/rooms', async (request, reply) => {
    if (!roomCreates.allow(request.ip)) return rateLimitError(reply);
    const credentials = rooms.createRoom();
    request.log.info({
      event: 'room.created',
      matchId: credentials.matchId,
      roomCode: credentials.roomCode,
      mode: 'solo',
    }, 'Private room created');
    return reply.code(201).send(credentials);
  });

  app.post<{ Params: RoomParams }>('/rooms/:code/join', async (request, reply) => {
    if (!roomJoins.allow(request.ip)) return rateLimitError(reply);
    try {
      return reply.code(200).send(rooms.joinRoom(request.params.code));
    } catch (error) {
      return roomError(reply, error);
    }
  });

  app.post('/team-rooms', async (request, reply) => {
    if (!roomCreates.allow(request.ip)) return rateLimitError(reply);
    const credentials = teamRooms.createRoom();
    request.log.info({
      event: 'room.created',
      matchId: credentials.matchId,
      roomCode: credentials.roomCode,
      mode: 'team',
    }, 'Private team room created');
    return reply.code(201).send(credentials);
  });

  app.post<{ Params: RoomParams }>('/team-rooms/:code/join', async (request, reply) => {
    if (!roomJoins.allow(request.ip)) return rateLimitError(reply);
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
  header: (name: string, value: string) => unknown;
  code: (statusCode: number) => { send: (payload: unknown) => unknown };
}) {
  reply.header('retry-after', '60');
  return reply.code(429).send({
    code: 'RATE_LIMITED',
    message: 'Too many room requests',
  });
}

function healthPayload() {
  return {
    ok: true,
    status: 'ok',
    service: 'circle-clash-match-server',
    version: process.env.npm_package_version || 'dev',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}
