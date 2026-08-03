'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_BINDINGS } from '@/src/input/bindings';
import { LuckyMoveList } from './LuckyMoveList';
import {
  bindingCode,
  CONTROL_ROWS,
  keyLabel,
  useControlStore,
} from '@/src/store/controlStore';
import { useHudStore } from '@/src/store/hudStore';
import styles from './CombatHud.module.css';

export function ControlsMenu() {
  const bindings = useControlStore((state) => state.bindings);
  const editing = useControlStore((state) => state.editing);
  const hydrate = useControlStore((state) => state.hydrate);
  const reset = useControlStore((state) => state.reset);
  const setKey = useControlStore((state) => state.setKey);
  const startEditing = useControlStore((state) => state.startEditing);
  const openPause = useHudStore((state) => state.openPause);
  const [showMoves, setShowMoves] = useState(false);

  useEffect(hydrate, [hydrate]);
  useEffect(() => {
    if (editing === null) return;
    const capture = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.code === 'Escape') {
        startEditing(null);
      } else {
        setKey(editing, event.code);
      }
    };
    window.addEventListener('keydown', capture, true);
    return () => window.removeEventListener('keydown', capture, true);
  }, [editing, setKey, startEditing]);

  return (
    <div
      aria-label="Настройка управления"
      aria-modal="true"
      className={styles.menuScrim}
      role="dialog"
    >
      <section className={styles.controlsPanel}>
        <header>
          <span>Управление игрока</span>
          <h2>Клавиши</h2>
          <p>Нажми на клавишу в таблице, затем нажми новую. Настройка сохранится автоматически.</p>
        </header>
        {showMoves ? <LuckyMoveList /> : (
          <>
            <div className={styles.bindingHeader} aria-hidden="true">
              <span>Действие</span>
              <span>Клавиша</span>
              <span>Тип</span>
              <span>По умолчанию</span>
            </div>
            {CONTROL_ROWS.map((row) => (
              <div key={row.id} className={styles.bindingRow}>
                <strong>{row.label}</strong>
                <button
                  data-editing={editing === row.id}
                  type="button"
                  onClick={() => startEditing(row.id)}
                >
                  {editing === row.id
                    ? 'Нажми…'
                    : keyLabel(bindingCode(bindings, row.id))}
                </button>
                <span>{row.detail}</span>
                <kbd>{keyLabel(bindingCode(DEFAULT_BINDINGS, row.id))}</kbd>
              </div>
            ))}
          </>
        )}
        <div className={styles.controlActions}>
          <button type="button" onClick={openPause}>Назад</button>
          <button type="button" onClick={() => setShowMoves(!showMoves)}>
            {showMoves ? 'Клавиши' : 'Приёмы Lucky'}
          </button>
          <button type="button" onClick={reset}>Сбросить раскладку</button>
        </div>
      </section>
      <footer className={styles.hintBar}>
        <span><kbd>Esc</kbd> отменить новую клавишу</span>
      </footer>
    </div>
  );
}
