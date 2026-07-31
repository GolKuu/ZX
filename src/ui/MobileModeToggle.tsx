'use client';

import { useHudStore } from '@/src/store/hudStore';
import styles from './CombatHud.module.css';

export function MobileModeToggle() {
  const enabled = useHudStore((state) => state.mobileMode);
  const toggle = useHudStore((state) => state.toggleMobileMode);

  return (
    <button
      aria-label={enabled ? 'Выключить мобильное управление' : 'Включить мобильное управление'}
      aria-pressed={enabled}
      className={styles.mobileModeToggle}
      type="button"
      onClick={toggle}
    >
      <span aria-hidden="true">▣</span>
      <strong>МОБ</strong>
      <i aria-hidden="true" />
    </button>
  );
}
