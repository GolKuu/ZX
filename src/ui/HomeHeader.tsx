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
        <span className={styles.status}><i aria-hidden="true" />ИГРОВАЯ СБОРКА</span>
        <HomeSettingsButton variant="compact" />
        <AccountLinkButton />
      </div>
    </header>
  );
}
