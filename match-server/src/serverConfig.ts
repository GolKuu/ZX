import {
  DEFAULT_INPUT_DELAY_TICKS,
} from '../../src/game/network/protocol.js';

export type ServerConfig = {
  host: string;
  port: number;
  clientOrigins: string[];
  inputDelayTicks: number;
  reconnectGraceMs: number;
};

export function loadServerConfig(
  env: NodeJS.ProcessEnv = process.env,
): ServerConfig {
  return {
    host: env.HOST || '0.0.0.0',
    port: integer(env.PORT, 8787, 1, 65_535),
    clientOrigins: (env.CLIENT_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    inputDelayTicks: integer(
      env.INPUT_DELAY_TICKS,
      DEFAULT_INPUT_DELAY_TICKS,
      0,
      12,
    ),
    reconnectGraceMs: integer(env.RECONNECT_GRACE_MS, 30_000, 5_000, 120_000),
  };
}

function integer(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}
