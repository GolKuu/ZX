'use client';

import dynamic from 'next/dynamic';
import { CombatHud } from './CombatHud';
import { useRenderStore } from '@/src/store/renderStore';
import { FightControlStrip } from './FightControlStrip';
import { XrayCinematic } from './XrayCinematic';
import styles from './PlayOverlay.module.css';

const DevelopmentFpsMeter = dynamic(
  () => import('./FpsMeter').then((module) => module.FpsMeter),
  { ssr: false },
);

export function PlayOverlay() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const toggleEffects = useRenderStore((state) => state.toggleEffects);

  return (
    <div className={styles.overlay}>
      <XrayCinematic />
      <CombatHud />
      <FightControlStrip />
      {process.env.NODE_ENV !== 'production' && (
        <aside className={styles.devTools} aria-label="Development tools">
          <span className={styles.fps}><DevelopmentFpsMeter /></span>
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
