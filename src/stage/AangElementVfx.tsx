'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group, MathUtils } from 'three';
import {
  elementFromMove,
  shiftElementFromMove,
  type AangCombatElement,
  type CombatFighterId,
} from '@/src/aang/combat/elements';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';
import { combatAnimationProgress } from './combatAnimationProgress';

export function AangElementVfx({
  fighterId,
}: {
  readonly fighterId: CombatFighterId;
}) {
  const air = useRef<Group>(null);
  const fire = useRef<Group>(null);
  const earth = useRef<Group>(null);
  const water = useRef<Group>(null);
  const currentElement = useRenderStore((state) => state.aangElements[fighterId]);
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useFrame(({ clock }) => {
    const groups = { air: air.current, fire: fire.current, earth: earth.current, water: water.current };
    for (const group of Object.values(groups)) {
      if (group !== null) group.visible = false;
    }
    if (!effectsEnabled) return;
    const fighter = readCombatFighter(fighterId);
    const action = fighter?.action;
    if (fighter === null || action === null || action === undefined) return;

    const allElements = action.moveId === 'elemental-cocoon' || action.moveId === 'avatar-state';
    const shifted = shiftElementFromMove(action.moveId);
    const actionElement = elementFromMove(action.moveId) ?? shifted;
    if (!allElements && actionElement === null) return;

    const progress = combatAnimationProgress(action.moveId, action.frame);
    const opponent = readCombatFighter(opponentId);
    const originX = fighter.position.x / FIXED_SCALE;
    const targetX = opponent?.position.x === undefined
      ? originX + fighter.facing * 1.8
      : opponent.position.x / FIXED_SCALE;
    const stationary = shifted !== null || allElements || action.moveId === 'earth-wall';
    const travel = MathUtils.smootherstep(progress, 0.18, 0.65);
    const x = stationary
      ? originX + fighter.facing * 0.55
      : MathUtils.lerp(originX + fighter.facing * 0.5, targetX, travel);
    const baseY = fighter.position.y / FIXED_SCALE;
    const scale = 0.55 + Math.sin(Math.min(1, progress) * Math.PI) * 0.72;
    const spin = clock.elapsedTime * (allElements ? 2.8 : 1.4);

    for (const element of elementsToShow(actionElement ?? currentElement, allElements)) {
      const group = groups[element];
      if (group === null) continue;
      group.visible = true;
      group.position.set(x, baseY + effectHeight(element, action.moveId), 1.05);
      group.rotation.z = spin * (element === 'water' || element === 'air' ? 1 : -0.45);
      group.scale.set(fighter.facing * scale, scale, scale);
      if (allElements) {
        const index = ['air', 'fire', 'earth', 'water'].indexOf(element);
        group.position.x = originX + Math.cos(spin + index * Math.PI / 2) * 0.72;
        group.position.y = baseY + 1.05 + Math.sin(spin + index * Math.PI / 2) * 0.6;
      }
    }
  });

  return (
    <>
      <group ref={air} visible={false}><AirEffect /></group>
      <group ref={fire} visible={false}><FireEffect /></group>
      <group ref={earth} visible={false}><EarthEffect /></group>
      <group ref={water} visible={false}><WaterEffect /></group>
    </>
  );
}

function elementsToShow(
  selected: AangCombatElement,
  all: boolean,
): readonly AangCombatElement[] {
  return all ? ['air', 'fire', 'earth', 'water'] : [selected];
}

function effectHeight(element: AangCombatElement, moveId: string): number {
  if (element === 'earth') return moveId === 'earth-wall' ? 0.75 : 0.28;
  if (element === 'water' && moveId === 'water-diagonal') return 1.55;
  return element === 'fire' ? 1 : 1.16;
}

const materialProps = {
  blending: 2,
  depthWrite: false,
  opacity: 0.82,
  toneMapped: false,
  transparent: true,
} as const;

function AirEffect() {
  return <>{[0.24, 0.38, 0.52].map((radius) => (
    <mesh key={radius}><torusGeometry args={[radius, 0.035, 8, 32]} /><meshBasicMaterial {...materialProps} color="#b9f5ff" /></mesh>
  ))}</>;
}

function FireEffect() {
  return <group rotation-z={-Math.PI / 2}>
    <mesh scale={[0.7, 1.25, 0.7]}><coneGeometry args={[0.38, 1.1, 8]} /><meshBasicMaterial {...materialProps} color="#ff542e" /></mesh>
    <mesh position={[0, -0.2, 0]} scale={0.6}><dodecahedronGeometry args={[0.48, 0]} /><meshBasicMaterial {...materialProps} color="#ffd05b" /></mesh>
  </group>;
}

function EarthEffect() {
  return <>{[-0.34, 0, 0.34].map((offset, index) => (
    <mesh key={offset} position={[offset, index % 2 * 0.16, 0]} rotation-z={index * 0.35} scale={[0.7, 1.2, 0.7]}>
      <octahedronGeometry args={[0.34, 0]} /><meshBasicMaterial {...materialProps} color={index === 1 ? '#caa06a' : '#7ea352'} />
    </mesh>
  ))}</>;
}

function WaterEffect() {
  return <>{[0, 0.15, 0.3].map((offset) => (
    <mesh key={offset} position={[offset, offset - 0.15, 0]} rotation-z={offset * 1.8}>
      <torusGeometry args={[0.42, 0.065, 8, 32, Math.PI * 1.45]} /><meshBasicMaterial {...materialProps} color="#5cc8ff" />
    </mesh>
  ))}</>;
}
