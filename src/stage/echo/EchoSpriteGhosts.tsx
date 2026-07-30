'use client';

import { useEffect, type RefObject } from 'react';
import {
  AdditiveBlending,
  Mesh,
  MeshBasicMaterial,
  type Group,
} from 'three';
import { SpriteRigBody } from '../sprite2d/SpriteRigBody';
import type { LoadedSpriteRig } from '../sprite2d/spriteRig';

export function EchoSpriteGhosts({
  rig,
  root,
}: {
  readonly rig: LoadedSpriteRig;
  readonly root: RefObject<Group | null>;
}) {
  useEffect(() => {
    root.current?.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        if (!(material instanceof MeshBasicMaterial)) return;
        material.blending = AdditiveBlending;
        material.color.set('#55eaff');
        material.depthWrite = false;
        material.opacity = 0.2;
        material.toneMapped = false;
        material.transparent = true;
        material.needsUpdate = true;
      });
    });
  }, [rig, root]);

  return (
    <group ref={root} visible={false}>
      {Array.from({ length: 5 }, (_, index) => (
        <group key={index}>
          <SpriteRigBody rig={rig} setJoint={() => undefined} />
        </group>
      ))}
    </group>
  );
}
