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

describe('private room API', () => {
  it('creates an eight-character room and allows exactly one guest', async () => {
    const server = await buildServer(config);
    servers.push(server);
    const created = await server.app.inject({
      method: 'POST',
      url: '/rooms',
      payload: {},
    });
    const host = created.json();
    expect(created.statusCode).toBe(201);
    expect(host.roomCode).toMatch(/^[A-Z2-9]{8}$/);
    expect(host.playerId).toBe('player1');
    expect(host.playerToken).toHaveLength(64);

    const joined = await server.app.inject({
      method: 'POST',
      url: `/rooms/${host.roomCode}/join`,
      payload: {},
    });
    expect(joined.statusCode).toBe(200);
    expect(joined.json()).toMatchObject({
      matchId: host.matchId,
      roomCode: host.roomCode,
      playerId: 'player2',
    });

    const third = await server.app.inject({
      method: 'POST',
      url: `/rooms/${host.roomCode}/join`,
      payload: {},
    });
    expect(third.statusCode).toBe(409);
    expect(third.json()).toMatchObject({ code: 'ROOM_FULL' });
  });

  it('rate limits room creation by address', async () => {
    const server = await buildServer(config);
    servers.push(server);
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await server.app.inject({ method: 'POST', url: '/rooms' });
      expect(response.statusCode).toBe(201);
    }
    const limited = await server.app.inject({ method: 'POST', url: '/rooms' });
    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toMatchObject({ code: 'RATE_LIMITED' });
  });
});
