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
  const resume = useHudStore((state) => state.resume);
  const openControls = useHudStore((state) => state.openControls);
  const openCharacterSelect = useHudStore((state) => state.openCharacterSelect);
  const openModeMenu = useHudStore((state) => state.openModeMenu);
  const setMenuFocus = useHudStore((state) => state.setMenuFocus);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const pauseItems: readonly MenuItem[] = [
    { label: 'Resume', detail: 'Return to fight', action: resume },
    { label: 'Restart match', detail: 'Reset the current set', action: requestCombatReset },
    { label: 'Controls', detail: 'View every binding', action: openControls },
    {
      label: 'Change fighters',
      detail: 'Start a new match with another pair',
      action: openCharacterSelect,
    },
    {
      label: 'Change mode',
      detail: 'Leave the current match',
      action: openModeMenu,
    },
  ];
  const resultItems: readonly MenuItem[] = [
    { label: 'Rematch', action: requestCombatReset },
    { label: 'Change fighters', action: openCharacterSelect },
    { label: 'Change mode', action: openModeMenu },
    { label: 'Main menu', action: () => router.push('/') },
  ];
  const items = screen === 'result' ? resultItems : pauseItems;

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
          <span>Match suspended</span>
          <h2>Paused</h2>
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
    ['Rounds', result.rounds],
    ['Max combo', String(result.maxCombo)],
    ['Clashes', String(result.clashes)],
    ['Duration', result.duration],
  ];
  return (
    <section className={styles.resultHeader}>
      <span>Player one wins</span>
      <h2>{result.winner}</h2>
      <div className={styles.resultStats}>
        {stats.map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function HintBar({ screen }: { readonly screen: HudScreen }) {
  return (
    <footer className={styles.hintBar}>
      <span><kbd>A</kbd> {screen === 'controls' ? 'Back' : 'Select'}</span>
      <span><kbd>B</kbd> Back</span>
      <span><kbd>↑↓</kbd> Navigate</span>
    </footer>
  );
}
