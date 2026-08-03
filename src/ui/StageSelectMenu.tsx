'use client';

import { useCallback } from 'react';
import { ARENAS } from '@/src/data/arenas';
import { useHudStore } from '@/src/store/hudStore';
import { useMenuNavigation } from './useMenuNavigation';
import styles from './StageSelectMenu.module.css';

export function StageSelectMenu() {
  const focus = useHudStore((state) => state.menuFocus);
  const selectArena = useHudStore((state) => state.selectArena);
  const setFocus = useHudStore((state) => state.setMenuFocus);
  const back = useHudStore((state) => state.returnToCharacterSelect);
  const selected = ARENAS[focus] ?? ARENAS[0]!;
  const confirm = useCallback(() => selectArena(selected.id), [selectArena, selected.id]);

  useMenuNavigation({
    focus,
    itemCount: ARENAS.length,
    onBack: back,
    onConfirm: confirm,
    setFocus,
  });

  return (
    <div aria-label="Выбор арены" aria-modal="true" className={styles.scrim} role="dialog">
      <header className={styles.header}>
        <span>ШАГ 03 / 04</span>
        <h1>ВЫБЕРИТЕ АРЕНУ</h1>
        <p>Арены не меняют баланс матча. Выберите читаемую сцену под ваше устройство.</p>
      </header>
      <div className={styles.grid}>
        {ARENAS.map((arena, index) => (
          <button
            key={arena.id}
            type="button"
            data-arena={arena.id}
            data-focused={index === focus}
            onClick={() => selectArena(arena.id)}
            onFocus={() => setFocus(index)}
            onPointerEnter={() => setFocus(index)}
          >
            <i aria-hidden="true" />
            <span>{arena.performance} GPU</span>
            <h2>{arena.name}</h2>
            <strong>{arena.theme}</strong>
            <p>{arena.note}</p>
          </button>
        ))}
      </div>
      <footer className={styles.footer}>
        <span><kbd>Enter</kbd> Подтвердить</span>
        <span><kbd>Esc</kbd> Назад</span>
        <span><kbd>← →</kbd> Выбрать арену</span>
      </footer>
    </div>
  );
}
