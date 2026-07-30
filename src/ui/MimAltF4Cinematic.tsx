import type { MimCinematicSide } from './MimSuperCinematic';
import styles from './MimAltF4Cinematic.module.css';

export function MimAltF4Cinematic({
  side,
}: {
  readonly side: MimCinematicSide;
}) {
  return (
    <section
      aria-label={`${side.toUpperCase()} MIM Ultimate Finisher: ALT plus F4`}
      aria-live="assertive"
      className={styles.scene}
      data-side={side}
      role="status"
    >
      <div className={styles.look} aria-hidden="true">
        <i className={styles.face}>
          <b />
          <b />
          <span />
        </i>
        <i className={styles.hood} />
        <i className={styles.wave} />
      </div>
      <blockquote>
        «Чтобы победить меня — нажми <strong>Alt+F4</strong>.»
      </blockquote>
      <div className={styles.keys} aria-hidden="true">
        <kbd>Alt</kbd><span>+</span><kbd>F4</kbd>
      </div>
      <div className={styles.desktop} aria-hidden="true">
        <div className={styles.window}>
          <header>
            <i />
            <span>Circle Clash Ultimate</span>
            <b>— □ ×</b>
          </header>
          <div className={styles.fakeGame}>
            <i />
            <i />
            <strong>FIGHT</strong>
          </div>
        </div>
        <footer>
          <span>⊞</span>
          <i />
          <i />
          <time>13:37</time>
        </footer>
      </div>
      <div className={styles.gameOver}>
        <small>Process terminated</small>
        <strong>GAME OVER</strong>
        <span>MIM wins · flawless disconnect</span>
      </div>
    </section>
  );
}
