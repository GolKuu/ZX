import styles from './IdolCinematicActors.module.css';

const IMPACTS = ['FLASH', 'KICK', 'BEAT', 'KO'] as const;

type IdolCinematicMode = 'highlight' | 'million' | 'cancel';

export function IdolCinematicActors({
  mode,
}: {
  readonly mode: IdolCinematicMode;
}) {
  return (
    <div className={styles.actors} data-mode={mode} aria-hidden="true">
      <div className={styles.idol}>
        <i className={styles.head} />
        <i className={styles.body} />
        <i className={styles.armLeft} />
        <i className={styles.armRight} />
        <i className={styles.legLeft} />
        <i className={styles.legRight} />
        <i className={styles.microphone} />
      </div>
      <div className={styles.opponent}>
        <i className={styles.head} />
        <i className={styles.body} />
        <i className={styles.armLeft} />
        <i className={styles.armRight} />
        <i className={styles.legLeft} />
        <i className={styles.legRight} />
      </div>
      <div className={styles.impacts}>
        {IMPACTS.map((impact, index) => (
          <i key={impact} style={{ animationDelay: `${0.46 + index * 0.42}s` }}>
            {impact}
          </i>
        ))}
      </div>
      {mode === 'million' && (
        <div className={styles.chant}>
          <span>CLAP</span><span>CLAP</span><span>CLAP</span>
        </div>
      )}
      {mode === 'cancel' && (
        <div className={styles.accountCard}>
          <span>OPPONENT_02</span>
          <strong>ACCOUNT CANCELLED</strong>
        </div>
      )}
    </div>
  );
}
