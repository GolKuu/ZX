export function matchServerHttpUrl() {
  return (import.meta.env.VITE_MATCH_SERVER_URL || 'http://localhost:8787')
    .replace(/\/+$/, '');
}

export function matchServerSocketUrl(matchId: string, token: string) {
  const url = new URL(matchServerHttpUrl());
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  url.search = new URLSearchParams({ matchId, token }).toString();
  return url.toString();
}
