import type { CSSProperties } from 'react';
import type { MimCinematicSide } from './MimSuperCinematic';
import styles from './MimPrankCinematic.module.css';

const CHAT = [
  ['mod_circle', 'CLIP IT'],
  ['bananaFan', 'HE BLOCKED AIR'],
  ['framePerfect', 'PEAK GAMEPLAY'],
  ['totallyReal92', 'COMMON MIM W'],
] as const;

const REACTIONS = ['+9,204', '+14,811', '+31,337'] as const;

export function MimPrankCinematic({
  side,
}: {
  readonly side: MimCinematicSide;
}) {
  return (
    <section
      aria-label={`${side.toUpperCase()} MIM Level 1 Super: Clip Farming`}
      aria-live="assertive"
      className={styles.scene}
      data-side={side}
      role="status"
    >
      <div className={styles.broadcast} aria-hidden="true">
        <header>
          <span><i /> LIVE</span>
          <b>MIM // totally ranked</b>
          <small>84,291 watching</small>
        </header>

        <div className={styles.stage}>
          <div className={styles.spotlight} />
          <div className={styles.mim}>
            <i className={styles.scarf} />
            <i className={styles.body} />
            <i className={styles.face}><b /><b /><span /></i>
            <i className={styles.arm} />
          </div>
          <div className={styles.opponent}><i /><b /></div>
          <div className={styles.fakeHit}>WHIFF</div>
          <div className={styles.recordRing} />
        </div>

        <aside>
          <strong>STREAM CHAT</strong>
          {CHAT.map(([user, message], index) => (
            <p key={user} style={{ '--order': index } as CSSProperties}>
              <i>{user}</i>
              <span>{message}</span>
            </p>
          ))}
        </aside>

        <div className={styles.reactions}>
          {REACTIONS.map((count, index) => (
            <span key={count} style={{ '--order': index } as CSSProperties}>
              {index === 0 ? 'LIKE' : index === 1 ? 'STAR' : 'LOL'} {count}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.caption}>
        <small>Q + E | Level 1 Super</small>
        <strong>CLIP FARMING</strong>
        <p>&quot;Chat, are you seeing this?&quot;</p>
      </div>
    </section>
  );
}
