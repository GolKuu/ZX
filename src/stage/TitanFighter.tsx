'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';
import { combatRenderFrame, readCombatFighter } from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { readFighterRig, type FighterRigRefs } from './fighterRigRefs';
import { resetFighterRig, type FighterRig } from './fighterRig';
import { turnTowardOpponent, withOpponentFacing } from './fighterPresentation';
import { TitanBody } from './titan/TitanBody';
import { applyTitanCombatAnimation } from './titan/titanCombatAnimation';

export function TitanFighter({ fighterId }: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const refs = useTitanRefs();
  const rig = useRef<FighterRig | null>(null);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useFrame(({ clock }) => {
    rig.current ??= readFighterRig(refs);
    const current = rig.current;
    const fighter = readCombatFighter(fighterId);
    const opponent = readCombatFighter(opponentId);
    const group = outer.current;
    if (current === null || fighter === null || group === null) return;

    const alpha = combatRenderFrame.interpolationAlpha;
    group.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    group.position.y = fighter.position.y / FIXED_SCALE;

    const presented = withOpponentFacing(fighter, opponent);
    resetFighterRig(current, 'compact', 0);
    turnTowardOpponent(group, current.head, presented.facing);
    applyTitanCombatAnimation(current, presented, clock.elapsedTime);
  });

  return (
    <group ref={outer} scale={[1.08, 1.08, 1.08]}>
      <TitanBody refs={refs} />
    </group>
  );
}

function useTitanRefs(): FighterRigRefs {
  return {
    root: useRef<Group>(null),
    torso: useRef<Group>(null),
    head: useRef<Group>(null),
    leftArm: useRef<Group>(null),
    rightArm: useRef<Group>(null),
    leftLeg: useRef<Group>(null),
    rightLeg: useRef<Group>(null),
    leftSword: useRef<Group>(null),
    rightSword: useRef<Group>(null),
    mouthSword: useRef<Group>(null),
    slash: useRef<Group>(null),
    projectile: useRef<Group>(null),
    aura: useRef<Group>(null),
    echoes: useRef<Group>(null),
  };
}
