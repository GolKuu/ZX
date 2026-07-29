'use client';

import { CombatHud } from './CombatHud';
import { useRenderStore } from '@/src/store/renderStore';
import { FightControlStrip } from './FightControlStrip';
import { FpsMeter } from './FpsMeter';
import { XrayCinematic } from './XrayCinematic';
import styles from './PlayOverlay.module.css';

export function PlayOverlay() {
  return (
    <div className={styles.overlay}>
      <XrayCinematic />
      <CombatHud />
      <FightControlStrip />
      {process.env.NODE_ENV !== 'production' && <DevelopmentTools />}
    </div>
  );
}

function DevelopmentTools() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const toggleEffects = useRenderStore((state) => state.toggleEffects);
  return (
    <aside className={styles.devTools} aria-label="Development tools">
      <span className={styles.fps}><FpsMeter /></span>
      <button
        aria-pressed={effectsEnabled}
        type="button"
        onClick={toggleEffects}
      >
        FX {effectsEnabled ? 'on' : 'off'}
      </button>
    </aside>
  );
}
