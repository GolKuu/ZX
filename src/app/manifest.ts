import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YZX',
    short_name: 'YZX',
    description: 'A fast browser-based 3D cel-shaded fighting game.',
    start_url: '/',
    display: 'standalone',
    background_color: '#060914',
    theme_color: '#060914',
    orientation: 'landscape',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
