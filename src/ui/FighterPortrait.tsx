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
      <i
        aria-hidden="true"
        className={styles.atlas}
        data-character={characterId}
      />
    </figure>
  );
}
