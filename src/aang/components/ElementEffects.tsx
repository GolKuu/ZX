import styles from './AangFigure.module.css';

export function ElementEffects() {
  return (
    <>
      <g data-effect="air" className={`${styles.effect} ${styles.air}`}>
        <ellipse cx="152" cy="117" rx="25" ry="34" />
        <ellipse cx="152" cy="117" rx="15" ry="23" />
        <path d="M128 103q28-25 52 2M128 131q28 25 52-2" />
      </g>

      <g data-effect="fire" className={`${styles.effect} ${styles.fire}`}>
        <path d="m137 133 12-54 14 30 14-19-5 48Z" />
        <path d="m148 133 8-31 8 18 7-9-3 24Z" />
      </g>

      <g data-effect="earth" className={`${styles.effect} ${styles.earth}`}>
        <path d="m136 160 12-45 14 46Zm21 0 15-64 18 65Z" />
        <circle cx="140" cy="151" r="7" />
        <circle cx="181" cy="146" r="6" />
      </g>

      <g data-effect="water" className={`${styles.effect} ${styles.water}`}>
        <path d="M132 127q34-42 73 0t71-6" />
        <path d="M132 137q42-30 78 2t67-8" />
        <circle cx="190" cy="107" r="4" />
        <circle cx="225" cy="145" r="3" />
      </g>

      <g data-effect="wall" className={`${styles.effect} ${styles.wall}`}>
        <path d="m175 224 5-92 21-23 22 18 8 97Z" />
        <path d="m185 211 12-36 17 17m-28-43 17 8 14-20" />
      </g>

      <g data-effect="elements" className={`${styles.effect} ${styles.elements}`}>
        <ellipse className={styles.airRing} cx="99" cy="132" rx="61" ry="27" />
        <ellipse className={styles.fireRing} cx="99" cy="132" rx="54" ry="39" />
        <ellipse className={styles.earthRing} cx="99" cy="132" rx="45" ry="54" />
        <ellipse className={styles.waterRing} cx="99" cy="132" rx="33" ry="65" />
      </g>

      <g data-effect="avatar" className={`${styles.effect} ${styles.avatar}`}>
        <circle cx="98" cy="145" r="50" />
        <circle cx="98" cy="145" r="66" />
        <path d="M25 145h146M98 72v146" />
      </g>
    </>
  );
}
