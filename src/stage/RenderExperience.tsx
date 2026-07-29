'use client';

import { PlayOverlay } from '@/src/ui/PlayOverlay';
import { RenderCanvas } from './RenderCanvas';
import styles from './RenderExperience.module.css';

export function RenderExperience() {
  return (
    <main className={styles.experience}>
      <div className={styles.canvas}>
        <RenderCanvas />
      </div>
      <PlayOverlay />
      <div className={styles.scanlines} aria-hidden="true" />
    </main>
  );
}
