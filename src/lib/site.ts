const FALLBACK_SITE_URL = 'https://zx-puce.vercel.app';

function withProtocol(value: string) {
  return /^https?:\/\//u.test(value) ? value : `https://${value}`;
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    FALLBACK_SITE_URL;

  return new URL(withProtocol(configuredUrl));
}
