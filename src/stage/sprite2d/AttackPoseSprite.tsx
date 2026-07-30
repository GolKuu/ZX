'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import { DoubleSide, Mesh } from 'three';
import {
  ATTACK_POSE_NAMES,
  type AttackPoseName,
  type LoadedAttackPoses,
} from './spriteRig';

/**
 * The sheet's own attack artwork, stood on the floor.
 *
 * One quad per pose, all mounted at once and switched by visibility rather than
 * by swapping a texture — a texture swap forces a material recompile on the
 * frame the punch lands, which is the worst possible frame to drop.
 *
 * Anchored on the *ground line*, not centred. These poses have wildly different
 * bounding boxes — a sweep is two thirds the height of a high kick — so any other
 * anchor makes the fighter jump vertically between moves.
 */
export function AttackPoseSprite({
  pixelScale,
  poses,
  shown,
}: {
  /**
   * Engine units per source pixel. Independent of the rig's own scale: these
   * panels are cut from the full sheet, which is a different resolution from the
   * profile column the parts come from.
   */
  readonly pixelScale: number;
  readonly poses: LoadedAttackPoses;
  readonly shown: RefObject<AttackPoseName | null>;
}) {
  const meshes = useRef<Partial<Record<AttackPoseName, Mesh>>>({});

  useFrame(() => {
    const active = shown.current;
    for (const name of ATTACK_POSE_NAMES) {
      const mesh = meshes.current[name];
      if (mesh !== undefined) mesh.visible = name === active;
    }
  });

  return (
    <>
      {ATTACK_POSE_NAMES.map((name) => {
        const pose = poses[name];
        if (pose === undefined) return null;
        const width = pose.width * pixelScale;
        const height = pose.height * pixelScale;
        // `ground` is the floor's position down the image; lift the centred quad
        // so that row lands on y = 0.
        const lift = (pose.ground - 0.5) * height;
        return (
          <mesh
            key={name}
            position={[0, lift, 0]}
            ref={(node) => {
              if (node !== null) meshes.current[name] = node;
            }}
            visible={false}
          >
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
              alphaTest={0.08}
              map={pose.texture}
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
