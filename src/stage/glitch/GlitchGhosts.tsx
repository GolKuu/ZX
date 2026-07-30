'use client';

import { useEffect, type RefObject } from 'react';
import {
  AdditiveBlending,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import {
  SpriteRigBody,
  type SetSpriteJoint,
} from '../sprite2d/SpriteRigBody';
import type { LoadedSpriteRig } from '../sprite2d/spriteRig';

const ignoreJoint: SetSpriteJoint = () => undefined;

export function GlitchGhosts({
  root,
  rig,
}: {
  readonly root: RefObject<Group | null>;
  readonly rig: LoadedSpriteRig;
}) {
  useEffect(() => {
    const group = root.current;
    if (group === null) return;
    group.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const material = node.material;
      if (!(material instanceof MeshBasicMaterial)) return;
      material.blending = AdditiveBlending;
      material.color.set(node.position.x > 0 ? '#ff2bd6' : '#16e6ff');
      material.depthWrite = false;
      material.opacity = 0.24;
      material.transparent = true;
      material.toneMapped = false;
      material.needsUpdate = true;
    });
  }, [root]);

  return (
    <group ref={root} visible={false}>
      <group name="desync-cyan" position={[-0.28, 0.04, -0.12]} scale={0.985}>
        <SpriteRigBody rig={rig} setJoint={ignoreJoint} />
      </group>
      <group name="desync-magenta" position={[0.24, -0.025, -0.1]} scale={1.015}>
        <SpriteRigBody rig={rig} setJoint={ignoreJoint} />
      </group>
    </group>
  );
}
