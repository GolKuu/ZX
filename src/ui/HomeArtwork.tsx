import Link from 'next/link';
import { CHARACTER_ROSTER } from '@/src/data/characterRoster';
import styles from './HomeArtwork.module.css';

export function HomeArtwork() {
  return (
    <section className={styles.artwork} aria-label="Арена и доступные бойцы">
      <div className={styles.arenaBackdrop} aria-hidden="true">
        <span className={styles.moon} />
        <span className={`${styles.arenaTower} ${styles.towerOne}`} />
        <span className={`${styles.arenaTower} ${styles.towerTwo}`} />
        <span className={`${styles.arenaTower} ${styles.towerThree}`} />
        <span className={styles.arenaPlatform} />
      </div>
      <header className={styles.topline}>
        <span>АРЕНА // НОЧНОЙ РАЗЛОМ</span>
        <b>5 БОЙЦОВ В СТРОЮ</b>
      </header>
      <Link className={styles.siteEntry} href="https://testiskander.vercel.app" target="_blank" rel="noreferrer">
        <span className={styles.siteEntryMark} aria-hidden="true">↗</span>
        <span>ЗАЙТИ НА ЭТОТ САЙТ</span>
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
        <span>У КАЖДОГО — СВОЙ ТЕМП, МЕХАНИКА И СУПЕРПРИЁМ</span>
        <strong>ВЫБРАТЬ БОЙЦА →</strong>
      </footer>
    </section>
  );
}
