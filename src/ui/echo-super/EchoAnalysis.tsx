import type { CSSProperties } from 'react';
import shell from './EchoSuperShell.module.css';
import styles from './EchoAnalysis.module.css';

type HologramStyle = CSSProperties & {
  readonly '--delay': string;
  readonly '--rotation': string;
  readonly '--x': string;
  readonly '--y': string;
};

const HOLOGRAMS = Array.from({ length: 24 }, (_, index) => {
  const angle = (index / 24) * Math.PI * 2;
  const radius = index % 2 === 0 ? 38 : 47;
  return {
    delay: `${(index % 6) * 34}ms`,
    rotation: `${index % 2 === 0 ? -12 : 12}deg`,
    x: `${Math.cos(angle) * radius}cqw`,
    y: `${Math.sin(angle) * radius * 0.72}vh`,
  };
});

export function EchoAnalysis({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  return (
    <section
      aria-label={`${fighterId.toUpperCase()} ECHO: Perfect Read`}
      aria-live="assertive"
      className={`${shell.scene} ${styles.scene}`}
      data-side={fighterId}
      role="status"
    >
      <div className={styles.grid} aria-hidden="true" />
      <header className={shell.header}>
        <span>Q + E // Counter sequence</span>
        <strong>Perfect Read</strong>
        <i>24 behavioral traces synchronized</i>
      </header>
      <div className={styles.target} aria-hidden="true">
        <i />
        <span>Pattern locked</span>
      </div>
      <div className={styles.holograms} aria-hidden="true">
        {HOLOGRAMS.map((item, index) => (
          <i
            className={styles.hologram}
            key={index}
            style={{
              '--delay': item.delay,
              '--rotation': item.rotation,
              '--x': item.x,
              '--y': item.y,
            } as HologramStyle}
          />
        ))}
      </div>
      <blockquote className={styles.quote}>
        <small>ECHO // COUNTER MODEL</small>
        <p>“Exactly as expected.”</p>
      </blockquote>
      <div className={styles.impact} aria-hidden="true" />
    </section>
  );
}
