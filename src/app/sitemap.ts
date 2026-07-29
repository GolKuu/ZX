import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/src/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: new URL('/', siteUrl).toString(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: new URL('/play', siteUrl).toString(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: new URL('/aang', siteUrl).toString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
