/* eslint-disable react-hooks/refs -- R3F attaches the supplied ref. */
import type { RefObject } from 'react';
import type { Group } from 'three';
import type { EchoMaterials } from './echoMaterials';
import type { EchoResources } from './echoResources';

export function EchoPredictionEffects({
  materials,
  predictionRef,
  resources,
}: {
  readonly materials: EchoMaterials;
  readonly predictionRef: RefObject<Group | null>;
  readonly resources: EchoResources;
}) {
  return (
    <group ref={predictionRef}>
      <group>
        {[0, 1, 2].map((index) => (
          <mesh
            geometry={resources.ring}
            key={index}
            material={index === 1 ? materials.electric : materials.glow}
          />
        ))}
        {[-1, 1].map((side) => (
          <mesh
            geometry={resources.telemetry}
            key={side}
            material={materials.glow}
            rotation-z={Math.PI / 2}
            scale={[0.7, 1.6, 1]}
          />
        ))}
      </group>

      <group>
        {Array.from({ length: 5 }, (_, index) => (
          <mesh
            geometry={resources.telemetry}
            key={index}
            material={materials.electric}
            scale={[0.55, 2.8 - index * 0.24, 1]}
          />
        ))}
      </group>

      <group>
        {Array.from({ length: 10 }, (_, index) => (
          <mesh
            geometry={resources.telemetry}
            key={index}
            material={index % 3 === 0 ? materials.mirror : materials.hologram}
            scale={[0.6 + (index % 2) * 0.5, 0.22, 1]}
          />
        ))}
      </group>

      <group>
        <mesh
          geometry={resources.ghostBody}
          material={materials.hologram}
          position={[0, 1.12, 0]}
        />
        <mesh
          geometry={resources.ghostHead}
          material={materials.hologram}
          position={[0, 1.74, 0]}
        />
      </group>
    </group>
  );
}
