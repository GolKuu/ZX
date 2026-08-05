'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHudStore, type MatchMode } from '@/src/store/hudStore';
import { useMenuNavigation } from './useMenuNavigation';
import { ModeFightPreview } from './ModeFightPreview';
import styles from './ModeMenu.module.css';

const MODES = [
  {
    id: 'story',
    label: 'История',
    detail: 'Кампания Glitch: 11 боёв, пространственный разлом и три финала',
    status: 'ПРОЛОГ',
    description: 'Вся история проходит от лица Glitch. Союзники и соперники управляются только сюжетным ИИ.',
  },
  {
    id: 'ai',
    label: 'Бой с ИИ',
    detail: 'Тактический матч против настраиваемого соперника',
    status: 'ДОСТУПНО',
    description: 'Выберите сложность, двух бойцов и арену перед подтверждением матча.',
  },
  {
    id: 'local',
    label: 'Локальный бой',
    detail: 'Быстрый бой на одной клавиатуре: P1 и P2',
    status: 'Доступно',
    description:
      'Классическая локальная дуэль: второй игрок управляется клавишами клавиатуры и клавишами курсора.',
  },
  {
    id: 'training',
    label: 'Тренировка',
    detail: 'Свободная практика с бесконечным временем и быстрым сбросом',
    status: 'ДОСТУПНО',
    description: 'Изучайте дистанцию, вводы и маршруты комбо на реальной боевой логике.',
  },
  {
    id: 'tutorial',
    label: 'Обучение',
    detail: 'Практические уроки движения, защиты и атак',
    status: '12 УРОКОВ',
    description: 'Короткие задания объясняют не только ввод, но и причину ошибки.',
  },
  {
    id: 'progression',
    label: 'Прогресс бойцов',
    detail: 'Три ветки мастерства для каждого персонажа',
    status: 'PVE',
    description: 'Открывайте варианты стиля для истории и тренировки без преимущества в Versus.',
  },
  {
    id: 'online',
    label: 'Онлайн-режим',
    detail: 'Быстрый подбор или приватный бой по коду комнаты',
    status: 'ДОСТУПНО',
    description:
      'Найдите случайного соперника или создайте комнату, отправьте другу шестизначный код и сразитесь через интернет.',
  },
] as const satisfies readonly {
  id: MatchMode | 'progression';
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
  const mobileMode = useHudStore((state) => state.mobileMode);
  const toggleMobileMode = useHudStore((state) => state.toggleMobileMode);
  const openProgression = useHudStore((state) => state.openProgression);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const visibleModes = useMemo(
    () => (mobileMode ? MODES.filter((mode) => mode.id !== 'local') : MODES),
    [mobileMode],
  );
  const selected = visibleModes[menuFocus] ?? visibleModes[0];

  const startMode = useCallback((mode: MatchMode | 'progression') => {
    if (mode === 'progression') openProgression();
    else selectMode(mode);
  }, [openProgression, selectMode]);
  const confirm = useCallback(() => {
    const mode = visibleModes[useHudStore.getState().menuFocus];
    if (mode !== undefined) {
      startMode(mode.id);
    }
  }, [startMode, visibleModes]);
  const back = useCallback(() => router.push('/'), [router]);
  const toggleMobile = useCallback(() => {
    toggleMobileMode();
  }, [toggleMobileMode]);
  const modeNumber = String(menuFocus + 1).padStart(2, '0');

  useMenuNavigation({
    focus: menuFocus,
    itemCount: visibleModes.length,
    onBack: back,
    onConfirm: confirm,
    setFocus: setMenuFocus,
  });

  useEffect(() => {
    buttonRefs.current[menuFocus]?.focus();
  }, [menuFocus]);
  useEffect(() => {
    if (menuFocus < visibleModes.length) {
      return;
    }
    setMenuFocus(0);
  }, [menuFocus, visibleModes.length, setMenuFocus]);

  return (
    <div
      aria-label="Выбор режима боя"
      aria-modal="true"
      className={styles.scrim}
      data-mode={selected.id}
      role="dialog"
    >
      <div aria-hidden="true" className={styles.modeBackdrop} />
      <ModeFightPreview />

      <header className={styles.brand}>
        <span>CC//ULTIMATE</span>
        <small>СЕТЬ И РЕЖИМЫ</small>
        <button
          type="button"
          aria-pressed={mobileMode}
          className={styles.mobileModeButton}
          onClick={toggleMobile}
        >
          <strong>{mobileMode ? 'Обычная версия' : 'Телефонная версия'}</strong>
          <span>{mobileMode ? 'Выкл. без локального боя' : 'Вкл. без локального боя'}</span>
        </button>
      </header>

      <div className={styles.layout}>
        <nav aria-label="Режимы боя" className={styles.modeList}>
          <p>Какой режим выбрать?</p>
          {visibleModes.map((mode, index) => (
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
          <span>МЕНЮ / {modeNumber}</span>
          <h1>{selected.label}</h1>
          <p>{selected.description}</p>
          <dl>
            <div><dt>сложность</dt><dd>4 уровня</dd></div>
            <div><dt>режим</dt><dd>Null Circle</dd></div>
          </dl>
        </aside>
      </div>

      <footer className={styles.hints}>
        <span><kbd>A</kbd> Выбрать</span>
        <span><kbd>B</kbd> Назад</span>
        <span><kbd>◄►</kbd> Навигация</span>
      </footer>
    </div>
  );
}
