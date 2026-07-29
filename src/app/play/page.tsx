import type { Metadata } from 'next';
import { PlayRoute } from './PlayRoute';

export const metadata: Metadata = {
  title: 'Render Lab',
  description:
    'Explore Circle Clash Ultimate’s real-time cel shading, inked outlines, aura, bloom, and impact effects.',
  alternates: {
    canonical: '/play',
  },
  openGraph: {
    title: 'Circle Clash Ultimate Render Lab',
    description: 'A live WebGL showcase of cel-shaded combat effects.',
    url: '/play',
  },
};

export default function PlayPage() {
  return <PlayRoute />;
}
