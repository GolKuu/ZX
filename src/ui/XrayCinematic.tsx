'use client';

import { useRenderStore } from '@/src/store/renderStore';
import styles from './XrayCinematic.module.css';

export function XrayCinematic() {
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const fighterId = useRenderStore((state) => state.xrayFighterId);
  const version = useRenderStore((state) => state.xrayVersion);

  if (!effectsEnabled || fighterId === null || version === 0) return null;

  return (
    <div
      key={version}
      aria-label={`${fighterId.toUpperCase()} X-Ray activated`}
      aria-live="assertive"
      className={styles.cinematic}
      data-side={fighterId}
      role="status"
    >
      <div className={styles.energyRing} aria-hidden="true" />
      <div className={styles.readout}>
        <span>Full charge</span>
        <strong>X-Ray</strong>
        <i>{fighterId.toUpperCase()} // Critical strike</i>
      </div>
      <div className={styles.skeleton} aria-hidden="true">
        <i className={styles.fracture} />
      </div>
      <div className={styles.flash} aria-hidden="true" />
    </div>
  );
}
