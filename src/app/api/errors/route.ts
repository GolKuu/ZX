export const runtime = 'edge';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(record: JsonRecord, key: string, maximumLength: number) {
  const value = record[key];
  return typeof value === 'string' ? value.slice(0, maximumLength) : undefined;
}

function readContext(value: unknown) {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .slice(0, 8)
      .map(([key, item]) => [key.slice(0, 60), item.slice(0, 160)]),
  );
}

export async function POST(request: Request) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite !== null && fetchSite !== 'same-origin') {
    return new Response(null, { status: 403 });
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 8_192) {
    return new Response(null, { status: 413 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return new Response(null, { status: 400 });
  }

  console.error(JSON.stringify({
    event: 'client_error',
    context: readContext(body.context),
    message: readString(body, 'message', 500),
    name: readString(body, 'name', 80),
    path: readString(body, 'path', 200),
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    stack: readString(body, 'stack', 3_000),
    timestamp: readString(body, 'timestamp', 40),
  }));

  return new Response(null, {
    headers: { 'cache-control': 'no-store' },
    status: 202,
  });
}
