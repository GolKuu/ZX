'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Group, MathUtils, type ColorRepresentation } from 'three';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { createAttackCueMaterial } from '@/src/render/attackCueMaterial';
import { FIXED_SCALE } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';

const CUE_DURATION_SECONDS = 0.28;
const MOVE_SCALE: Readonly<Record<string, number>> = {
  '5L': 0.82,
  '5M': 0.98,
  '5H': 1.16,
  '2L': 0.78,
  '2M': 1,
  overtake: 1.24,
  'idol.lp': 0.84,
  'idol.hp': 1.22,
  'idol.lk': 0.96,
  'idol.hk': 1.18,
};

export function AttackCue() {
  return (
    <>
      <FighterAttackCue color="#45cfff" fighterId="p1" />
      <FighterAttackCue color="#a76dff" fighterId="p2" />
    </>
  );
}

function FighterAttackCue({
  color,
  fighterId,
}: {
  readonly color: ColorRepresentation;
  readonly fighterId: 'p1' | 'p2';
}) {
  const groupRef = useRef<Group>(null);
  const material = useMemo(() => createAttackCueMaterial(color), [color]);
  const materialRef = useRef(material);
  const lastSerialRef = useRef(0);
  const startTimeRef = useRef(-CUE_DURATION_SECONDS);
  const facingRef = useRef<1 | -1>(1);
  const scaleRef = useRef(1);
  const enabledRef = useRef(useRenderStore.getState().effectsEnabled);

  useEffect(() => {
    const unsubscribe = useRenderStore.subscribe((state) => {
      enabledRef.current = state.effectsEnabled;
    });
    return () => {
      unsubscribe();
      material.dispose();
    };
  }, [material]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const fighter = readCombatFighter(fighterId);
    if (group === null || fighter === null) return;

    const action = fighter.action;
    if (action !== null && action.serial !== lastSerialRef.current) {
      lastSerialRef.current = action.serial;
      startTimeRef.current = clock.elapsedTime;
      facingRef.current = fighter.facing;
      scaleRef.current = MOVE_SCALE[action.moveId] ?? 1;
    }

    const progress = (clock.elapsedTime - startTimeRef.current) / CUE_DURATION_SECONDS;
    const active = enabledRef.current && progress >= 0 && progress <= 1;
    group.visible = active;
    if (!active) return;

    const growth = MathUtils.lerp(0.72, 1.08, progress) * scaleRef.current;
    const facing = facingRef.current;
    group.position.set(
      fighter.position.x / FIXED_SCALE + facing * 0.58,
      fighter.position.y / FIXED_SCALE + 1.18,
      1.35,
    );
    group.scale.set(facing * growth, growth, 1);
    materialRef.current.uniforms.uProgress!.value = MathUtils.clamp(progress, 0, 1);
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh material={material} renderOrder={18}>
        <planeGeometry args={[2.35, 1.8]} />
      </mesh>
    </group>
  );
}
