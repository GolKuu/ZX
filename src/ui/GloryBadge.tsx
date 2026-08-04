'use client';

import { gloryStanding } from '@/src/progression/glory';
import { useProgressionStore } from '@/src/store/progressionStore';
import styles from './OnlineNotice.module.css';

/** Current Glory Road standing, shown before a quick match so the goal is visible. */
export function GloryBadge() {
  const profile = useProgressionStore((state) => state.profile);
  const standing = gloryStanding(profile);
  const next = standing.nextTier;
  return (
    <div className={styles.gloryBadge}>
      <b>Путь к славе · уровень {standing.level}</b>
      <progress max={1} value={standing.progress} />
      <span>{next === null
        ? `${standing.xp} XP · все награды открыты`
        : `${standing.xp} XP · до «${next.titleRu}» ещё ${next.xp - standing.xp} XP`}</span>
    </div>
  );
}
