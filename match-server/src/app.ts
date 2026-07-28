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
    },
    bodyLimit: 16 * 1_024,
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

  const timer = setInterval(() => {
    rooms.tickAll();
    teamRooms.tickAll();
  }, 1_000 / 60);
  timer.unref();
  app.addHook('onClose', async () => clearInterval(timer));
  return { app, rooms, teamRooms };
}
