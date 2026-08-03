'use client';
import { useMemo, useState } from 'react';
import { ACHIEVEMENTS } from '@/src/progression/achievements';
import type { AchievementCategory } from '@/src/progression/types';
import { useProgressionStore } from '@/src/store/progressionStore';
import styles from './ProgressionHub.module.css';

const CATEGORIES: readonly ('all' | AchievementCategory)[] = ['all','general','combat','story','tutorial','training','mastery','collection','challenge','secret','longTerm'];
export function AchievementsPanel() {
  const [category,setCategory] = useState<(typeof CATEGORIES)[number]>('all');
  const states = useProgressionStore((state) => state.profile.achievements);
  const visible = useMemo(() => ACHIEVEMENTS.filter((item) => category === 'all' || item.category === category),[category]);
  const completed = ACHIEVEMENTS.filter((item) => states[item.id]?.completedAt !== undefined).length;
  return <section className={styles.panel}>
    <header><h2>ACHIEVEMENTS</h2><b>{Math.round(completed / ACHIEVEMENTS.length * 100)}%</b></header>
    <nav className={styles.filters} aria-label="Achievement categories">{CATEGORIES.map((item) =>
      <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</nav>
    <div className={styles.achievementGrid}>{visible.map((item) => {
      const state = states[item.id]; const hidden = item.hidden && state?.completedAt === undefined;
      return <article key={item.id} data-complete={state?.completedAt !== undefined}>
        <span aria-hidden="true">{state?.completedAt ? '✓' : hidden ? '?' : '◇'}</span>
        <div><h3>{hidden ? 'SECRET ACHIEVEMENT' : item.title}</h3><p>{hidden ? 'Keep exploring YZX.' : item.description}</p>
          <progress value={state?.progress ?? 0} max={item.target}/><small>{state?.progress ?? 0}/{item.target} · Reward: +{item.tokenReward} TOKEN</small>
          {state?.completedAt && <time dateTime={state.completedAt}>REWARD CLAIMED · {new Date(state.completedAt).toLocaleDateString()}</time>}</div>
      </article>;
    })}</div>
  </section>;
}
