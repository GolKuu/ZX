'use client';

import { CHARACTER_ROSTER } from '@/src/data/characterRoster';
import { SUPER_METER_STOCKS } from '@/src/hud/superMeter';
import type { HudFighterSnapshot } from '@/src/hud/types';
import { BurstMeter } from './BurstMeter';
import { FighterPortrait } from './FighterPortrait';
import { meterSegments } from './meterSegments';
import styles from './PlayerStatus.module.css';

export function PlayerStatus({ fighter }: {
  readonly fighter: HudFighterSnapshot;
}) {
  const health = percentage(fighter.health, fighter.maxHealth);
  const character = CHARACTER_ROSTER.find(
    ({ displayName }) => displayName === fighter.displayName,
  );
  const characterId = character?.id ?? 'mim';
  const burstCharges = meterSegments(fighter.superCharge, SUPER_METER_STOCKS);

  return (
    <section
      aria-label={`${fighter.playerTag} ${fighter.displayName}`}
      className={styles.player}
      data-side={fighter.side}
    >
      <FighterPortrait
        characterId={characterId}
        mark={character?.mark ?? '?'}
        side={fighter.side}
      />

      <div className={styles.readout}>
        <div className={styles.name}>
          <strong>{fighter.displayName}</strong>
          <small>{fighter.playerTag}</small>
        </div>
        <div
          aria-label={`Здоровье ${Math.round(health)} процентов`}
          aria-valuemax={fighter.maxHealth}
          aria-valuemin={0}
          aria-valuenow={fighter.health}
          className={styles.health}
          data-low={health <= 25}
          role="meter"
        >
          <span aria-hidden="true" />
          <i style={{ width: `${health}%` }} />
          <u aria-hidden="true" />
        </div>
        <BurstMeter
          charges={burstCharges}
          side={fighter.side}
          ultimateReady={fighter.ultimateReady}
        />
      </div>
    </section>
  );
}

function percentage(value: number, maximum: number): number {
  if (maximum <= 0) return 0;
  return Math.max(0, Math.min(100, (value / maximum) * 100));
}
