import { forwardRef } from 'react';
import type { Group } from 'three';
import type { ZoroMaterials } from './zoroMaterials';
import type { ZoroResources } from './zoroResources';

interface ZoroSwordProps {
  readonly materials: ZoroMaterials;
  readonly resources: ZoroResources;
  readonly position?: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly scale?: number;
}

export const ZoroSword = forwardRef<Group, ZoroSwordProps>(
  function ZoroSword(
    {
      materials,
      resources,
      position,
      rotation,
      scale = 1,
    },
    ref,
  ) {
    return (
      <group ref={ref} position={position} rotation={rotation} scale={scale}>
        <mesh
          geometry={resources.blade}
          material={materials.blade}
          position={[0, 0.68, 0]}
        />
        <mesh
          geometry={resources.guard}
          material={materials.gold}
          rotation-x={Math.PI / 2}
        />
        <mesh
          geometry={resources.handle}
          material={materials.handle}
          position={[0, -0.25, 0]}
        />
        {[0.05, -0.08, -0.21, -0.34].map((y) => (
          <mesh
            key={y}
            geometry={resources.guard}
            material={materials.gold}
            position={[0, y, 0]}
            rotation-x={Math.PI / 2}
            scale={0.34}
          />
        ))}
      </group>
    );
  },
);
