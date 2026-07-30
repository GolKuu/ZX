import type { CSSProperties } from 'react';
import type { MimCinematicSide } from './MimSuperCinematic';
import styles from './MimAltF4Cinematic.module.css';

const SYSTEM_MESSAGES = [
  ['Performance Assistant', 'Press Alt+F4 to improve performance.'],
  ['Matchmaking', 'Recommended difficulty: Easy.'],
  ['Combat Help', 'Have you considered blocking?'],
] as const;

const FINAL_LINES = [
  'GG. Mostly me.',
  'That’s rough.',
  'Uninstall optional.',
] as const;

export function MimAltF4Cinematic({
  side,
}: {
  readonly side: MimCinematicSide;
}) {
  return (
    <section
      aria-label={`${side.toUpperCase()} MIM Ultimate: Skill Issue`}
      aria-live="assertive"
      className={styles.scene}
      data-side={side}
      role="status"
    >
      <div className={styles.desktop} aria-hidden="true">
        <div className={styles.wallpaper}>
          <i /><i /><i />
        </div>
        {SYSTEM_MESSAGES.map(([title, message], index) => (
          <article
            className={styles.dialog}
            key={title}
            style={{ '--order': index } as CSSProperties}
          >
            <header><i>!</i><b>{title}</b><span>×</span></header>
            <p>{message}</p>
            <footer><button>OK</button><button>Definitely</button></footer>
          </article>
        ))}
        <footer className={styles.taskbar}>
          <b>◉</b><i /><i /><span>13:37</span>
        </footer>
      </div>

      <div className={styles.punch} aria-hidden="true">
        <div className={styles.mim}>
          <i className={styles.scarf} />
          <i className={styles.body} />
          <i className={styles.face}><b /><b /><span /></i>
          <i className={styles.fist} />
        </div>
        <div className={styles.target}><i /><b /></div>
        <div className={styles.hitRing} />
        <strong>ONE TAP</strong>
      </div>

      <blockquote>“You lost to this.”</blockquote>

      <div className={styles.gameOver}>
        <small>Q + F · Full meter</small>
        <strong>SKILL ISSUE</strong>
        <p>{FINAL_LINES.map((line) => <span key={line}>{line}</span>)}</p>
      </div>
    </section>
  );
}
