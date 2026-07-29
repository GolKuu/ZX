'use client';

import { bindingCode, keyLabel, useControlStore } from '@/src/store/controlStore';
import { useHudStore } from '@/src/store/hudStore';
import styles from './FightControlStrip.module.css';

export function FightControlStrip() {
  const bindings = useControlStore((state) => state.bindings);
  const screen = useHudStore((state) => state.screen);
  if (screen !== 'fight') return null;

  const openControls = (): void => {
    const hud = useHudStore.getState();
    hud.openPause();
    hud.openControls();
  };

  return (
    <section className={styles.strip} aria-label="Управление боем">
      <ControlGroup
        label="Движение"
        codes={['up', 'left', 'down', 'right'].map(
          (id) => bindingCode(bindings, id as 'up' | 'left' | 'down' | 'right'),
        )}
      />
      <ControlGroup
        label="Удары"
        codes={['lp', 'hp', 'lk', 'hk'].map(
          (id) => bindingCode(bindings, id as 'lp' | 'hp' | 'lk' | 'hk'),
        )}
      />
      <ControlGroup label="Блок" codes={[bindingCode(bindings, 'block')]} />
      <ControlGroup label="Спец" codes={[bindingCode(bindings, 'special')]} />
      <button type="button" onClick={openControls}>Изменить</button>
    </section>
  );
}

function ControlGroup({
  codes,
  label,
}: {
  readonly codes: readonly string[];
  readonly label: string;
}) {
  return (
    <span>
      <small>{label}</small>
      <b>{codes.map(keyLabel).join(' ')}</b>
    </span>
  );
}
