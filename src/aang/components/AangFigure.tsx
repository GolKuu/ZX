import styles from './AangStage.module.css';

export function AangFigure() {
  return (
    <g data-part="root">
      <g data-part="staff" className={styles.staff}>
        <path d="M58 45 126 221" />
        <path d="m57 46-14-10m14 10 16-4" />
      </g>

      <g data-part="backLeg" className={styles.backLeg}>
        <path className={styles.pants} d="M78 161q-8 28-4 51h20l5-51Z" />
        <path className={styles.boot} d="M74 205h21v29H68q-5-6 6-12Z" />
      </g>
      <g data-part="frontLeg" className={styles.frontLeg}>
        <path className={styles.pants} d="M94 160q2 28 11 51h20l-12-54Z" />
        <path className={styles.boot} d="M104 205h21l4 28h-26q-5-7 3-13Z" />
      </g>

      <g data-part="body" className={styles.body}>
        <path className={styles.robe} d="M70 82q26-15 53 2l-5 79q-24 13-51 0Z" />
        <path className={styles.collar} d="m72 85 22 25 27-24-8-11-20 18-13-17Z" />
        <path className={styles.sash} d="M67 145q27 10 52 0l-1 18q-27 11-52 0Z" />
      </g>

      <g data-part="backArm" className={styles.backArm}>
        <path className={styles.sleeve} d="M74 91q-10-5-16 5l-19 42 16 8 27-39Z" />
        <circle className={styles.skin} cx="45" cy="145" r="8" />
      </g>
      <g data-part="frontArm" className={styles.frontArm}>
        <path className={styles.sleeve} d="M117 91q11-4 16 6l18 42-16 8-25-40Z" />
        <circle className={styles.skin} cx="144" cy="145" r="8" />
      </g>

      <g data-part="head" className={styles.head}>
        <path className={styles.neck} d="M87 73h17v17H87Z" />
        <ellipse className={styles.skin} cx="96" cy="55" rx="27" ry="31" />
        <path className={styles.ear} d="M70 52q-10-2-7 12 3 10 11 6m48-18q10-2 7 12-3 10-11 6" />
        <path data-glow className={styles.arrow} d="M96 25v24m0-24-8 11m8-11 8 11" />
        <path data-glow className={styles.eyes} d="M79 55h9m15 0h9" />
        <path className={styles.smile} d="M87 68q9 7 18 0" />
      </g>
    </g>
  );
}
