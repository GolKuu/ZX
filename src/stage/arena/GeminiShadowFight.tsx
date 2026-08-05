'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import {
  MathUtils,
  type Group,
} from 'three';
import type { RefObject } from 'react';

const LEFT_X = -2.45;
const RIGHT_X = 2.45;

export function GeminiShadowFight() {
  const leftRoot = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightRoot = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    animateRig(leftRoot.current, leftArm.current, leftLeg.current, time, 1, LEFT_X);
    animateRig(rightRoot.current, rightArm.current, rightLeg.current, time + 0.16, -1, RIGHT_X);
  });

  return (
    <group position={[0, 1.05, -10.5]} renderOrder={-8}>
      <ShadowFighter armRef={leftArm} color="#56e7ff" legRef={leftLeg} rootRef={leftRoot} />
      <ShadowFighter armRef={rightArm} color="#c278ff" legRef={rightLeg} mirrored rootRef={rightRoot} />

      <group position={[0, -0.14, -0.02]}>
        <mesh scale={[5.6, 0.09, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#071412" depthWrite={false} opacity={0.68} transparent />
        </mesh>
        <mesh position={[0, 0.08, 0.01]} scale={[2.7, 0.018, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="#9cedff" depthWrite={false} opacity={0.48} toneMapped={false} transparent />
        </mesh>
      </group>
    </group>
  );
}

function animateRig(
  root: Group | null,
  arm: Group | null,
  leg: Group | null,
  time: number,
  facing: 1 | -1,
  baseX: number,
) {
  if (root === null || arm === null || leg === null) return;

  const flurry = Math.sin(time * 17.5);
  const dash = Math.pow(Math.max(0, Math.sin(time * 4.2)), 7);
  const jump = Math.pow(Math.max(0, Math.sin(time * 2.1 + 0.45)), 5);
  const recoil = Math.sin(time * 8.4) * 0.12;

  root.position.x = baseX + facing * (dash * 1.75 + recoil);
  root.position.y = jump * 0.72;
  root.rotation.z = facing * (-0.08 - dash * 0.24 + flurry * 0.035);
  root.scale.y = MathUtils.lerp(1, 0.88, dash);
  arm.rotation.z = facing * (-0.7 - flurry * 1.1 - dash * 0.5);
  leg.rotation.z = facing * (0.12 + Math.sin(time * 11.3) * 0.72 + dash * 0.55);
}

function ShadowFighter({
  armRef,
  color,
  legRef,
  mirrored = false,
  rootRef,
}: {
  readonly armRef: RefObject<Group | null>;
  readonly color: string;
  readonly legRef: RefObject<Group | null>;
  readonly mirrored?: boolean;
  readonly rootRef: RefObject<Group | null>;
}) {
  const direction = mirrored ? -1 : 1;
  return (
    <group
      ref={rootRef}
      position-x={mirrored ? RIGHT_X : LEFT_X}
      scale-x={direction}
    >
      <mesh position={[0, 1.74, 0]} scale={[0.27, 0.32, 1]}>
        <circleGeometry args={[1, 16]} />
        <ShadowMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.03, 0]} scale={[0.44, 0.7, 1]}>
        <capsuleGeometry args={[0.5, 0.9, 4, 8]} />
        <ShadowMaterial color={color} />
      </mesh>

      <group ref={armRef} position={[0.17, 1.36, 0.01]}>
        <Limb color={color} length={0.88} />
        <mesh position={[0, -0.88, 0]} scale={0.13}>
          <circleGeometry args={[1, 10]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      </group>
      <group ref={legRef} position={[0.16, 0.56, 0]}>
        <Limb color={color} length={0.92} width={0.16} />
      </group>
      <group position={[-0.18, 0.55, -0.01]} rotation-z={-0.18 * direction}>
        <Limb color={color} length={0.86} width={0.15} />
      </group>

      <mesh position={[0.1, 1.75, 0.03]} scale={[0.09, 0.025, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Limb({ color, length, width = 0.13 }: {
  readonly color: string;
  readonly length: number;
  readonly width?: number;
}) {
  return (
    <mesh position={[0, -length / 2, 0]} scale={[width, length, 1]}>
      <capsuleGeometry args={[0.5, 0.45, 3, 6]} />
      <ShadowMaterial color={color} />
    </mesh>
  );
}

function ShadowMaterial({ color }: { readonly color: string }) {
  return (
    <meshBasicMaterial
      color="#071014"
      depthWrite={false}
      opacity={0.88}
      transparent
      userData={{ geminiRim: color }}
    />
  );
}
