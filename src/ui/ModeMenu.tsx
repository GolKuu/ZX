'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHudStore, type MatchMode } from '@/src/store/hudStore';
import { useMenuNavigation } from './useMenuNavigation';
import styles from './ModeMenu.module.css';

const MODES = [
  {
    id: 'local',
    label: 'Локальный бой',
    detail: 'Два игрока · одно устройство',
    status: 'ГОТОВО',
    description:
      'Сразитесь рядом за одной клавиатурой: P1 использует WASD, а P2 — стрелки и цифровой блок.',
  },
  {
    id: 'ai',
    label: 'Бой против ИИ',
    detail: 'Один игрок · компьютер',
    status: 'ГОТОВО',
    description:
      'Тренируйте движения и комбинации против компьютерного соперника. Игрок справа получает метку CPU.',
  },
  {
    id: 'online',
    label: 'Онлайн-бой',
    detail: 'Сетевой матч · скоро',
    status: 'В РАЗРАБОТКЕ',
    description:
      'Будущий режим для игры через интернет. Сетевой код ещё не подключён, поэтому пункт открывает экран статуса.',
  },
] as const satisfies readonly {
  id: MatchMode;
  label: string;
  detail: string;
  status: string;
  description: string;
}[];

export function ModeMenu() {
  const router = useRouter();
  const menuFocus = useHudStore((state) => state.menuFocus);
  const selectMode = useHudStore((state) => state.selectMode);
  const setMenuFocus = useHudStore((state) => state.setMenuFocus);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = MODES[menuFocus] ?? MODES[0];

  const startMode = useCallback((mode: MatchMode) => {
    selectMode(mode);
  }, [selectMode]);
  const confirm = useCallback(() => {
    const mode = MODES[useHudStore.getState().menuFocus];
    if (mode !== undefined) startMode(mode.id);
  }, [startMode]);
  const back = useCallback(() => router.push('/'), [router]);

  useMenuNavigation({
    focus: menuFocus,
    itemCount: MODES.length,
    onBack: back,
    onConfirm: confirm,
    setFocus: setMenuFocus,
  });

  useEffect(() => {
    buttonRefs.current[menuFocus]?.focus();
  }, [menuFocus]);

  return (
    <div aria-label="Выбор режима боя" aria-modal="true" className={styles.scrim} role="dialog">
      <header className={styles.brand}>
        <span>CC//ULTIMATE</span>
        <small>ВЫБОР РЕЖИМА</small>
      </header>

      <div className={styles.layout}>
        <nav aria-label="Режимы боя" className={styles.modeList}>
          <p>Как будем сражаться?</p>
          {MODES.map((mode, index) => (
            <button
              key={mode.id}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              type="button"
              data-focused={index === menuFocus}
              onClick={() => startMode(mode.id)}
              onFocus={() => setMenuFocus(index)}
              onPointerEnter={() => setMenuFocus(index)}
            >
              <i aria-hidden="true" />
              <span>
                <strong>{mode.label}</strong>
                <small>{mode.detail}</small>
              </span>
              <b>{mode.status}</b>
            </button>
          ))}
        </nav>

        <aside className={styles.description} aria-live="polite">
          <span>РЕЖИМ / {String(menuFocus + 1).padStart(2, '0')}</span>
          <h1>{selected.label}</h1>
          <p>{selected.description}</p>
          <dl>
            <div><dt>Ростер</dt><dd>2 готовых бойца</dd></div>
            <div><dt>Арена</dt><dd>Null Circle</dd></div>
          </dl>
        </aside>
      </div>

      <footer className={styles.hints}>
        <span><kbd>A</kbd> Выбрать</span>
        <span><kbd>B</kbd> Назад</span>
        <span><kbd>↑↓</kbd> Навигация</span>
      </footer>
    </div>
  );
}
