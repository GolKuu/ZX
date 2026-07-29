'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { requestCombatReset } from '@/src/game/combatRuntime';
import { useHudStore, type HudScreen } from '@/src/store/hudStore';
import { ControlsMenu } from './ControlsMenu';
import { ModeMenu } from './ModeMenu';
import { OnlineNotice } from './OnlineNotice';
import styles from './CombatHud.module.css';

interface MenuItem {
  readonly label: string;
  readonly detail?: string;
  readonly action: () => void;
}

const bindings = [
  ['Move', 'A / D', 'Left stick', '◀ / ▶'],
  ['Guard', 'S', 'LT', 'G'],
  ['Light', 'J', 'X', 'L'],
  ['Medium', 'K', 'Y', 'M'],
  ['Heavy', 'L', 'B', 'H'],
  ['Special', 'I', 'RB', 'S'],
  ['Pause', 'Esc', 'Menu', 'Ⅱ'],
] as const;

export function MatchMenus() {
  const screen = useHudStore((state) => state.screen);
  if (screen === 'mode') return <ModeMenu />;
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
  const openModeMenu = useHudStore((state) => state.openModeMenu);
  const setMenuFocus = useHudStore((state) => state.setMenuFocus);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const pauseItems: readonly MenuItem[] = [
    { label: 'Resume', detail: 'Return to fight', action: resume },
    { label: 'Restart match', detail: 'Reset the current set', action: requestCombatReset },
    { label: 'Controls', detail: 'View every binding', action: openControls },
    {
      label: 'Change mode',
      detail: 'Leave the current match',
      action: openModeMenu,
    },
  ];
  const resultItems: readonly MenuItem[] = [
    { label: 'Rematch', action: requestCombatReset },
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

function ControlsMenu() {
  const openPause = useHudStore((state) => state.openPause);

  useEffect(() => {
    const setActive = (event: KeyboardEvent, active: boolean) => {
      const row = document.querySelector<HTMLElement>(
        `[data-key="${event.code}"]`,
      );
      if (row !== null) {
        row.dataset.active = active ? 'true' : 'false';
      }
    };
    const keyDown = (event: KeyboardEvent) => setActive(event, true);
    const keyUp = (event: KeyboardEvent) => setActive(event, false);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, []);

  return (
    <div
      aria-label="Controls"
      aria-modal="true"
      className={styles.menuScrim}
      role="dialog"
    >
      <section className={styles.controlsPanel}>
        <header>
          <span>Input reference</span>
          <h2>Controls</h2>
          <p>Keyboard, controller, and touch feed the same combat input.</p>
        </header>
        <div className={styles.bindingHeader} aria-hidden="true">
          <span>Action</span>
          <span>Keyboard</span>
          <span>Gamepad</span>
          <span>Touch</span>
        </div>
        {bindings.map(([action, keyboard, gamepad, touch]) => (
          <div
            key={action}
            className={styles.bindingRow}
            data-key={bindingCode(keyboard)}
          >
            <strong>{action}</strong>
            <kbd>{keyboard}</kbd>
            <kbd>{gamepad}</kbd>
            <kbd>{touch}</kbd>
          </div>
        ))}
        <button className={styles.backButton} type="button" onClick={openPause}>
          Back to pause
        </button>
      </section>
      <HintBar screen="controls" />
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

function bindingCode(label: string): string {
  const codes: Record<string, string> = {
    'A / D': 'KeyA',
    S: 'KeyS',
    J: 'KeyJ',
    K: 'KeyK',
    L: 'KeyL',
    I: 'KeyI',
    Esc: 'Escape',
  };
  return codes[label] ?? '';
}
