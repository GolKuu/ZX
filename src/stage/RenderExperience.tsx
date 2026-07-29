'use client';

import { useEffect } from 'react';
import { useRenderStore } from '@/src/store/renderStore';
import { useHudStore } from '@/src/store/hudStore';
import { PlayOverlay } from '@/src/ui/PlayOverlay';
import type { ZoroActionId } from './zoro/zoroActions';
import { RenderCanvas } from './RenderCanvas';
import styles from './RenderExperience.module.css';

const ZORO_HOTKEYS: Readonly<Record<string, ZoroActionId>> = {
  KeyJ: 'lightPunch',
  KeyK: 'heavyPunch',
  KeyN: 'lightKick',
  KeyM: 'heavyKick',
  KeyI: 'lionSong',
  KeyO: 'ogreTwister',
  KeyC: 'poundCannon',
  KeyT: 'swordStyles',
  KeyU: 'threeThousandWorlds',
  KeyY: 'asura',
};

export function RenderExperience() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = ZORO_HOTKEYS[event.code];
      if (action !== undefined && !event.repeat) {
        event.preventDefault();
        useRenderStore.getState().playZoroAction(action);
        if (action !== 'swordStyles') {
          useHudStore.getState().registerPreviewHit();
        }
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
