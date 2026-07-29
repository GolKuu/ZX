type ErrorRequest = Readonly<{
  method: string;
  path: string;
}>;

type ErrorContext = Readonly<{
  routePath: string;
  routeType: string;
}>;

function describeError(value: unknown) {
  if (value instanceof Error) {
    const digestValue = (value as Error & { digest?: unknown }).digest;
    return {
      digest: typeof digestValue === 'string' ? digestValue.slice(0, 160) : undefined,
      message: value.message.slice(0, 500),
      name: value.name.slice(0, 80),
      stack: value.stack?.slice(0, 4_000),
    };
  }

  return {
    message: String(value).slice(0, 500),
    name: 'UnknownError',
  };
}

export function onRequestError(
  error: unknown,
  request: ErrorRequest,
  context: ErrorContext,
) {
  console.error(JSON.stringify({
    event: 'server_error',
    ...describeError(error),
    method: request.method,
    path: request.path.split('?')[0]?.slice(0, 200),
    routePath: context.routePath,
    routeType: context.routeType,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    timestamp: new Date().toISOString(),
  }));
}
