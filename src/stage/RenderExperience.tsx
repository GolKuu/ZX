'use client';

import { useEffect } from 'react';
import { useHudStore } from '@/src/store/hudStore';
import { useRenderStore } from '@/src/store/renderStore';
import { PlayOverlay } from '@/src/ui/PlayOverlay';
import { RenderCanvas } from './RenderCanvas';
import { useProgressionStore } from '@/src/store/progressionStore';
import { ProgressionNotifications } from '@/src/ui/progression/ProgressionNotifications';
import styles from './RenderExperience.module.css';

export function RenderExperience() {
  const fighterSelection = useHudStore((state) => state.fighterSelection);
  const arenaId = useHudStore((state) => state.arenaId);
  const screen = useHudStore((state) => state.screen);

  useEffect(() => {
    useRenderStore.getState().hydratePreferences();
    useProgressionStore.getState().hydrate();
    useHudStore.getState().openModeMenu();
  }, []);

  return (
    <main className={styles.experience}>
      <div className={styles.canvas}>
        <RenderCanvas arenaId={arenaId} fighterSelection={fighterSelection} />
      </div>
      <PlayOverlay />
      {screen !== 'story-scene' && <ProgressionNotifications />}
    </main>
  );
}
