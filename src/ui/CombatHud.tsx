'use client';

import { useEffect } from 'react';
import { useHudStore } from '@/src/store/hudStore';
import { FightHud } from './FightHud';
import { MatchMenus } from './MatchMenus';
import styles from './CombatHud.module.css';

export function CombatHud() {
  const snapshot = useHudStore((state) => state.snapshot);
  const screen = useHudStore((state) => state.screen);
  const openPause = useHudStore((state) => state.openPause);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (
        (event.code === 'Escape' || event.code === 'KeyP')
        && !event.repeat
      ) {
        event.preventDefault();
        const state = useHudStore.getState();
        if (state.screen === 'fight') {
          state.openPause();
        }
      }
    };
    window.addEventListener('keydown', keyDown);
    return () => window.removeEventListener('keydown', keyDown);
  }, []);

  return (
    <div className={styles.hudRoot} data-screen={screen}>
      <FightHud onPause={openPause} screen={screen} snapshot={snapshot} />
      <MatchMenus />
    </div>
  );
}
