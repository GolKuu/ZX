import styles from './AangStage.module.css';

export function OpponentDummy() {
  return (
    <g data-opponent className={styles.opponent}>
      <circle cx="315" cy="75" r="20" />
      <path d="M315 96v69m0-49-31 32m31-32 31 32m-31 17-24 59m24-59 24 59" />
      <path className={styles.target} d="M303 116h24v32h-24Z" />
    </g>
  );
}
