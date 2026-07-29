'use client';

import Link from 'next/link';
import { FpsMeter } from './FpsMeter';
import { useRenderStore } from '@/src/store/renderStore';
import styles from './PlayOverlay.module.css';

export function PlayOverlay() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const toggleEffects = useRenderStore((state) => state.toggleEffects);
  const triggerImpact = useRenderStore((state) => state.triggerImpact);

  return (
    <div className={styles.overlay}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          CC<span>//</span>ULTIMATE
        </Link>
        <div className={styles.telemetry}>
          <span>WEBGL</span>
          <span>GPU FX</span>
          <FpsMeter />
        </div>
      </header>

      <aside className={styles.caption}>
        <span>RENDER STUDY 01</span>
        <h1>Chromatic<br />Impact</h1>
        <p>Cel light · inverted hull · procedural energy</p>
      </aside>

      <div className={styles.controls}>
        <button type="button" onClick={triggerImpact}>
          <span className={styles.key}>J</span>
          Replay impact
        </button>
        <button
          aria-pressed={effectsEnabled}
          className={effectsEnabled ? styles.active : ''}
          type="button"
          onClick={toggleEffects}
        >
          FX {effectsEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}
