'use client';

import type { HudSnapshot } from '@/src/hud/types';
import type { HudScreen } from '@/src/store/hudStore';
import { PlayerStatus } from './PlayerStatus';
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

      <ComboCounter snapshot={snapshot} />
      {snapshot.fighters.map((fighter) => (
        <EnergyMeter fighter={fighter} key={fighter.id} />
      ))}

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

function RoundTimer({ snapshot }: { readonly snapshot: HudSnapshot }) {
  const seconds = Math.ceil(snapshot.timerFrames / 60);
  return (
    <section className={styles.centrePlate} aria-label="Статус раунда">
      <div className={styles.timerFrame}>
        <strong data-critical={seconds <= 10}>
          {String(seconds).padStart(2, '0')}
        </strong>
      </div>
      <span className={styles.roundLabel}>Round {snapshot.round}</span>
      <div className={styles.roundWins} aria-label="Победы в раундах">
        <RoundPips count={snapshot.fighters[0].roundWins} />
        <i aria-hidden="true" />
        <RoundPips count={snapshot.fighters[1].roundWins} right />
      </div>
    </section>
  );
}

function RoundPips({ count, right = false }: {
  readonly count: number;
  readonly right?: boolean;
}) {
  return (
    <span data-side={right ? 'right' : 'left'}>
      {[0, 1].map((index) => <b data-won={index < count} key={index} />)}
    </span>
  );
}

function EnergyMeter({ fighter }: {
  readonly fighter: HudSnapshot['fighters'][number];
}) {
  const level = Math.min(3, Math.floor(fighter.superCharge / 34));
  return (
    <aside className={styles.energy} data-side={fighter.side}>
      <strong>{level}</strong>
      <div>
        <span><i style={{ width: `${fighter.superCharge}%` }} /></span>
        <b>Energy</b>
      </div>
    </aside>
  );
}

function ComboCounter({ snapshot }: { readonly snapshot: HudSnapshot }) {
  const combo = snapshot.combo;
  if (combo === null || combo.hits < 2) return null;
  const attacker = snapshot.fighters.find(({ id }) => id === combo.attackerId);
  return (
    <aside
      aria-live="polite"
      className={styles.combo}
      data-side={attacker?.side ?? 'right'}
    >
      <div><strong>{combo.hits}</strong><span>Hits</span></div>
      <p>{combo.damage} <b>Dmg</b></p>
    </aside>
  );
}
