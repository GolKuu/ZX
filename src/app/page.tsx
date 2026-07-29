import Link from 'next/link';
import { StructuredData } from './StructuredData';
import styles from './page.module.css';

const features = ['CEL SHADING', 'GPU IMPACT FX', '60 FPS TARGET'];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <StructuredData />
      <div className={styles.glow} aria-hidden="true" />
      <header className={styles.header}>
        <span className={styles.brand}>CC//ULTIMATE</span>
        <span className={styles.status}>RENDER SLICE 01</span>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>BROWSER-BASED 3D CEL-SHADED FIGHTER</p>
        <h1>
          Every hit should
          <span> stop time.</span>
        </h1>
        <p className={styles.description}>
          A focused visual slice proving cel-shaded fighters, readable silhouettes,
          and high-impact effects can hold 60 FPS in the browser.
        </p>
        <Link className={styles.cta} href="/play">
          Enter the render lab
          <span aria-hidden="true">↗</span>
        </Link>
        <Link className={styles.secondaryCta} href="/aang">
          Avatar Aang · 22 animated moves
          <span aria-hidden="true">→</span>
        </Link>
        <p className={styles.note}>Desktop only · keyboard or gamepad recommended</p>
      </section>

      <footer className={styles.features}>
        {features.map((feature, index) => (
          <span key={feature}>
            <b>0{index + 1}</b>
            {feature}
          </span>
        ))}
      </footer>
    </main>
  );
}
