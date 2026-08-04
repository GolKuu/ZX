import Link from 'next/link';
import { HomeArtwork } from './HomeArtwork';
import { HomeSettingsButton } from './HomeSettingsButton';
import styles from './HomeHero.module.css';

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <span>БРАУЗЕРНЫЙ ФАЙТИНГ // 1 НА 1</span>
          <b>СЕЗОН 01</b>
        </p>
        <h1>Твой стиль.<span>Твои правила.</span></h1>
        <p className={styles.description}>
          Пять непохожих бойцов, быстрые локальные матчи и умный соперник.
          Выбери характер — и забери арену.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryCta} href="/play">Играть сейчас<span aria-hidden="true">→</span></Link>
          <HomeSettingsButton variant="secondary" />
        </div>
        <p className={styles.inputNote}><span aria-hidden="true">●</span>Без установки · клавиатура, геймпад и сенсорное управление</p>
      </div>
      <HomeArtwork />
    </section>
  );
}
