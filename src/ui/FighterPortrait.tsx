import Image from 'next/image';
import type { CharacterId } from '@/src/data/characterRoster';
import type { HudFighterSnapshot } from '@/src/hud/types';
import styles from './FighterPortrait.module.css';

interface FighterPortraitProps {
  readonly characterId: CharacterId;
  readonly mark: string;
  readonly side: HudFighterSnapshot['side'];
}

export function FighterPortrait({
  characterId,
  mark,
  side,
}: FighterPortraitProps) {
  return (
    <figure className={styles.portrait} data-side={side}>
      <span aria-hidden="true">{mark}</span>
      {characterId === 'lucky' ? (
        <i className={styles.luckyHead} aria-hidden="true">
          <b />
          <u />
        </i>
      ) : (
        <Image
          alt=""
          fill
          priority
          sizes="9vw"
          src={`/sprites/${characterId}-profile/head.png`}
          unoptimized
        />
      )}
    </figure>
  );
}
