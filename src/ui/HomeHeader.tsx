import Link from 'next/link';
import { AccountLinkButton } from './AccountLinkButton';
import { HomeSettingsButton } from './HomeSettingsButton';
import styles from './HomeHeader.module.css';

export function HomeHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="YZX">
        <span>YZX</span><b>YZX</b><small>FIGHTING ARENA</small>
      </Link>
      <div className={styles.actions}>
        <a className={styles.serverLink} href="https://testiskander.vercel.app" target="_blank" rel="noreferrer">
          <span aria-hidden="true">▶</span> ЗАЙТИ НА САЙТ
        </a>
        <span className={styles.status}><i aria-hidden="true" /> БОЕВАЯ СИСТЕМА ONLINE</span>
        <Link className={styles.storeLink} href="/store"><span>◆</span> АРСЕНАЛ</Link>
        <HomeSettingsButton variant="compact" />
        <AccountLinkButton />
      </div>
    </header>
  );
}
