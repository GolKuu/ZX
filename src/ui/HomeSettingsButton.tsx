'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  bindingCode,
  keyLabel,
  useControlStore,
} from '@/src/store/controlStore';
import { useRenderStore } from '@/src/store/renderStore';
import buttonStyles from './HomeSettingsButton.module.css';
import controlsStyles from './HomeSettingsControls.module.css';
import dialogStyles from './HomeSettingsDialog.module.css';
import panelStyles from './HomeSettingsPanel.module.css';

type SettingsButtonProps = {
  readonly variant: 'compact' | 'secondary';
};

const MOVE_IDS = ['up', 'left', 'down', 'right', 'dash'] as const;
const ATTACK_IDS = ['lp', 'hp', 'lk', 'hk', 'block'] as const;
const METER_IDS = ['super', 'ultimate', 'taunt'] as const;

export function HomeSettingsButton({ variant }: SettingsButtonProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const hydratePreferences = useRenderStore((state) => state.hydratePreferences);
  const toggleEffects = useRenderStore((state) => state.toggleEffects);
  const bindings = useControlStore((state) => state.bindings);
  const hydrateControls = useControlStore((state) => state.hydrate);
  const resetControls = useControlStore((state) => state.reset);

  useEffect(() => {
    hydratePreferences();
    hydrateControls();
  }, [hydrateControls, hydratePreferences]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.code === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const movement = MOVE_IDS.map((id) => keyLabel(bindingCode(bindings, id)));
  const attacks = ATTACK_IDS.map((id) => keyLabel(bindingCode(bindings, id)));
  const meters = METER_IDS.map((id) => keyLabel(bindingCode(bindings, id)));

  return (
    <>
      <button
        className={
          variant === 'compact'
            ? buttonStyles.compactTrigger
            : buttonStyles.secondaryTrigger
        }
        type="button"
        onClick={() => setOpen(true)}
      >
        <SettingsIcon />
        <span>Настройки</span>
      </button>

      {open && createPortal(
        <div className={dialogStyles.scrim} onMouseDown={() => setOpen(false)}>
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={dialogStyles.dialog}
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>CC // ПАРАМЕТРЫ</span>
                <h2 id={titleId}>Настройки</h2>
                <p>Выбор сохранится на этом устройстве.</p>
              </div>
              <button
                aria-label="Закрыть настройки"
                className={dialogStyles.close}
                type="button"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>

            <div className={panelStyles.settingRow}>
              <div>
                <strong>Боевые эффекты</strong>
                <p>Вспышки, линии скорости и кинематографические удары.</p>
              </div>
              <button
                aria-pressed={effectsEnabled}
                className={panelStyles.toggle}
                type="button"
                onClick={toggleEffects}
              >
                <i aria-hidden="true" />
                <span>{effectsEnabled ? 'Вкл.' : 'Выкл.'}</span>
              </button>
            </div>

            <section className={controlsStyles.controls} aria-label="Текущая раскладка">
              <div className={controlsStyles.controlsHeading}>
                <div>
                  <strong>Управление</strong>
                  <p>Отдельные клавиши можно изменить в меню паузы.</p>
                </div>
                <button type="button" onClick={resetControls}>Сбросить</button>
              </div>
              <KeyRow label="Движение" keys={movement} />
              <KeyRow label="Удары" keys={attacks} />
              <KeyRow label="Супер · Ульта" keys={meters} />
            </section>

            <button className={panelStyles.done} type="button" onClick={() => setOpen(false)}>
              Готово
            </button>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

function KeyRow({ label, keys }: { readonly label: string; readonly keys: readonly string[] }) {
  return (
    <div className={controlsStyles.keyRow}>
      <span>{label}</span>
      <div>{keys.map((key, index) => <kbd key={`${key}-${index}`}>{key}</kbd>)}</div>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M8.3 2.3h3.4l.5 2a6.2 6.2 0 0 1 1.2.7l2-.6 1.7 3-1.5 1.4a6 6 0 0 1 0 1.4l1.5 1.4-1.7 3-2-.6a6.2 6.2 0 0 1-1.2.7l-.5 2H8.3l-.5-2a6.2 6.2 0 0 1-1.2-.7l-2 .6-1.7-3 1.5-1.4a6 6 0 0 1 0-1.4L2.9 7.4l1.7-3 2 .6a6.2 6.2 0 0 1 1.2-.7l.5-2Z" />
      <circle cx="10" cy="9.5" r="2.3" />
    </svg>
  );
}
