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

describe('operational endpoints', () => {
  it('reports liveness, readiness and room counts without caching', async () => {
    const server = await buildServer(config);
    servers.push(server);
    const health = await server.app.inject({ method: 'GET', url: '/health' });
    const ready = await server.app.inject({ method: 'GET', url: '/ready' });
    const status = await server.app.inject({ method: 'GET', url: '/status' });

    expect(health.statusCode).toBe(200);
    expect(health.headers['cache-control']).toBe('no-store');
    expect(health.json()).toMatchObject({
      ok: true,
      status: 'ok',
      service: 'circle-clash-match-server',
    });
    expect(ready.json()).toMatchObject({ ready: true });
    expect(status.json()).toMatchObject({ rooms: { solo: 0, team: 0 } });
  });

  it('returns a structured error for unknown routes', async () => {
    const server = await buildServer(config);
    servers.push(server);
    const response = await server.app.inject({ method: 'GET', url: '/missing' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Route not found',
    });
    expect(response.json().requestId).toEqual(expect.any(String));
  });
});
