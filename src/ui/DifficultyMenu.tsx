'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMenuNavigation } from './useMenuNavigation';
import { useHudStore } from '@/src/store/hudStore';
import type { AiDifficulty } from '@/src/ai';
import styles from './ModeMenu.module.css';

const AI_DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Легкий',
    detail: 'Слабые комбо и редкие атаки',
    description: 'ИИ чаще ошибается и даёт больше времени для реакции.',
  },
  {
    id: 'normal',
    label: 'Нормальный',
    detail: 'Балансная игра, средняя агрессия',
    description: 'Стандартный уровень для обычных матчей против ИИ.',
  },
  {
    id: 'hard',
    label: 'Сложный',
    detail: 'Точный тайминг и активная защита',
    description: 'ИИ реже ошибается и быстрее наказывает за промахи.',
  },
  {
    id: 'impossible',
    label: 'Невозможный',
    detail: 'Нечестно сильный и очень быстрый',
    description: 'Минимум ошибок и максимально плотная атака по всему экрану.',
  },
] satisfies readonly {
  id: AiDifficulty;
  label: string;
  detail: string;
  description: string;
}[];

export function DifficultyMenu() {
  const menuFocus = useHudStore((state) => state.menuFocus);
  const setMenuFocus = useHudStore((state) => state.setMenuFocus);
  const openModeMenu = useHudStore((state) => state.openModeMenu);
  const selectAiDifficulty = useHudStore((state) => state.selectAiDifficulty);
  const selected = AI_DIFFICULTIES[menuFocus] ?? AI_DIFFICULTIES[0]!;
  const selectedIndex = menuFocus + 1;
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const confirm = useCallback(() => {
    selectAiDifficulty(selected.id);
  }, [selectAiDifficulty, selected]);
  const back = useCallback(() => {
    openModeMenu();
  }, [openModeMenu]);
  const menuNumber = String(selectedIndex).padStart(2, '0');

  useMenuNavigation({
    focus: menuFocus,
    itemCount: AI_DIFFICULTIES.length,
    onBack: back,
    onConfirm: confirm,
    setFocus: setMenuFocus,
  });

  useEffect(() => {
    buttonRefs.current[menuFocus]?.focus();
  }, [menuFocus]);

  return (
    <div
      aria-label="AI difficulty"
      aria-modal="true"
      className={styles.scrim}
      role="dialog"
    >
      <header className={styles.brand}>
        <span>YZX//FIGHT</span>
        <small>GEMINI · ИИ · РЕЖИМ</small>
      </header>

      <div className={styles.layout}>
        <nav aria-label="Уровни ИИ" className={styles.modeList}>
          <p>Выберите уровень</p>
          {AI_DIFFICULTIES.map((difficulty, index) => (
            <button
              key={difficulty.id}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              type="button"
              data-focused={index === menuFocus}
              onClick={() => selectAiDifficulty(difficulty.id)}
              onFocus={() => setMenuFocus(index)}
              onPointerEnter={() => setMenuFocus(index)}
            >
              <i aria-hidden="true" />
              <span>
                <strong>{difficulty.label}</strong>
                <small>{difficulty.detail}</small>
              </span>
              <b>GEMINI</b>
            </button>
          ))}
        </nav>

        <aside className={styles.description} aria-live="polite">
          <span>AI / {menuNumber}</span>
          <h1>{selected.label}</h1>
          <p>{selected.description}</p>
          <dl>
            <div><dt>сложность</dt><dd>4 уровня</dd></div>
            <div><dt>режим</dt><dd>Single Player · CPU</dd></div>
          </dl>
        </aside>
      </div>

      <footer className={styles.hints}>
        <span><kbd>A</kbd> Выбрать</span>
        <span><kbd>B</kbd> Назад</span>
        <span><kbd>←</kbd> ←→ Навигация</span>
      </footer>
    </div>
  );
}
