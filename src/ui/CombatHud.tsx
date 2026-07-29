'use client';

import { useEffect } from 'react';
import { useHudStore } from '@/src/store/hudStore';
import type {
  HudFighterSnapshot,
  HudSnapshot,
} from '@/src/hud/types';
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
      <div className={styles.topHud}>
        <PlayerBay fighter={snapshot.fighters[0]} />
        <CentrePlate snapshot={snapshot} />
        <PlayerBay fighter={snapshot.fighters[1]} />
      </div>

      <ComboCounter snapshot={snapshot} />

      <div className={styles.utilityControls}>
        <button aria-label="Pause match" type="button" onClick={openPause}>
          <span aria-hidden="true">Ⅱ</span> Pause
        </button>
      </div>

      <MatchMenus />
    </div>
  );
}

function PlayerBay({ fighter }: { readonly fighter: HudFighterSnapshot }) {
  const healthPercent = percentage(fighter.health, fighter.maxHealth);
  const lowHealth = healthPercent <= 25;
  const superReady = fighter.superCharge >= 100;
  return (
    <section
      aria-label={`${fighter.playerTag} ${fighter.displayName}`}
      className={`${styles.playerBay} ${
        fighter.side === 'right' ? styles.playerBayRight : ''
      }`}
    >
      <CharacterPortrait fighter={fighter} />
      <div className={styles.playerReadout}>
        <div className={styles.nameRow}>
          <strong>{fighter.displayName}</strong>
          <span>{fighter.health} / {fighter.maxHealth}</span>
        </div>
        <div
          aria-label={`${fighter.playerTag} health ${Math.round(healthPercent)} percent`}
          aria-valuemax={fighter.maxHealth}
          aria-valuemin={0}
          aria-valuenow={fighter.health}
          className={`${styles.healthBar} ${lowHealth ? styles.lowHealth : ''}`}
          role="meter"
        >
          <u style={{ width: `${healthPercent}%` }} />
          <i style={{ width: `${healthPercent}%` }} />
        </div>
        <div className={styles.meterRow}>
          <b>{fighter.playerTag}</b>
          <span className={superReady ? styles.superReady : ''}>
            {superReady ? 'Super ready' : 'Super'}
          </span>
          <div
            aria-label={`${fighter.playerTag} super charge ${fighter.superCharge} percent`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={fighter.superCharge}
            className={`${styles.superMeter} ${
              superReady ? styles.superMeterReady : ''
            }`}
            role="meter"
          >
            <i style={{ width: `${fighter.superCharge}%` }} />
            <u aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CharacterPortrait({
  fighter,
}: {
  readonly fighter: HudFighterSnapshot;
}) {
  const portraitMark = fighter.displayName === 'Void Walker' ? 'V' : 'Z';
  return (
    <figure className={styles.portrait}>
      <span className={styles.portraitMark} aria-hidden="true">{portraitMark}</span>
      <i aria-hidden="true" />
      <figcaption>{fighter.playerTag}</figcaption>
    </figure>
  );
}

function CentrePlate({ snapshot }: { readonly snapshot: HudSnapshot }) {
  const seconds = Math.ceil(snapshot.timerFrames / 60);
  const critical = seconds <= 10;
  return (
    <section className={styles.centrePlate} aria-label="Round status">
      <div className={styles.timerHex}>
        <div>
          <span>Round {snapshot.round}</span>
          <strong className={critical ? styles.timerCritical : ''}>
            {String(seconds).padStart(2, '0')}
          </strong>
        </div>
      </div>
      <div className={styles.roundPips} aria-label="Round wins">
        <Pips
          count={snapshot.fighters[0].roundWins}
          label={snapshot.fighters[0].playerTag}
        />
        <i aria-hidden="true" />
        <Pips
          count={snapshot.fighters[1].roundWins}
          label={snapshot.fighters[1].playerTag}
          right
        />
      </div>
    </section>
  );
}

function Pips({
  count,
  label,
  right = false,
}: {
  readonly count: number;
  readonly label: string;
  readonly right?: boolean;
}) {
  return (
    <span
      aria-label={`${label} ${count} round wins`}
      className={right ? styles.rightPips : ''}
    >
      {[0, 1].map((index) => (
        <b key={index} data-won={index < count} />
      ))}
    </span>
  );
}

function ComboCounter({ snapshot }: { readonly snapshot: HudSnapshot }) {
  const combo = snapshot.combo;
  if (combo === null || combo.hits < 2) {
    return null;
  }
  const attacker = snapshot.fighters.find(
    (fighter) => fighter.id === combo.attackerId,
  );
  return (
    <aside
      aria-live="polite"
      className={`${styles.comboCounter} ${
        attacker?.side === 'left' ? styles.comboCounterLeft : ''
      }`}
    >
      <div>
        <strong>{combo.hits}</strong>
        <span>Hits</span>
      </div>
      <p>{combo.damage} damage</p>
    </aside>
  );
}

function percentage(value: number, maximum: number): number {
  if (maximum <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (value / maximum) * 100));
}
