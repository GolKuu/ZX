import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { getSiteUrl } from '@/src/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: 'Circle Clash Ultimate',
  title: {
    default: 'Circle Clash Ultimate',
    template: '%s | Circle Clash Ultimate',
  },
  description:
    'A fast browser-based 3D fighting game with cel-shaded combat and cinematic impact effects.',
  category: 'games',
  keywords: ['browser fighting game', 'cel-shaded fighter', 'WebGL game', 'indie game'],
  creator: 'Circle Clash Ultimate',
  publisher: 'Circle Clash Ultimate',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Circle Clash Ultimate',
    description: 'Cel-shaded 3D combat built for a smooth 60 FPS browser experience.',
    siteName: 'Circle Clash Ultimate',
    locale: 'ru_RU',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Circle Clash Ultimate',
    description: 'Cel-shaded 3D combat built for a smooth 60 FPS browser experience.',
  },
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050019',
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
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
