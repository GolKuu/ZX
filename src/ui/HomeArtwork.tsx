import Image from 'next/image';
import styles from './HomeArtwork.module.css';

export function HomeArtwork() {
  return (
    <div className={styles.artwork}>
      <Image
        alt="VORGH сражается с GLITCH на арене Null Circle"
        className={styles.image}
        fill
        priority
        sizes="(max-width: 760px) 100vw, 62vw"
        src="/assets/home/current-fighters.webp"
      />
      <div className={styles.caption}>
        <span>NULL CIRCLE · ARENA 01</span>
        <strong>VORGH VS GLITCH</strong>
      </div>
    </div>
  );
}
