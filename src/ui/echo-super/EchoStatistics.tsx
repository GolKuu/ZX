import type { CSSProperties } from 'react';
import shell from './EchoSuperShell.module.css';
import styles from './EchoStatistics.module.css';

type ShardStyle = CSSProperties & {
  readonly '--shard-angle': string;
  readonly '--shard-distance': string;
};

const SHARDS = Array.from({ length: 16 }, (_, index) => ({
  angle: `${index * 22.5}deg`,
  distance: `${8 + (index % 4) * 2}cqw`,
}));

const METRICS = [
  { className: styles.jumps, label: 'Прыжков', value: '37' },
  { className: styles.spam, label: 'Спама', value: '82%' },
  { className: styles.errors, label: 'Ошибок', value: '94%' },
] as const;

export function EchoStatistics({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  return (
    <section
      aria-label={`${fighterId.toUpperCase()} ECHO: Статистика`}
      aria-live="assertive"
      className={`${shell.scene} ${styles.scene}`}
      data-side={fighterId}
      role="status"
    >
      <div className={styles.noise} aria-hidden="true" />
      <header className={`${shell.header} ${styles.header}`}>
        <span>Ultimate Finisher</span>
        <strong>Статистика</strong>
        <i>Матч завершён // привычки классифицированы</i>
      </header>
      <div className={styles.dashboard}>
        <div className={styles.axis} aria-hidden="true">
          <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
        </div>
        <div className={styles.cards}>
          {METRICS.map((metric) => (
            <article
              className={`${styles.card} ${metric.className}`}
              key={metric.label}
            >
              <header>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </header>
              <div className={styles.chart} aria-hidden="true">
                {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
              </div>
              {metric.label === 'Ошибок' && (
                <div className={styles.shards} aria-hidden="true">
                  {SHARDS.map((shard, index) => (
                    <i
                      key={index}
                      style={{
                        '--shard-angle': shard.angle,
                        '--shard-distance': shard.distance,
                      } as ShardStyle}
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
      <blockquote className={styles.quote}>
        <small>ECHO // заключение</small>
        <p>«Я победил тебя твоими привычками.»</p>
      </blockquote>
      <div className={styles.blast} aria-hidden="true" />
    </section>
  );
}
