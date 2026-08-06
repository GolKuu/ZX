import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { getSiteUrl } from '@/src/lib/site';
import { ThemeSync } from '@/src/ui/ThemeSync';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: 'YZX',
  title: {
    default: 'YZX',
    template: '%s | YZX',
  },
  description:
    'A fast browser-based 3D fighting game with cel-shaded combat and cinematic impact effects.',
  category: 'games',
  keywords: ['browser fighting game', 'cel-shaded fighter', 'WebGL game', 'indie game'],
  creator: 'YZX',
  publisher: 'YZX',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'YZX',
    description: 'Cel-shaded 3D combat built for a smooth 60 FPS browser experience.',
    siteName: 'YZX',
    locale: 'ru_RU',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YZX',
    description: 'Cel-shaded 3D combat built for a smooth 60 FPS browser experience.',
  },
};

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#eef3f5',
  width: 'device-width',
  initialScale: 1,
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body>
        <ThemeSync />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
