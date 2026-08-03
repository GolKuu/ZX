'use client';

import { bindingCode, keyLabel, useControlStore } from '@/src/store/controlStore';
import { useHudStore } from '@/src/store/hudStore';
import styles from './FightControlStrip.module.css';

type CombatFighterId = 'p1' | 'p2';

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
        label="Атаки J K I L"
        codes={['lp', 'lk', 'hp', 'hk'].map(
          (id) => bindingCode(bindings, id as 'lp' | 'lk' | 'hp' | 'hk'),
        )}
      />
      <ControlGroup label="Блок" codes={[bindingCode(bindings, 'block')]} />
      <ControlGroup label="Рывок" codes={[bindingCode(bindings, 'dash')]} />
      <ControlGroup label="Супер" codes={[bindingCode(bindings, 'super')]} />
      <ControlGroup label="Ультимейт" codes={[bindingCode(bindings, 'ultimate')]} />
      <ControlGroup label="Насмешка" codes={[bindingCode(bindings, 'taunt')]} />
      {selection[0] === 'mim' && <MimMoveGroup fighterId="p1" />}
      {selection[1] === 'mim' && <MimMoveGroup fighterId="p2" />}
      {selection[0] === 'glitch' && <GlitchMoveGroup fighterId="p1" />}
      {selection[1] === 'glitch' && <GlitchMoveGroup fighterId="p2" />}
      {selection[0] === 'vorgh' && <VorghMoveGroup fighterId="p1" />}
      {selection[1] === 'vorgh' && <VorghMoveGroup fighterId="p2" />}
      <button type="button" onClick={openControls}>Все приёмы</button>
    </section>
  );
}

function VorghMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="четверть круга вперёд/назад, Z-ввод · Shift+U"
      moves="RAGE SLASH · BERSERK DASH · LAST BEAST"
    />
  );
}

function MimMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="U В· 1 / 3 В· O ULT"
      moves="ПРАНК · ГЛАВНЫЙ ГЕРОЙ · ALT+F4"
    />
  );
}

function GlitchMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="четверть круга вперёд/назад или Z-ввод + J/K"
      moves="PACKET LOSS В· CORRUPTED ZONE В· DESYNC JUMP"
    />
  );
}

function MoveGroup({
  fighterId,
  hint,
  moves,
}: {
  readonly fighterId: CombatFighterId;
  readonly hint: string;
  readonly moves: string;
}) {
  return (
    <span className={styles.elementGroup}>
      <small>{fighterId.toUpperCase()} · {hint}</small>
      <b>{moves}</b>
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

