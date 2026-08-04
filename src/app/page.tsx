import { HomeHeader } from '@/src/ui/HomeHeader';
import { HomeHero } from '@/src/ui/HomeHero';
import { StructuredData } from './StructuredData';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.page}>
      <StructuredData />
      <HomeHeader />
      <HomeHero />
    </main>
  );
}
