import { afterEach, describe, expect, it } from 'vitest';
import { buildServer } from '../src/app.js';
import type { ServerConfig } from '../src/serverConfig.js';

const config: ServerConfig = {
  host: '127.0.0.1',
  port: 0,
  clientOrigins: ['http://localhost:5173'],
  inputDelayTicks: 3,
  reconnectGraceMs: 30_000,
};

const servers: Awaited<ReturnType<typeof buildServer>>[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map(({ app }) => app.close()));
});

describe('team room API', () => {
  it('creates and joins an isolated online 2v2 room', async () => {
    const server = await buildServer(config);
    servers.push(server);
    const created = await server.app.inject({
      method: 'POST',
      url: '/team-rooms',
      payload: {},
    });
    const host = created.json();
    expect(created.statusCode).toBe(201);
    expect(host.roomCode).toMatch(/^[A-Z2-9]{8}$/);

    const joined = await server.app.inject({
      method: 'POST',
      url: `/team-rooms/${host.roomCode}/join`,
      payload: {},
    });
    expect(joined.statusCode).toBe(200);
    expect(joined.json()).toMatchObject({
      matchId: host.matchId,
      playerId: 'player2',
    });
    expect(server.teamRooms.getRoom(host.roomCode)).not.toBeNull();
    expect(server.rooms.getRoom(host.roomCode)).toBeNull();
  });
});
