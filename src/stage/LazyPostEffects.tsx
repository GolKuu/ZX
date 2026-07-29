'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRenderStore } from '@/src/store/renderStore';

const DeferredPostEffects = dynamic(
  () => import('./PostEffects').then((module) => module.PostEffects),
  { loading: () => null, ssr: false },
);

export function LazyPostEffects() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const [browserIsIdle, setBrowserIsIdle] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(() => setBrowserIsIdle(true), {
        timeout: 1_000,
      });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(() => setBrowserIsIdle(true), 100);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return effectsEnabled && browserIsIdle ? <DeferredPostEffects /> : null;
}
