import Link from 'next/link';
import { AccountLinkButton } from './AccountLinkButton';
import { HomeSettingsButton } from './HomeSettingsButton';
import styles from './HomeHeader.module.css';

export function HomeHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Circle Clash Ultimate">
        <span>CC</span><b>CIRCLE CLASH</b><small>ULTIMATE</small>
      </Link>
      <div className={styles.actions}>
        <a className={styles.serverLink} href="https://testiskander.vercel.app" target="_blank" rel="noreferrer">
          <span aria-hidden="true">▶</span> ЗАЙТИ НА САЙТ
        </a>
        <span className={styles.status}><i aria-hidden="true" />ИГРОВАЯ СБОРКА</span>
        <Link className={styles.storeLink} href="/store"><span>◈</span> АРСЕНАЛ</Link>
        <HomeSettingsButton variant="compact" />
        <AccountLinkButton />
      </div>
    </header>
  );
}
