'use client';

import { useEffect, useState } from 'react';
import { requestCombatReset } from '@/src/game/combatRuntime';
import { useHudStore } from '@/src/store/hudStore';
import styles from './GuidedModePanel.module.css';

const REQUIRED_KEYS = ['KeyA', 'KeyD', 'KeyW', 'KeyS'] as const;

export function GuidedModePanel() {
  const mode = useHudStore((state) => state.mode);
  const openControls = useHudStore((state) => state.openControls);
  const [pressed, setPressed] = useState<ReadonlySet<string>>(new Set());
  const [feedback, setFeedback] = useState('Используйте экранные направления, а не стрелки P2.');

  useEffect(() => {
    if (mode !== 'tutorial') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (REQUIRED_KEYS.includes(event.code as (typeof REQUIRED_KEYS)[number])) {
        setPressed((current) => new Set([...current, event.code]));
        setFeedback('Хорошо. Коснитесь всех четырёх направлений.');
      } else if (event.code.startsWith('Arrow')) {
        setFeedback('Стрелки принадлежат P2. Для P1 используйте W A S D.');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode]);

  if (mode !== 'training' && mode !== 'tutorial') return null;
  if (mode === 'training') {
    return (
      <aside className={styles.panel} aria-label="Инструменты тренировки">
        <span>TRAINING · ∞ TIME</span>
        <strong>Практика без окончания матча</strong>
        <div><button type="button" onClick={requestCombatReset}>Сбросить позиции</button><button type="button" onClick={openControls}>Приёмы и клавиши</button></div>
      </aside>
    );
  }

  const complete = REQUIRED_KEYS.every((key) => pressed.has(key));
  return (
    <aside className={styles.panel} data-complete={complete} aria-live="polite">
      <span>УРОК 01 · ДВИЖЕНИЕ</span>
      <strong>{complete ? 'ЗАДАНИЕ ВЫПОЛНЕНО' : 'Нажмите W, A, S и D'}</strong>
      <p>{complete ? 'Вы освоили прыжок, приседание и движение. Следующий урок открыт.' : feedback}</p>
      <div className={styles.keys}>{REQUIRED_KEYS.map((key) => <kbd key={key} data-done={pressed.has(key)}>{key.slice(3)}</kbd>)}</div>
      <button type="button" onClick={() => { setPressed(new Set()); requestCombatReset(); }}>Безопасный сброс</button>
    </aside>
  );
}
