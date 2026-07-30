import styles from './IdolCinematicActorsBase.module.css';
import fx from './IdolCinematicActorsFx.module.css';

const IMPACTS = ['FLASH', 'KICK', 'BEAT', 'KO'] as const;

type IdolCinematicMode = 'highlight' | 'million' | 'cancel';

export function IdolCinematicActors({
  mode,
}: {
  readonly mode: IdolCinematicMode;
}) {
  return (
    <div className={`${styles.actors} ${fx.effects}`} data-mode={mode} aria-hidden="true">
      <div className={`${styles.idol} ${fx.performer}`}>
        <i className={`${styles.head} ${fx.idolHead}`} />
        <i className={`${styles.body} ${fx.idolBody}`} />
        <i className={styles.armLeft} />
        <i className={`${styles.armRight} ${fx.micArm}`} />
        <i className={styles.legLeft} />
        <i className={`${styles.legRight} ${fx.kickLeg}`} />
        <i className={styles.microphone} />
      </div>
      <div className={`${styles.opponent} ${fx.rival}`}>
        <i className={styles.head} />
        <i className={styles.body} />
        <i className={styles.armLeft} />
        <i className={styles.armRight} />
        <i className={styles.legLeft} />
        <i className={styles.legRight} />
      </div>
      <div className={fx.impacts}>
        {IMPACTS.map((impact, index) => (
          <i key={impact} style={{ animationDelay: `${0.46 + index * 0.42}s` }}>
            {impact}
          </i>
        ))}
      </div>
      {mode === 'million' && (
        <div className={fx.chant}>
          <span>CLAP</span><span>CLAP</span><span>CLAP</span>
        </div>
      )}
      {mode === 'cancel' && (
        <div className={fx.accountCard}>
          <span>OPPONENT_02</span>
          <strong>ACCOUNT CANCELLED</strong>
        </div>
      )}
    </div>
  );
}
