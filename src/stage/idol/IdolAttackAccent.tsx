'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import { DoubleSide, Group } from 'three';
import type { AttackPoseName } from '../sprite2d/spriteRig';

const GOLD = '#ffc857';
const LIGHT = '#fff4d6';

/** Clean, procedural contact accents for IDOL's four sheet-authored attacks. */
export function IdolAttackAccent({
  shown,
}: {
  readonly shown: RefObject<AttackPoseName | null>;
}) {
  const lp = useRef<Group>(null);
  const hp = useRef<Group>(null);
  const lk = useRef<Group>(null);
  const hk = useRef<Group>(null);

  useFrame(({ clock }) => {
    const active = shown.current;
    const pulse = 0.98 + Math.sin(clock.elapsedTime * 28) * 0.025;
    updateGroup(lp.current, active === 'lp', pulse);
    updateGroup(hp.current, active === 'hp', pulse);
    updateGroup(lk.current, active === 'lk', pulse);
    updateGroup(hk.current, active === 'hk', pulse);
  });

  return (
    <>
      <group ref={lp} visible={false}>
        <Streak position={[0.76, 1.38, 0.12]} width={0.72} />
        <Spark position={[1.14, 1.4, 0.13]} size={0.13} />
      </group>
      <group ref={hp} visible={false}>
        <Crescent
          position={[0.22, 1.2, 0.11]}
          radius={0.84}
          rotation={-0.7}
          sweep={3.9}
        />
        <Spark position={[0.78, 1.7, 0.13]} size={0.16} />
      </group>
      <group ref={lk} visible={false}>
        <Streak position={[0.46, 0.25, 0.12]} width={1.05} />
        <Streak position={[0.22, 0.16, 0.11]} width={0.72} />
        <Spark position={[0.98, 0.28, 0.13]} size={0.11} />
      </group>
      <group ref={hk} visible={false}>
        <Crescent
          position={[0.38, 1.2, 0.11]}
          radius={0.96}
          rotation={-1.05}
          sweep={3.55}
        />
        <Spark position={[1.18, 1.58, 0.13]} size={0.15} />
      </group>
    </>
  );
}

function updateGroup(group: Group | null, visible: boolean, scale: number): void {
  if (group === null) return;
  group.visible = visible;
  group.scale.setScalar(scale);
}

function Crescent({
  position,
  radius,
  rotation,
  sweep,
}: {
  readonly position: [number, number, number];
  readonly radius: number;
  readonly rotation: number;
  readonly sweep: number;
}) {
  return (
    <mesh position={position} rotation={[0, 0, rotation]} renderOrder={6}>
      <ringGeometry args={[radius - 0.045, radius, 48, 1, 0, sweep]} />
      <meshBasicMaterial
        color={GOLD}
        depthWrite={false}
        opacity={0.82}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}

function Streak({
  position,
  width,
}: {
  readonly position: [number, number, number];
  readonly width: number;
}) {
  return (
    <mesh position={position} rotation={[0, 0, 0.04]} renderOrder={6}>
      <planeGeometry args={[width, 0.035]} />
      <meshBasicMaterial
        color={LIGHT}
        depthWrite={false}
        opacity={0.8}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}

function Spark({
  position,
  size,
}: {
  readonly position: [number, number, number];
  readonly size: number;
}) {
  return (
    <group position={position}>
      <Streak position={[0, 0, 0]} width={size * 2.4} />
      <group rotation={[0, 0, Math.PI / 2]}>
        <Streak position={[0, 0, 0.001]} width={size * 2.4} />
      </group>
    </group>
  );
}
