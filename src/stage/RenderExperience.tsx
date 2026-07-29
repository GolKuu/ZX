'use client';

import { useEffect } from 'react';
import { useHudStore } from '@/src/store/hudStore';
import { PlayOverlay } from '@/src/ui/PlayOverlay';
import { RenderCanvas } from './RenderCanvas';
import styles from './RenderExperience.module.css';

export function RenderExperience() {
  useEffect(() => {
    useHudStore.getState().openModeMenu();
  }, []);

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
