import Link from 'next/link';
import Image from 'next/image';
import { CHARACTER_ROSTER } from '@/src/data/characterRoster';
import styles from './HomeArtwork.module.css';

export function HomeArtwork() {
  return (
    <section className={styles.artwork} aria-label="YZX arena and fighter roster">
      <div className={styles.arenaBackdrop} aria-hidden="true">
        <span className={`${styles.arenaTower} ${styles.towerOne}`} />
        <span className={`${styles.arenaTower} ${styles.towerTwo}`} />
        <span className={`${styles.arenaTower} ${styles.towerThree}`} />
        <span className={styles.arenaPlatform} />
      </div>
      <a
        className={styles.fishLink}
        href="https://testiskander.vercel.app/"
        target="_blank"
        rel="noreferrer"
        aria-label="Play Ocean Depths"
      >
        <Image
          className={styles.moon}
          src="/ocean-fish.png"
          alt="Pixel fish inviting you to play Ocean Depths"
          width={250}
          height={190}
          priority
        />
      </a>
      <a
        className={styles.ballLink}
        href="https://ali9-khaki.vercel.app/"
        target="_blank"
        rel="noreferrer"
        aria-label="Play Touchline Game Master"
      >
        <span className={styles.ballGraphic} aria-hidden="true" />
        <span className={styles.ballLabel}>PLAY TOUCHLINE</span>
      </a>
      <header className={styles.topline}>
        <span>ARENA // NIGHT FRACTURE</span>
        <b>5 FIGHTERS ONLINE</b>
      </header>
      <Link className={styles.siteEntry} href="/play">
        <span className={styles.siteEntryMark} aria-hidden="true">→</span>
        <span>ENTER LIVE ARENA</span>
      </Link>
      <div className={styles.fighters}>
        {CHARACTER_ROSTER.map((fighter, index) => (
          <Link className={styles.fighter} data-character={fighter.id} data-featured={index === 2} href="/play" key={fighter.id}>
            <span className={styles.index}>0{index + 1}</span>
            <i className={styles.sprite} aria-hidden="true" />
            <span className={styles.name}>
              <strong>{fighter.displayName}</strong>
              <small>{fighter.mechanic}</small>
            </span>
          </Link>
        ))}
      </div>
      <footer className={styles.caption}>
        <span>WEIGHT · SPEED · CONTROL · IMPACT</span>
        <strong>CHOOSE YOUR FIGHTER →</strong>
      </footer>
    </section>
  );
}
