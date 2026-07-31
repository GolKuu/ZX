'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Mesh } from 'three';
import {
  MIM_ATTACK_NAMES,
  type LoadedMimAttacks,
  type MimAttackName,
} from './mimSpriteRig';
import { createMimCutoutMaterial } from './mimCutoutMaterial';

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
        return (
          <AttackPlane
            attack={attack}
            key={name}
            meshRef={(node) => {
              if (node !== null) meshes.current[name] = node;
            }}
            pixelScale={pixelScale}
          />
        );
      })}
    </>
  );
}

function AttackPlane({
  attack,
  meshRef,
  pixelScale,
}: {
  readonly attack: LoadedMimAttacks[MimAttackName];
  readonly meshRef: (node: Mesh | null) => void;
  readonly pixelScale: number;
}) {
  const width = attack.width * pixelScale;
  const height = attack.height * pixelScale;
  const material = useMemo(
    () => createMimCutoutMaterial(attack.texture, 0.62),
    [attack.texture],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh
      position={[
        (0.5 - attack.originX) * width,
        (attack.ground - 0.5) * height,
        0,
      ]}
      ref={meshRef}
      visible={false}
    >
      <planeGeometry args={[width, height]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}
