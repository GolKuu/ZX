'use client';

import { useEffect, useState } from 'react';
import { fetchGloryLeaderboard, publishGloryStanding, type LeaderboardEntry } from '@/src/progression/cloudSync';
import { gloryStanding } from '@/src/progression/glory';
import { useProgressionStore } from '@/src/store/progressionStore';
import styles from './ProgressionHub.module.css';

export function LeaderboardPanel() {
  const profile = useProgressionStore((state) => state.profile);
  const hydrated = useProgressionStore((state) => state.hydrated);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'offline'>('loading');
  const standing = gloryStanding(profile);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    void publishGloryStanding(profile).finally(() => {
      void fetchGloryLeaderboard().then((next) => {
        if (!active) return;
        setEntries(next);
        setStatus(next.length > 0 ? 'ready' : 'offline');
      });
    });
    return () => { active = false; };
  }, [hydrated, profile]);

  return (
    <section className={styles.panel} aria-labelledby="leaderboard-title">
      <header className={styles.leaderboardHeader}>
        <div><small>GLOBAL GLORY // TOP 10</small><h2 id="leaderboard-title">LEADERBOARD</h2></div>
        <div className={styles.leaderboardSelf}><b>{standing.xp.toLocaleString()} XP</b><span>YOUR STANDING</span></div>
      </header>
      {status === 'offline' && <p className={styles.leaderboardEmpty}>Connect an account to publish your XP. Offline progress is still saved on this device.</p>}
      {status === 'loading' && <p className={styles.leaderboardEmpty}>Syncing the arena records…</p>}
      {entries.length > 0 && <ol className={styles.leaderboard}>
        {entries.map((entry, index) => <li key={entry.userId} data-current={entry.isCurrentUser}>
          <i>{String(index + 1).padStart(2, '0')}</i><strong>{entry.displayName}</strong>
          <span>{entry.level} LVL · {entry.wins} W</span><b>{entry.xp.toLocaleString()} XP</b>
        </li>)}
      </ol>}
      <p className={styles.leaderboardNote}>XP is earned from online quick-match wins and match performance bonuses.</p>
    </section>
  );
}
