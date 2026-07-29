'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import {
  AdditiveBlending,
  Group,
  MathUtils,
  MeshBasicMaterial,
} from 'three';
import {
  AANG_ELEMENT_INFO,
  elementFromMove,
  shiftElementFromMove,
  type CombatFighterId,
} from '@/src/aang/combat/elements';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';
import { combatAnimationProgress } from './combatAnimationProgress';

const ELEMENT_SHAPE = {
  air: [1, 1],
  fire: [1.45, .62],
  earth: [.86, 1.2],
  water: [1.65, .48],
} as const;

export function AangElementVfx({
  fighterId,
}: {
  readonly fighterId: CombatFighterId;
}) {
  const group = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const currentElement = useRenderStore((state) => state.aangElements[fighterId]);
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useFrame(({ clock }) => {
    const effect = group.current;
    const fighter = readCombatFighter(fighterId);
    const action = fighter?.action;
    if (effect === null || fighter === null || action == null || !effectsEnabled) {
      if (effect !== null) effect.visible = false;
      return;
    }
    const element =
      elementFromMove(action.moveId)
      ?? shiftElementFromMove(action.moveId)
      ?? (action.moveId === 'elemental-cocoon' || action.moveId === 'avatar-state'
        ? currentElement
        : null);
    if (element === null) {
      effect.visible = false;
      return;
    }

    const progress = combatAnimationProgress(action.moveId, action.frame);
    const opponent = readCombatFighter(opponentId);
    const origin = fighter.position.x / FIXED_SCALE;
    const destination = (opponent?.position.x ?? fighter.position.x) / FIXED_SCALE;
    const stationary = action.moveId.startsWith('element-shift') || action.moveId === 'earth-wall';
    const x = stationary
      ? origin + fighter.facing * .55
      : MathUtils.lerp(origin + fighter.facing * .5, destination, MathUtils.smootherstep(progress, .18, .65));
    const pulse = .55 + .72 * Math.sin(Math.min(1, progress) * Math.PI);
    const [length, height] = ELEMENT_SHAPE[element];
    effect.visible = true;
    effect.position.set(
      x,
      fighter.position.y / FIXED_SCALE + (element === 'earth' ? .34 : 1.08),
      1.05,
    );
    effect.rotation.z = clock.elapsedTime * (element === 'water' ? 2.4 : 1.3);
    effect.scale.set(fighter.facing * pulse * length, pulse * height, pulse);
    material.current?.color.set(AANG_ELEMENT_INFO[element].color);
  });

  return (
    <group ref={group} visible={false}>
      <mesh>
        <octahedronGeometry args={[.48, 1]} />
        <meshBasicMaterial
          ref={material}
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={.78}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}
