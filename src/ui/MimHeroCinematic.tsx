import type { MimCinematicSide } from './MimSuperCinematic';
import styles from './MimHeroCinematic.module.css';

const CHAT = [
  'SKILL ISSUE',
  'GG',
  'BRO IS COOKED',
  'REPORT PLAYER',
] as const;

export function MimHeroCinematic({
  side,
}: {
  readonly side: MimCinematicSide;
}) {
  return (
    <section
      aria-label={`${side.toUpperCase()} MIM Level 3 Super: Главный Герой`}
      aria-live="assertive"
      className={styles.scene}
      data-side={side}
      role="status"
    >
      <div className={styles.streamFrame} aria-hidden="true">
        <header>
          <span><i /> Live</span>
          <strong>MIM // RANKED</strong>
          <small>84,291 смотрят</small>
        </header>
        <aside>
          <b>STREAM CHAT</b>
          {CHAT.map((message, index) => (
            <p key={message} style={{ '--order': index } as React.CSSProperties}>
              <i>user_{319 + index * 47}</i>
              {message}
            </p>
          ))}
        </aside>
        <div className={styles.mimPointer}>
          <i />
          <b />
        </div>
        <div className={styles.target}>
          <i />
        </div>
        <div className={styles.skipButton}>
          <span>SKIP CUTSCENE</span>
          <kbd>ESC</kbd>
        </div>
        <div className={styles.crater} />
      </div>
      <div className={styles.title}>
        <small>Level 3 Super</small>
        <strong>Главный Герой</strong>
      </div>
    </section>
  );
}
