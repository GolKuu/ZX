import type { MimCinematicSide } from './MimSuperCinematic';
import styles from './MimPrankCinematic.module.css';

export function MimPrankCinematic({
  side,
}: {
  readonly side: MimCinematicSide;
}) {
  return (
    <section
      aria-label={`${side.toUpperCase()} MIM Level 1 Super: Пранк`}
      aria-live="assertive"
      className={styles.scene}
      data-side={side}
      role="status"
    >
      <header>
        <small>Level 1 Super</small>
        <strong>Пранк</strong>
      </header>
      <div className={styles.action} aria-hidden="true">
        <div className={`${styles.actor} ${styles.mim}`}>
          <i className={styles.head} />
          <i className={styles.body} />
          <i className={styles.arm} />
          <i className={styles.leg} />
        </div>
        <div className={styles.banana}>
          <i />
          <i />
        </div>
        <div className={`${styles.actor} ${styles.enemy}`}>
          <i className={styles.head} />
          <i className={styles.body} />
          <i className={styles.arm} />
          <i className={styles.leg} />
        </div>
        <div className={styles.impact}>ЩЁЛК!</div>
        <div className={styles.shockwave} />
      </div>
      <footer>
        <span>01</span>
        Банановая кожура · идеальный тайминг
      </footer>
    </section>
  );
}
