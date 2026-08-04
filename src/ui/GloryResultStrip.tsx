'use client';

import { useSyncExternalStore } from 'react';
import { getOnlineSnapshot, subscribeOnline } from '@/src/online/onlineSession';
import { useProgressionStore } from '@/src/store/progressionStore';
import styles from './CombatHud.module.css';

/** Result-screen readout of the Glory XP a quick-match win just paid. */
export function GloryResultStrip() {
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineSnapshot);
  const award = useProgressionStore((state) => state.lastGlory);
  if (award === null || award.matchId !== online.matchId) return null;
  return (
    <section className={styles.gloryStrip} aria-live="polite">
      <strong>+{award.xpGained} XP СЛАВЫ</strong>
      <span>Уровень {award.level} · всего {award.totalXp} XP</span>
      {award.unlocked.map((tier) => (
        <em key={tier.id}>НАГРАДА: {tier.titleRu} · +{tier.tokens} токенов</em>
      ))}
    </section>
  );
}
