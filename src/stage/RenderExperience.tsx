'use client';

import { useEffect } from 'react';
import { useRenderStore } from '@/src/store/renderStore';
import { PlayOverlay } from '@/src/ui/PlayOverlay';
import { RenderCanvas } from './RenderCanvas';
import styles from './RenderExperience.module.css';

export function RenderExperience() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyJ' && !event.repeat) {
        useRenderStore.getState().triggerImpact();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
