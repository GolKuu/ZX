export function matchServerHttpUrl() {
  const configuredUrl = import.meta.env.VITE_MATCH_SERVER_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, '');
  if (import.meta.env.DEV) return 'http://localhost:8787';
  throw new MatchServerConfigurationError();
}

export function isMatchServerConfigured() {
  return Boolean(import.meta.env.VITE_MATCH_SERVER_URL?.trim()) || import.meta.env.DEV;
}

export function matchServerSocketUrl(matchId: string, token: string) {
  const url = new URL(matchServerHttpUrl());
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  url.search = new URLSearchParams({ matchId, token }).toString();
  return url.toString();
}

export class MatchServerConfigurationError extends Error {
  readonly code = 'SERVER_NOT_CONFIGURED';

  constructor() {
    super(
      'Онлайн-сервер не подключён к этой сборке. Можно сыграть против ИИ без подключения.',
    );
  }
}
