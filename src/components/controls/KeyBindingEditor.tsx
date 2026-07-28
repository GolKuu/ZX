import { useCallback, useEffect, useState } from 'react';
import { actionLabels, playerLabels } from '../../game/config/defaultControls';
import { GAME_ACTIONS, type GameAction, type PlayerId } from '../../game/core/types';
import type { KeyboardProfiles } from '../../game/input/InputProfile';

type BindingTarget = { playerId: PlayerId; action: GameAction };
type PendingReplacement = BindingTarget & {
  code: string;
  conflict: BindingTarget;
};

export function KeyBindingEditor({
  profiles,
  onChange,
}: {
  profiles: KeyboardProfiles;
  onChange: (profiles: KeyboardProfiles) => void;
}) {
  const [listening, setListening] = useState<BindingTarget | null>(null);
  const [pending, setPending] = useState<PendingReplacement | null>(null);
  const applyBinding = useCallback(
    (target: BindingTarget, code: string) => {
      const next = cloneProfiles(profiles);
      next[target.playerId].bindings[target.action] = code;
      onChange(next);
    },
    [onChange, profiles],
  );

  useEffect(() => {
    if (!listening) return;
    const capture = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const conflict = findBinding(profiles, event.code, listening);
      if (conflict) setPending({ ...listening, code: event.code, conflict });
      else applyBinding(listening, event.code);
      setListening(null);
    };
    window.addEventListener('keydown', capture, { capture: true, once: true });
    return () => window.removeEventListener('keydown', capture, { capture: true });
  }, [applyBinding, listening, profiles]);

  function replaceBinding() {
    if (!pending) return;
    const next = cloneProfiles(profiles);
    const oldCode = next[pending.playerId].bindings[pending.action];
    next[pending.playerId].bindings[pending.action] = pending.code;
    next[pending.conflict.playerId].bindings[pending.conflict.action] = oldCode;
    onChange(next);
    setPending(null);
  }

  return (
    <div className="binding-editor">
      {(['player1', 'player2'] as const).map((playerId) => (
        <section className="binding-player" key={playerId}>
          <h2>{playerLabels[playerId]}</h2>
          <div className="binding-list">
            {GAME_ACTIONS.map((action) => {
              const isListening =
                listening?.playerId === playerId && listening.action === action;
              return (
                <div className="binding-row" key={action}>
                  <span>{actionLabels[action]}</span>
                  <button
                    type="button"
                    className={isListening ? 'key-button key-button--listening' : 'key-button'}
                    onClick={() => setListening({ playerId, action })}
                  >
                    {isListening ? 'Нажмите клавишу…' : profiles[playerId].bindings[action]}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {listening && (
        <button type="button" className="button button--secondary" onClick={() => setListening(null)}>
          Отмена
        </button>
      )}

      {pending && (
        <div className="binding-dialog" role="alertdialog" aria-modal="true">
          <div>
            <p className="eyebrow">Конфликт клавиш</p>
            <h2>{pending.code} уже назначена</h2>
            <p>
              {playerLabels[pending.conflict.playerId]} ·{' '}
              {actionLabels[pending.conflict.action]}. Поменять назначения местами?
            </p>
            <div>
              <button type="button" className="button button--primary" onClick={replaceBinding}>
                Заменить
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setPending(null)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cloneProfiles(profiles: KeyboardProfiles): KeyboardProfiles {
  return {
    player1: { ...profiles.player1, bindings: { ...profiles.player1.bindings } },
    player2: { ...profiles.player2, bindings: { ...profiles.player2.bindings } },
  };
}

function findBinding(
  profiles: KeyboardProfiles,
  code: string,
  excluded: BindingTarget,
): BindingTarget | null {
  for (const playerId of ['player1', 'player2'] as const) {
    for (const action of GAME_ACTIONS) {
      if (playerId === excluded.playerId && action === excluded.action) continue;
      if (profiles[playerId].bindings[action] === code) return { playerId, action };
    }
  }
  return null;
}
