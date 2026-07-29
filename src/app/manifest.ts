import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Circle Clash Ultimate',
    short_name: 'Circle Clash',
    description: 'A fast browser-based 3D anime fighting game.',
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
