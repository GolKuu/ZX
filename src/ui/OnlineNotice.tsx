'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useHudStore } from '@/src/store/hudStore';
import { useMenuNavigation } from './useMenuNavigation';
import styles from './OnlineNotice.module.css';

export function OnlineNotice() {
  const openModeMenu = useHudStore((state) => state.openModeMenu);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const back = useCallback(() => openModeMenu(), [openModeMenu]);

  useMenuNavigation({
    focus: 0,
    itemCount: 1,
    onBack: back,
    onConfirm: back,
    setFocus: () => undefined,
  });

  useEffect(() => buttonRef.current?.focus(), []);

  return (
    <div aria-label="Статус онлайн-боя" aria-modal="true" className={styles.scrim} role="dialog">
      <div className={styles.radar} aria-hidden="true"><i /><i /><i /></div>
      <section>
        <span>СЕТЕВОЙ РЕЖИМ</span>
        <h1>Онлайн-бой<br />в разработке</h1>
        <p>
          Меню уже готово, но матч через интернет потребует отдельного сетевого
          слоя, синхронизации и серверной инфраструктуры.
        </p>
        <button ref={buttonRef} type="button" onClick={openModeMenu}>
          Вернуться к выбору режима
        </button>
      </section>
      <footer><kbd>B</kbd> Назад</footer>
    </div>
  );
}
