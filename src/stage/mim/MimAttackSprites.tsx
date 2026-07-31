'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import { DoubleSide, Mesh } from 'three';
import {
  MIM_ATTACK_NAMES,
  type LoadedMimAttacks,
  type MimAttackName,
} from './mimSpriteRig';

export function MimAttackSprites({
  attacks,
  pixelScale,
  shown,
}: {
  readonly attacks: LoadedMimAttacks;
  readonly pixelScale: number;
  readonly shown: RefObject<MimAttackName | null>;
}) {
  const meshes = useRef<Partial<Record<MimAttackName, Mesh>>>({});

  useFrame(() => {
    for (const name of MIM_ATTACK_NAMES) {
      const mesh = meshes.current[name];
      if (mesh !== undefined) mesh.visible = shown.current === name;
    }
  });

  return (
    <>
      {MIM_ATTACK_NAMES.map((name) => {
        const attack = attacks[name];
        const width = attack.width * pixelScale;
        const height = attack.height * pixelScale;
        return (
          <mesh
            key={name}
            position={[
              (0.5 - attack.originX) * width,
              (attack.ground - 0.5) * height,
              0,
            ]}
            ref={(node) => {
              if (node !== null) meshes.current[name] = node;
            }}
            visible={false}
          >
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
              alphaTest={0.08}
              map={attack.texture}
              side={DoubleSide}
              toneMapped={false}
              transparent
            />
          </mesh>
        );
      })}
    </>
  );
}
