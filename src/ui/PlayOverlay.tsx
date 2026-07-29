'use client';

import dynamic from 'next/dynamic';
import { CombatHud } from './CombatHud';
import { useHudStore } from '@/src/store/hudStore';
import { useRenderStore } from '@/src/store/renderStore';
import { ZoroMoveList } from './ZoroMoveList';
import styles from './PlayOverlay.module.css';

const DevelopmentFpsMeter = dynamic(
  () => import('./FpsMeter').then((module) => module.FpsMeter),
  { ssr: false },
);

export function PlayOverlay() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const toggleEffects = useRenderStore((state) => state.toggleEffects);
  const triggerImpact = useRenderStore((state) => state.triggerImpact);
  const registerPreviewHit = useHudStore((state) => state.registerPreviewHit);

  const replayImpact = () => {
    triggerImpact();
    registerPreviewHit();
  };

  return (
    <div className={styles.overlay}>
      <CombatHud />
      <ZoroMoveList />
      {process.env.NODE_ENV !== 'production' && (
        <aside className={styles.devTools} aria-label="Development tools">
          <span className={styles.fps}><DevelopmentFpsMeter /></span>
          <button type="button" onClick={replayImpact}>
            <kbd>J</kbd> Impact
          </button>
          <button
            aria-pressed={effectsEnabled}
            type="button"
            onClick={toggleEffects}
          >
            FX {effectsEnabled ? 'on' : 'off'}
          </button>
        </aside>
      )}
    </div>
  );
}
