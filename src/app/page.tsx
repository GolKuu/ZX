import { HomeHeader } from '@/src/ui/HomeHeader';
import { HomeHero } from '@/src/ui/HomeHero';
import { HomeHighlights } from '@/src/ui/HomeHighlights';
import { StructuredData } from './StructuredData';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.page}>
      <StructuredData />
      <div className={styles.ambientGlow} aria-hidden="true" />

      <HomeHeader />
      <HomeHero />
      <HomeHighlights />
    </main>
  );
}
