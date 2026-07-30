import Link from 'next/link';
import { HomeArtwork } from './HomeArtwork';
import { HomeSettingsButton } from './HomeSettingsButton';
import styles from './HomeHero.module.css';

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <span>3D-ФАЙТИНГ В БРАУЗЕРЕ</span>
          <b>СЕЗОН 01</b>
        </p>
        <h1>
          Выбери бойца.
          <span>Забери раунд.</span>
        </h1>
        <p className={styles.description}>
          Быстрые матчи один на один, выразительные бойцы и удары,
          которые ощущаются с первого попадания.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryCta} href="/play">
            Начать бой
            <span aria-hidden="true">→</span>
          </Link>
          <HomeSettingsButton variant="secondary" />
        </div>
        <p className={styles.inputNote}>
          <span aria-hidden="true">●</span>
          Играй сразу · без загрузки и установки
        </p>
      </div>
      <HomeArtwork />
    </section>
  );
}
