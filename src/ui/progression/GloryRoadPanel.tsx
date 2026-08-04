'use client';
import { GLORY_TIERS, GLORY_XP_PER_WIN, gloryStanding, type GloryTier } from '@/src/progression/glory';
import { progressionText as t, tokenLabel } from '@/src/progression/i18n';
import { useProgressionStore } from '@/src/store/progressionStore';
import styles from './ProgressionHub.module.css';

export function GloryRoadPanel() {
  const profile = useProgressionStore((state) => state.profile);
  const language = useProgressionStore((state) => state.language);
  const standing = gloryStanding(profile);
  const remaining = standing.nextTier === null ? 0 : standing.nextTier.xp - standing.xp;
  return (
    <section className={styles.panel}>
      <header className={styles.gloryTop}>
        <div>
          <small>{t(language, 'glory')}</small>
          <strong>{t(language, 'gloryLevel')} {standing.level}</strong>
          <p>{standing.xp} {t(language, 'gloryXp')} · {standing.wins} {t(language, 'gloryWins')}</p>
        </div>
        <div className={styles.gloryMeter}>
          <progress max={1} value={standing.progress} />
          <small>{standing.nextTier === null
            ? t(language, 'gloryMax')
            : `${t(language, 'gloryNext')}: ${remaining} XP`}</small>
        </div>
      </header>
      <p className={styles.gloryRule}>{t(language, 'gloryRule')} +{GLORY_XP_PER_WIN} XP.</p>
      <ol className={styles.gloryRoad}>
        {GLORY_TIERS.map((tier) => (
          <TierRow key={tier.id} tier={tier} unlocked={tier.xp <= standing.xp} language={language} />
        ))}
      </ol>
    </section>
  );
}

function TierRow({ language, tier, unlocked }: {
  readonly language: 'en' | 'ru'; readonly tier: GloryTier; readonly unlocked: boolean;
}) {
  return (
    <li data-unlocked={unlocked}>
      <i aria-hidden="true">{unlocked ? '★' : '☆'}</i>
      <div>
        <b>{language === 'ru' ? tier.titleRu : tier.title}</b>
        <small>{tier.xp} XP</small>
      </div>
      <span>
        +{tokenLabel(tier.tokens, language)}
        {tier.cosmetics.map((cosmetic) => <em key={cosmetic}>{cosmetic}</em>)}
      </span>
    </li>
  );
}
