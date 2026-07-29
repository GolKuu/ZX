import { reportClientError } from './lib/client-errors';

try {
  window.addEventListener('error', (event) => {
    reportClientError(event.error ?? new Error(event.message), {
      source: 'window.error',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportClientError(event.reason, {
      source: 'unhandledrejection',
    });
  });
} catch {
  // Monitoring setup is intentionally fail-safe.
}

export function onRouterTransitionStart(
  url: string,
  navigationType: 'push' | 'replace' | 'traverse',
) {
  performance.mark(`ccu:navigation:${navigationType}`, {
    detail: { url: url.slice(0, 200) },
  });
}
