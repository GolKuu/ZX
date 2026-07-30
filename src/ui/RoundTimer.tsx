import type { HudSnapshot } from '@/src/hud/types';
import styles from './RoundTimer.module.css';

export function RoundTimer({ snapshot }: { readonly snapshot: HudSnapshot }) {
  const seconds = Math.ceil(snapshot.timerFrames / 60);
  return (
    <section className={styles.centrePlate} aria-label="Статус раунда">
      <div className={styles.timerFrame}>
        <strong data-critical={seconds <= 10}>
          {String(seconds).padStart(2, '0')}
        </strong>
      </div>
      <span className={styles.roundLabel}>Round {snapshot.round}</span>
      <div className={styles.roundWins} aria-label="Победы в раундах">
        <RoundPips count={snapshot.fighters[0].roundWins} />
        <i aria-hidden="true" />
        <RoundPips count={snapshot.fighters[1].roundWins} right />
      </div>
    </section>
  );
}

function RoundPips({ count, right = false }: {
  readonly count: number;
  readonly right?: boolean;
}) {
  return (
    <span data-side={right ? 'right' : 'left'}>
      {[0, 1, 2].map((index) => <b data-won={index < count} key={index} />)}
    </span>
  );
}
