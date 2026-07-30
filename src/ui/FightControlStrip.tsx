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
    <section className={styles.strip} aria-label="РЈРїСЂР°РІР»РµРЅРёРµ Р±РѕРµРј">
      <ControlGroup
        label="Р”РІРёР¶РµРЅРёРµ"
        codes={['up', 'left', 'down', 'right'].map(
          (id) => bindingCode(bindings, id as 'up' | 'left' | 'down' | 'right'),
        )}
      />
      <ControlGroup
        label="РЈРґР°СЂС‹"
        codes={['lp', 'hp', 'lk', 'hk'].map(
          (id) => bindingCode(bindings, id as 'lp' | 'hp' | 'lk' | 'hk'),
        )}
      />
      <ControlGroup label="Р‘Р»РѕРє" codes={[bindingCode(bindings, 'block')]} />
      <ControlGroup label="Р С‹РІРѕРє" codes={[bindingCode(bindings, 'dash')]} />
      <ControlGroup label="РЎСѓРїРµСЂ" codes={[bindingCode(bindings, 'super')]} />
      <ControlGroup label="РЈР»СЊС‚Р°" codes={[bindingCode(bindings, 'ultimate')]} />
      <ControlGroup label="РќР°СЃРјРµС€РєР°" codes={[bindingCode(bindings, 'taunt')]} />
      {selection[0] === 'chrono' && <ChronoMoveGroup fighterId="p1" />}
      {selection[1] === 'chrono' && <ChronoMoveGroup fighterId="p2" />}
      {selection[0] === 'mim' && <MimMoveGroup fighterId="p1" />}
      {selection[1] === 'mim' && <MimMoveGroup fighterId="p2" />}
      {selection[0] === 'glitch' && <GlitchMoveGroup fighterId="p1" />}
      {selection[1] === 'glitch' && <GlitchMoveGroup fighterId="p2" />}
      {selection[0] === 'echo' && <EchoMoveGroup fighterId="p1" />}
      {selection[1] === 'echo' && <EchoMoveGroup fighterId="p2" />}
      <button type="button" onClick={openControls}>РЈРїСЂР°РІР»РµРЅРёРµ</button>
    </section>
  );
}

function ChronoMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="U В· 1 / 3 В· O ULT"
      moves="РџР•Р Р•РњРћРўРљРђ В· 143 РРЎРҐРћР”Рђ В· РќР•РР—Р‘Р•Р–РќРћРЎРўР¬"
    />
  );
}

function MimMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="U В· 1 / 3 В· O ULT"
      moves="РџР РђРќРљ В· Р“Р›РђР’РќР«Р™ Р“Р•Р РћР™ В· ALT+F4"
    />
  );
}

function GlitchMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="QCF / QCB / DP + J/K"
      moves="PACKET LOSS В· CORRUPTED ZONE В· DESYNC JUMP"
    />
  );
}

function EchoMoveGroup({ fighterId }: { readonly fighterId: CombatFighterId }) {
  return (
    <MoveGroup
      fighterId={fighterId}
      hint="U+J / U+I / O"
      moves="РђРќРђР›РР— В· РџРћР’РўРћР  В· РЎРўРђРўРРЎРўРРљРђ"
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
      <small>{fighterId.toUpperCase()} В· {hint}</small>
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

