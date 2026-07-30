import type { CSSProperties } from 'react';
import styles from './IdolMillionCinematic.module.css';
import { IdolCinematicActors } from './IdolCinematicActors';

const CROWD = Array.from({ length: 64 }, (_, index) => ({
  delay: `${(index % 9) * -0.07}s`,
  height: `${42 + ((index * 17) % 52)}%`,
  left: `${(index * 97) / 63}%`,
}));

export function IdolMillionCinematic({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  return (
    <div
      aria-label={`${fighterId.toUpperCase()} IDOL Level 3 Super: One Million Followers`}
      aria-live="assertive"
      className={styles.scene}
      data-side={fighterId}
      role="status"
    >
      <div className={styles.laserField} aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <div className={styles.crowd} aria-hidden="true">
        {CROWD.map((person, index) => (
          <i
            key={index}
            style={{
              '--person-height': person.height,
              animationDelay: person.delay,
              left: person.left,
            } as CSSProperties}
          />
        ))}
      </div>
      <div className={styles.claps} aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <i key={index} style={{ animationDelay: `${0.62 + index * 0.43}s` }} />
        ))}
      </div>
      <IdolCinematicActors mode="million" />
      <header className={styles.title}>
        <small>Level 3 Super · Sold Out</small>
        <span>LIVE</span>
        <strong>1,000,000</strong>
        <b>FOLLOWERS</b>
        <em>every clap hits harder</em>
      </header>
      <div className={styles.stageEdge} aria-hidden="true">
        <span>IDOL</span><i /><i /><i /><b>WORLD TOUR</b>
      </div>
    </div>
  );
}
