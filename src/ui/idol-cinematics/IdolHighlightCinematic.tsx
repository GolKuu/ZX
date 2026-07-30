import styles from './IdolHighlightCinematic.module.css';

const CAMERA_POSITIONS = ['nw', 'n', 'ne', 'w', 'e', 'sw', 'se'] as const;

export function IdolHighlightCinematic({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  return (
    <div
      aria-label={`${fighterId.toUpperCase()} IDOL Level 1 Super: Highlight`}
      aria-live="assertive"
      className={styles.scene}
      data-side={fighterId}
      role="status"
    >
      <div className={styles.stageGlow} aria-hidden="true" />
      <div className={styles.motionTrails} aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      {CAMERA_POSITIONS.map((position, index) => (
        <div
          className={styles.camera}
          data-position={position}
          key={position}
          style={{ animationDelay: `${index * 0.035}s` }}
        >
          <span>REC</span>
          <i />
        </div>
      ))}
      <div className={styles.flashes} aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      <header className={styles.title}>
        <small>Level 1 Super · Live Take</small>
        <strong>ХАЙЛАЙТ</strong>
        <span>IDOL // no retakes</span>
      </header>
      <div className={styles.takeCounter} aria-hidden="true">
        <span>CAM 07</span>
        <b>00:00:01:24</b>
      </div>
    </div>
  );
}
