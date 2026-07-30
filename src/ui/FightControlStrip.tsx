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
        label="Удары"
        codes={['lp', 'hp', 'lk', 'hk'].map(
          (id) => bindingCode(bindings, id as 'lp' | 'hp' | 'lk' | 'hk'),
        )}
      />
      <ControlGroup label="Блок" codes={[bindingCode(bindings, 'block')]} />
      <ControlGroup label="Спец" codes={[bindingCode(bindings, 'special')]} />
      {selection[0] === 'idol' && <IdolMoveGroup fighterId="p1" />}
      {selection[1] === 'idol' && <IdolMoveGroup fighterId="p2" />}
      {selection[0] === 'chrono' && <ChronoMoveGroup fighterId="p1" />}
      {selection[1] === 'chrono' && <ChronoMoveGroup fighterId="p2" />}
      {selection[0] === 'mim' && <MimMoveGroup fighterId="p1" />}
      {selection[1] === 'mim' && <MimMoveGroup fighterId="p2" />}
      {selection[0] === 'glitch' && <GlitchMoveGroup fighterId="p1" />}
      {selection[1] === 'glitch' && <GlitchMoveGroup fighterId="p2" />}
      <button type="button" onClick={openControls}>Изменить</button>
    </section>
  );
}

function IdolMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="LP / HP / LK / HK"
      moves="МИКРО-ДЖЕБ · ЗВЕЗДА · СКОЛЬЖЕНИЕ · ТАНЕЦ"
    />
  );
}

function ChronoMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="LP / HP / LK / HK"
      moves="TIME JAB · TEMPORAL STRIKE · TIME SWEEP · ROUNDHOUSE"
    />
  );
}

function MimMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="LP / HP / LK / HK"
      moves="ЩЕЛЧОК · КУРСОР · БАНАН · СТУЛ"
    />
  );
}

function GlitchMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="QCF / QCB / DP + J/K"
      moves="PACKET LOSS · CORRUPTED ZONE · DESYNC JUMP"
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
