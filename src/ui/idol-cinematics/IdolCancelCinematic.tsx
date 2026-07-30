import styles from './IdolCancelCinematic.module.css';
import { IdolCinematicActors } from './IdolCinematicActors';

const COMMENTS = [
  'L', 'Ratio', 'Uninstall', 'Muted', 'Skill issue', 'L', 'Ratio',
  'Unfollowed', 'Uninstall', 'Blocked', 'L', 'Ratio', 'Try again',
] as const;

export function IdolCancelCinematic({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  return (
    <div
      aria-label={`${fighterId.toUpperCase()} IDOL Ultimate Finisher: Cancel`}
      aria-live="assertive"
      className={styles.scene}
      data-side={fighterId}
      role="status"
    >
      <div className={styles.chatWindow}>
        <header>
          <i />
          <b>LIVE CHAT</b>
          <span>1,000,000 online</span>
        </header>
        <div className={styles.feed}>
          {COMMENTS.map((comment, index) => (
            <p
              key={`${comment}-${index}`}
              style={{ animationDelay: `${0.14 + index * 0.11}s` }}
            >
              <i>user_{String(index * 7919).padStart(6, '0')}</i>
              <strong>{comment}</strong>
              <span>♥ {99 + index * 317}</span>
            </p>
          ))}
        </div>
      </div>
      <div className={styles.commentStorm} aria-hidden="true">
        {COMMENTS.slice(0, 9).map((comment, index) => (
          <b key={`${comment}-storm-${index}`} style={{ animationDelay: `${1 + index * 0.1}s` }}>
            {comment}
          </b>
        ))}
      </div>
      <IdolCinematicActors mode="cancel" />
      <div className={styles.ratioWave} aria-hidden="true" />
      <header className={styles.title}>
        <small>Ultimate Finisher</small>
        <strong>ОТМЕНА</strong>
        <span>ACCOUNT STATUS // CANCELLED</span>
      </header>
      <div className={styles.wink}>
        <i>★</i>
        <strong>IDOL ;)</strong>
        <span>stream ended</span>
      </div>
    </div>
  );
}
