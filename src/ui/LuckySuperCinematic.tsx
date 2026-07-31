'use client';

import { useRenderStore } from '@/src/store/renderStore';
import styles from './LuckySuperCinematic.module.css';

const COPY = {
  winningStreak: ['WINNING STREAK', 'УСКОРЕНИЕ ПОДТВЕРЖДЕНО'],
  houseAdvantage: ['HOUSE ADVANTAGE', 'МАРШРУТЫ ОТКРЫТЫ'],
  impossibleOutcome: ['IMPOSSIBLE OUTCOME', 'ПОБЕДНАЯ ЛИНИЯ ВЫБРАНА'],
} as const;

export function LuckySuperCinematic() {
  const effects = useRenderStore((state) => state.effectsEnabled);
  const fighterId = useRenderStore((state) => state.luckySuperFighterId);
  const kind = useRenderStore((state) => state.luckySuperKind);
  const version = useRenderStore((state) => state.luckySuperVersion);
  if (!effects || fighterId === null || kind === null || version === 0) return null;

  const [title, result] = COPY[kind];
  return (
    <section
      key={version}
      aria-label={`Lucky ${title}`}
      className={styles.cinematic}
      data-side={fighterId}
    >
      <div className={styles.freeze} />
      <div className={styles.outcomes} aria-hidden="true">
        <i>MISS</i><i>BLOCK</i><i>COUNTER</i><i>WIN</i>
      </div>
      <div className={styles.line} />
      <div className={styles.title}>
        <small>LUCK PROTOCOL // 100</small>
        <strong>{title}</strong>
        <span>{result}</span>
      </div>
    </section>
  );
}
