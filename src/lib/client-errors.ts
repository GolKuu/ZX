type ErrorContext = Readonly<Record<string, boolean | number | string | undefined>>;

const reportedErrors = new Set<string>();

function normalizeError(value: unknown) {
  if (value instanceof Error) {
    return {
      name: value.name.slice(0, 80),
      message: value.message.slice(0, 500),
      stack: value.stack?.slice(0, 3_000),
    };
  }

  return {
    name: 'UnknownError',
    message: String(value).slice(0, 500),
    stack: undefined,
  };
}

function sanitizeContext(context: ErrorContext) {
  return Object.fromEntries(
    Object.entries(context)
      .filter((entry): entry is [string, boolean | number | string] => entry[1] !== undefined)
      .slice(0, 8)
      .map(([key, value]) => [key.slice(0, 60), String(value).slice(0, 160)]),
  );
}

export function reportClientError(value: unknown, context: ErrorContext = {}) {
  if (typeof window === 'undefined') return;

  const error = normalizeError(value);
  const fingerprint = `${error.name}:${error.message}:${context.source ?? ''}`;
  if (reportedErrors.has(fingerprint)) return;
  reportedErrors.add(fingerprint);

  const report = JSON.stringify({
    ...error,
    context: sanitizeContext(context),
    path: window.location.pathname.slice(0, 200),
    timestamp: new Date().toISOString(),
  });

  void fetch('/api/errors', {
    body: report,
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    method: 'POST',
  }).catch(() => {
    // Error reporting must never interrupt the game.
  });
}
