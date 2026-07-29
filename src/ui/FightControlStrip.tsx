'use client';

import { bindingCode, keyLabel, useControlStore } from '@/src/store/controlStore';
import { useHudStore } from '@/src/store/hudStore';
import {
  AANG_ELEMENTS,
  AANG_ELEMENT_INFO,
  type CombatFighterId,
} from '@/src/aang/combat/elements';
import { useRenderStore } from '@/src/store/renderStore';
import styles from './FightControlStrip.module.css';

export function FightControlStrip() {
  const bindings = useControlStore((state) => state.bindings);
  const screen = useHudStore((state) => state.screen);
  const selection = useHudStore((state) => state.fighterSelection);
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
      {selection[0] === 'aang' && <ElementGroup fighterId="p1" />}
      {selection[1] === 'aang' && <ElementGroup fighterId="p2" />}
      {selection[0] === 'idol' && <IdolMoveGroup fighterId="p1" />}
      {selection[1] === 'idol' && <IdolMoveGroup fighterId="p2" />}
      {selection[0] === 'mim' && <MimMoveGroup fighterId="p1" />}
      {selection[1] === 'mim' && <MimMoveGroup fighterId="p2" />}
      <button type="button" onClick={openControls}>Изменить</button>
    </section>
  );
}

function ElementGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  const active = useRenderStore((state) => state.aangElements[fighterId]);
  const elements = AANG_ELEMENTS.map((element) => {
    const label = AANG_ELEMENT_INFO[element].label;
    return active === element ? `[${label}]` : label;
  }).join(' ');
  return (
    <span className={styles.elementGroup}>
      <small>{fighterId.toUpperCase()} · ↓↓ + J/K/L/U</small>
      <b>{elements}</b>
    </span>
  );
}

function IdolMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <span className={styles.elementGroup}>
      <small>{fighterId.toUpperCase()} · LP / HP / LK / HK</small>
      <b>МИКРО-ДЖЕБ · ЗВЕЗДА · СКОЛЬЖЕНИЕ · ТАНЕЦ</b>
    </span>
  );
}

function MimMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <span className={styles.elementGroup}>
      <small>{fighterId.toUpperCase()} · LP / HP / LK / HK</small>
      <b>ЩЕЛЧОК · КУРСОР · БАНАН · СТУЛ</b>
    </span>
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
