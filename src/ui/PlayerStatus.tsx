'use client';

import Image from 'next/image';
import { CHARACTER_ROSTER } from '@/src/data/characterRoster';
import type { HudFighterSnapshot } from '@/src/hud/types';
import styles from './PlayerStatus.module.css';

export function PlayerStatus({ fighter }: {
  readonly fighter: HudFighterSnapshot;
}) {
  const health = percentage(fighter.health, fighter.maxHealth);
  const character = CHARACTER_ROSTER.find(
    ({ displayName }) => displayName === fighter.displayName,
  );
  const characterId = character?.id ?? 'mim';
  const burstCharges = Math.min(3, Math.floor(fighter.superCharge / 34));

  return (
    <section
      aria-label={`${fighter.playerTag} ${fighter.displayName}`}
      className={styles.player}
      data-side={fighter.side}
    >
      <figure className={styles.portrait}>
        <span aria-hidden="true">{character?.mark ?? '?'}</span>
        <Image
          alt=""
          fill
          priority
          sizes="9vw"
          src={`/sprites/${characterId}-profile/head.png`}
          unoptimized
        />
      </figure>

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
        <div className={styles.burst}>
          <b>Burst</b>
          <span>
            {[0, 1, 2].map((index) => (
              <i data-active={index < burstCharges} key={index} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}

function percentage(value: number, maximum: number): number {
  if (maximum <= 0) return 0;
  return Math.max(0, Math.min(100, (value / maximum) * 100));
}
