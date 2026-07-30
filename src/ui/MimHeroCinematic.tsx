import type { CSSProperties } from 'react';
import type { MimCinematicSide } from './MimSuperCinematic';
import styles from './MimHeroCinematic.module.css';

const MEME_CARDS = [
  ['404', 'DEFENSE NOT FOUND'],
  ['PING', '999 ms'],
  ['RATIO', '12 : 84K'],
  ['CHAT', 'skill issue'],
] as const;

const MOCKS = [
  'SKILL ISSUE',
  'HUGE MISTAKE',
  'THIS IS STAYING ONLINE FOREVER',
] as const;

export function MimHeroCinematic({
  side,
}: {
  readonly side: MimCinematicSide;
}) {
  return (
    <section
      aria-label={`${side.toUpperCase()} MIM Level 3 Super: Internet Moment`}
      aria-live="assertive"
      className={styles.scene}
      data-side={side}
      role="status"
    >
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.arena} aria-hidden="true">
        <div className={styles.mim}>
          <i className={styles.scarf} />
          <i className={styles.body} />
          <i className={styles.face}><b /><b /><span /></i>
          <i className={styles.point} />
        </div>
        <div className={styles.target}><i /><b /></div>
        <div className={styles.ratioBeam} />
        <div className={styles.impact}>RATIO&apos;D</div>
      </div>

      <div className={styles.cards} aria-hidden="true">
        {MEME_CARDS.map(([label, value], index) => (
          <article key={label} style={{ '--order': index } as CSSProperties}>
            <small>{label}</small>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className={styles.mockFeed}>
        {MOCKS.map((line, index) => (
          <span key={line} style={{ '--order': index } as CSSProperties}>
            {line}
          </span>
        ))}
      </div>

      <div className={styles.title}>
        <small>Q + R | Level 3 Super</small>
        <strong>INTERNET MOMENT</strong>
        <p>&quot;Skill issue.&quot;</p>
      </div>
    </section>
  );
}
