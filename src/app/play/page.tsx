import type { Metadata } from 'next';
import { PlayRoute } from './PlayRoute';

export const metadata: Metadata = {
  title: 'Играть',
  description:
    'Начните быстрый бой в Circle Clash Ultimate: локальный матч или сражение против ИИ.',
  alternates: {
    canonical: '/play',
  },
  openGraph: {
    title: 'Играть в Circle Clash Ultimate',
    description: 'Браузерный 3D-файтинг с локальными матчами и режимом против ИИ.',
    url: '/play',
  },
};

export default function PlayPage() {
  return <PlayRoute />;
}
