'use client';

import type { HudSnapshot } from '@/src/hud/types';
import type { HudScreen } from '@/src/store/hudStore';
import { CombatReadouts } from './CombatReadouts';
import { PlayerStatus } from './PlayerStatus';
import { RoundTimer } from './RoundTimer';
import styles from './FightHud.module.css';

interface FightHudProps {
  readonly onPause: () => void;
  readonly screen: HudScreen;
  readonly snapshot: HudSnapshot;
}

export function FightHud({ onPause, screen, snapshot }: FightHudProps) {
  const dimmed = screen !== 'fight';
  return (
    <div className={styles.fightHud} data-dimmed={dimmed}>
      <div className={styles.topHud}>
        <PlayerStatus fighter={snapshot.fighters[0]} />
        <RoundTimer snapshot={snapshot} />
        <PlayerStatus fighter={snapshot.fighters[1]} />
      </div>

      <CombatReadouts snapshot={snapshot} />

      <button
        aria-label="Поставить бой на паузу"
        className={styles.pauseButton}
        type="button"
        onClick={onPause}
      >
        <span aria-hidden="true">Ⅱ</span>
      </button>
    </div>
  );
}
