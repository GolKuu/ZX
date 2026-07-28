import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import Fastify, { LogController } from 'fastify';
import type { ServerConfig } from './serverConfig.js';
import { RoomManager } from './rooms/RoomManager.js';
import { TeamRoomManager } from './team/TeamRoomManager.js';
import { registerRoutes } from './transport/registerRoutes.js';

export async function buildServer(config: ServerConfig) {
  const app = Fastify({
    logController: new LogController({ disableRequestLogging: true }),
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'playerToken',
        'token',
      ],
    },
    bodyLimit: 16 * 1_024,
    trustProxy: process.env.TRUST_PROXY !== 'false',
  });
  const rooms = new RoomManager(config);
  const teamRooms = new TeamRoomManager(config);
  await app.register(cors, {
    origin: config.clientOrigins,
    methods: ['GET', 'POST'],
  });
  await app.register(websocket, {
    options: {
      maxPayload: 1_024,
      perMessageDeflate: false,
    },
  });
  registerRoutes(app, rooms, teamRooms, config);
  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode && error.statusCode >= 400
      ? error.statusCode
      : 500;
    request.log.error({
      event: 'request.error',
      err: error,
      requestId: request.id,
      statusCode,
    }, 'Request failed');
    return reply.code(statusCode).send({
      code: statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED',
      message: statusCode >= 500 ? 'Internal server error' : error.message,
      requestId: request.id,
    });
  });
  app.setNotFoundHandler((request, reply) => {
    request.log.warn({
      event: 'request.not_found',
      requestId: request.id,
      method: request.method,
      url: request.url,
    }, 'Route not found');
    return reply.code(404).send({
      code: 'NOT_FOUND',
      message: 'Route not found',
      requestId: request.id,
    });
  });

  const timer = setInterval(() => {
    rooms.tickAll();
    teamRooms.tickAll();
  }, 1_000 / 60);
  timer.unref();
  app.addHook('onClose', async () => {
    clearInterval(timer);
    app.log.info({ event: 'server.stopped' }, 'Match server stopped');
  });
  return { app, rooms, teamRooms };
}
