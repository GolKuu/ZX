'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { requestCombatReset } from '@/src/game/combatRuntime';
import { useHudStore, type HudScreen } from '@/src/store/hudStore';
import { ControlsMenu } from './ControlsMenu';
import { CharacterSelectMenu } from './CharacterSelectMenu';
import { ModeMenu } from './ModeMenu';
import { DifficultyMenu } from './DifficultyMenu';
import { OnlineNotice } from './OnlineNotice';
import { VersusScreen } from './VersusScreen';
import { StageSelectMenu } from './StageSelectMenu';
import { FeatureHub } from './FeatureHub';
import { StoryModeScreen } from './StoryModeScreen';
import { StoryCutscene } from './StoryCutscene';
import { GloryResultStrip } from './GloryResultStrip';
import { leaveOnlineRoom } from '@/src/online/onlineSession';
import styles from './CombatHud.module.css';

interface MenuItem {
  readonly label: string;
  readonly detail?: string;
  readonly action: () => void;
}

export function MatchMenus() {
  const screen = useHudStore((state) => state.screen);
  if (screen === 'mode') return <ModeMenu />;
  if (screen === 'character') return <CharacterSelectMenu />;
  if (screen === 'stage') return <StageSelectMenu />;
  if (screen === 'story') return <StoryModeScreen />;
  if (screen === 'story-scene') return <StoryCutscene />;
  if (screen === 'tutorial' || screen === 'progression') {
    return <FeatureHub screen={screen} />;
  }
  if (screen === 'difficulty') return <DifficultyMenu />;
  if (screen === 'versus') return <VersusScreen />;
  if (screen === 'online') return <OnlineNotice />;
  return <InMatchMenus />;
}

function InMatchMenus() {
  const router = useRouter();
  const screen = useHudStore((state) => state.screen);
  const menuFocus = useHudStore((state) => state.menuFocus);
  const result = useHudStore((state) => state.result);
  const mode = useHudStore((state) => state.mode);
  const resume = useHudStore((state) => state.resume);
  const openControls = useHudStore((state) => state.openControls);
  const openCharacterSelect = useHudStore((state) => state.openCharacterSelect);
  const openModeMenu = useHudStore((state) => state.openModeMenu);
  const setMenuFocus = useHudStore((state) => state.setMenuFocus);
  const completeStoryChapter = useHudStore((state) => state.completeStoryChapter);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const commonPauseItems: readonly MenuItem[] = [
    { label: 'Продолжить', detail: 'Вернуться в бой', action: resume },
    { label: 'Начать заново', detail: 'Сбросить текущий матч', action: requestCombatReset },
    { label: 'Управление', detail: 'Клавиши и приёмы', action: openControls },
    {
      label: 'Сменить бойцов',
      detail: 'Новый матч с другой парой',
      action: openCharacterSelect,
    },
    {
      label: 'Сменить режим',
      detail: 'Покинуть текущий матч',
      action: openModeMenu,
    },
  ];
  const pauseItems: readonly MenuItem[] = mode === 'story' || mode === 'training'
    ? commonPauseItems.filter((item) => item.action !== openCharacterSelect)
    : commonPauseItems;
  const standardResultItems: readonly MenuItem[] = [
    { label: 'Рематч', action: requestCombatReset },
    { label: 'Сменить бойцов', action: openCharacterSelect },
    { label: 'Сменить режим', action: openModeMenu },
    { label: 'Главное меню', action: () => router.push('/') },
  ];
  const exitOnline = () => {
    void leaveOnlineRoom();
    openModeMenu();
  };
  const storyWon = result.winner.startsWith('P1');
  const resultItems: readonly MenuItem[] = mode === 'online'
    ? [{ label: 'LEAVE ONLINE ROOM', action: exitOnline }]
    : mode === 'story'
    ? [
      storyWon
        ? { label: 'CONTINUE STORY', detail: 'Save checkpoint and continue as Glitch', action: completeStoryChapter }
        : { label: 'RETRY AS GLITCH', detail: 'Reload the last safe checkpoint', action: requestCombatReset },
      ...(storyWon ? [{ label: 'RETRY AS GLITCH', action: requestCombatReset }] : []),
      { label: 'STORY MENU', action: openModeMenu },
      { label: 'MAIN MENU', action: () => router.push('/') },
    ]
    : standardResultItems;
  const onlinePauseItems = mode === 'online'
    ? commonPauseItems
      .filter((item) => item.action !== openCharacterSelect && item.action !== requestCombatReset)
      .map((item) => item.action === openModeMenu ? { ...item, action: exitOnline } : item)
    : pauseItems;
  const items = screen === 'result' ? resultItems : onlinePauseItems;

  useEffect(() => {
    if (screen === 'pause' || screen === 'result') {
      buttonRefs.current[menuFocus]?.focus();
    }
  }, [menuFocus, screen]);

  useEffect(() => {
    if (screen === 'fight') {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (screen === 'controls') {
        if (event.code === 'Escape' || event.code === 'Backspace') {
          event.preventDefault();
          useHudStore.getState().openPause();
        }
        return;
      }
      if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
        event.preventDefault();
        setMenuFocus((menuFocus + 1) % items.length);
      } else if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
        event.preventDefault();
        setMenuFocus((menuFocus - 1 + items.length) % items.length);
      } else if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        items[menuFocus]?.action();
      } else if (event.code === 'Escape' && screen === 'pause') {
        event.preventDefault();
        resume();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items, menuFocus, resume, screen, setMenuFocus]);

  if (screen === 'fight') {
    return null;
  }

  if (screen === 'controls') {
    return <ControlsMenu />;
  }

  return (
    <div
      aria-label={screen === 'result' ? 'Match result' : 'Pause menu'}
      aria-modal="true"
      className={styles.menuScrim}
      role="dialog"
    >
      {screen === 'result' ? (
        <ResultHeader result={result} />
      ) : (
        <div className={styles.pauseHeading}>
          <span>БОЙ ОСТАНОВЛЕН</span>
          <h2>Пауза</h2>
        </div>
      )}
      <nav
        aria-label={screen === 'result' ? 'Result actions' : 'Pause actions'}
        className={`${styles.menuPanel} ${
          screen === 'result' ? styles.resultButtons : ''
        }`}
      >
        {items.map((item, index) => (
          <button
            key={item.label}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            className={index === menuFocus ? styles.menuItemFocused : ''}
            type="button"
            onClick={item.action}
            onFocus={() => setMenuFocus(index)}
            onPointerEnter={() => setMenuFocus(index)}
          >
            <i aria-hidden="true" />
            <span>{item.label}</span>
            {item.detail !== undefined && <small>{item.detail}</small>}
          </button>
        ))}
      </nav>
      <HintBar screen={screen} />
    </div>
  );
}

function ResultHeader({
  result,
}: {
  readonly result: ReturnType<typeof useHudStore.getState>['result'];
}) {
  const stats = [
    ['Раунды', result.rounds],
    ['Макс. комбо', String(result.maxCombo)],
    ['Столкновения', String(result.clashes)],
    ['Время', result.duration],
  ];
  return (
    <section className={styles.resultHeader}>
      <span>{result.winner.startsWith('P1') ? 'ИГРОК 1 ПОБЕДИЛ' : 'ИГРОК 2 ПОБЕДИЛ'}</span>
      <h2>{result.winner}</h2>
      <div className={styles.resultStats}>
        {stats.map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <GloryResultStrip />
    </section>
  );
}

function HintBar({ screen }: { readonly screen: HudScreen }) {
  return (
    <footer className={styles.hintBar}>
      <span><kbd>Enter</kbd> {screen === 'controls' ? 'Назад' : 'Выбрать'}</span>
      <span><kbd>Esc</kbd> Назад</span>
      <span><kbd>↑↓</kbd> Навигация</span>
    </footer>
  );
}
