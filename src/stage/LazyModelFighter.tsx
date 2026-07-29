'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

/**
 * Defers the whole rigged-model layer out of the initial bundle.
 *
 * `ModelFighter` pulls in the GLTF loader, the humanoid rig resolver and every
 * pose table — a meaningful amount of JavaScript that is useless to a player
 * whose model files are missing, and useless to everyone until the first frame
 * of a match. Following the same pattern as `LazyPostEffects`.
 *
 * The primitive blockout renders in the meantime, so there is no blank frame.
 */
const DeferredModelFighter = dynamic(
  () => import('./ModelFighter').then((module) => module.ModelFighter),
  { loading: () => null, ssr: false },
);

interface LazyModelFighterProps {
  readonly url: string;
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
  readonly fallback?: ReactNode;
}

export function LazyModelFighter({
  url,
  auraColor,
  fighterId,
  fallback = null,
}: LazyModelFighterProps) {
  return (
    <DeferredModelFighter
      auraColor={auraColor}
      fallback={fallback}
      fighterId={fighterId}
      url={url}
    />
  );
}
