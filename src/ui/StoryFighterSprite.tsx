'use client';

import type { CharacterId } from '@/src/data/characterRoster';
import type { StoryLine } from '@/src/story/dialogue';
import { storySpritePerformance } from '@/src/story/spritePerformance';
import styles from './StoryFighterSprite.module.css';

export function StoryFighterSprite({
  characterId,
  corrupted = false,
  expression,
  facing,
  speaking,
}: {
  readonly characterId: CharacterId;
  readonly corrupted?: boolean;
  readonly expression: StoryLine['expression'];
  readonly facing: 'left' | 'right';
  readonly speaking: boolean;
}) {
  const performance = storySpritePerformance(characterId, expression, speaking);
  const position = `${String(performance.column * 100 / 3)}% ${String(performance.row * 100 / 3)}%`;

  return (
    <div
      className={styles.actor}
      data-character={characterId}
      data-corrupted={corrupted}
      data-facing={facing}
      data-frame={performance.frame}
      data-speaking={speaking}
    >
      <span className={styles.aura} />
      <span className={styles.backlight} />
      <span className={styles.echo} style={{ backgroundPosition: position }} />
      <span className={styles.sprite} style={{ backgroundPosition: position }} />
      <span className={styles.detail} />
      <span className={styles.rim} />
      <span className={styles.groundFx} />
      <span className={styles.contact} />
    </div>
  );
}
