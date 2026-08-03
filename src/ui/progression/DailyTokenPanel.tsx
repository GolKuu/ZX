'use client';
import { useProgressionStore } from '@/src/store/progressionStore';
import { progressionText as t, tokenLabel } from '@/src/progression/i18n';
import styles from './ProgressionHub.module.css';

export function DailyTokenPanel() {
  const profile = useProgressionStore((state) => state.profile);
  const status = useProgressionStore((state) => state.daily);
  const claim = useProgressionStore((state) => state.claimDaily);
  const language = useProgressionStore((state) => state.language);
  return <section className={styles.daily} aria-live="polite">
    <div className={styles.tokenIcon} aria-hidden="true">Y</div>
    <div><small>{t(language,'daily')}</small><strong>+{profile.daily.streak % 7 === 6 ? 2 : 1}</strong>
      <p>{t(language,'balance')}: {tokenLabel(profile.tokenBalance, language)}</p></div>
    <button type="button" onClick={claim} disabled={!status?.available}>{status?.available ? t(language,'claim') : t(language,'completed')}</button>
    <footer>{status?.reason === 'CLOCK_ROLLBACK' ? 'Clock changed. Reward preserved until trusted time catches up.' :
      `${t(language,'next')}: ${status ? new Date(status.nextResetUtc).toLocaleString(language) : '—'}`}</footer>
  </section>;
}
