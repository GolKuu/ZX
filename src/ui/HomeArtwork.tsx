import Link from 'next/link';
import { CHARACTER_ROSTER } from '@/src/data/characterRoster';
import styles from './HomeArtwork.module.css';

export function HomeArtwork() {
  return (
    <section className={styles.artwork} aria-label="Доступные бойцы">
      <header className={styles.topline}>
        <span>РОСТЕР // СЕЗОН 01</span>
        <b>5 БОЙЦОВ В СТРОЮ</b>
      </header>
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
