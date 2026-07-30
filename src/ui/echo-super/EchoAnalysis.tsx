import type { CSSProperties } from 'react';
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
    x: `${50 + Math.cos(angle) * radius}%`,
    y: `${53 + Math.sin(angle) * radius * 0.72}%`,
  };
});

export function EchoAnalysis({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  return (
    <section
      aria-label={`${fighterId.toUpperCase()} ECHO: Анализ`}
      aria-live="assertive"
      className={styles.scene}
      data-side={fighterId}
      role="status"
    >
      <div className={styles.grid} aria-hidden="true" />
      <header className={styles.header}>
        <span>Level 1 Super</span>
        <strong>Анализ</strong>
        <i>24 поведенческих отпечатка синхронизированы</i>
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
        <small>ECHO // вывод</small>
        <p>«Предсказуемо.»</p>
      </blockquote>
      <div className={styles.impact} aria-hidden="true" />
    </section>
  );
}
