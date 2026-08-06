import Link from 'next/link';
import { HomeArtwork } from './HomeArtwork';
import { HomeSettingsButton } from './HomeSettingsButton';
import styles from './HomeHero.module.css';

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <span>REALTIME 3D COMBAT // MAIN MENU</span>
          <b>YZX // SEASON 01</b>
        </p>
        <h1>Own the arena.<span>Break the limit.</span></h1>
        <p className={styles.description}>
          Five original fighters. One reactive 3D arena. Build your loadout,
          read the opponent and take the round with precise timing.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryCta} href="/play">
            <span className={styles.ctaCopy}>
              <strong>START FIGHT</strong>
              <small>SELECT MODE // FIGHTER</small>
            </span>
            <span className={styles.ctaArrow} aria-hidden="true">→</span>
          </Link>
          <HomeSettingsButton variant="secondary" />
        </div>
        <p className={styles.inputNote}><span aria-hidden="true">●</span> KEYBOARD · GAMEPAD · TOUCH READY</p>
      </div>
      <HomeArtwork />
    </section>
  );
}
