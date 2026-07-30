import type { Material } from 'three';
import { FighterPart } from '../FighterPart';
import type { EchoMaterials } from './echoMaterials';
import type { EchoResources } from './echoResources';

export function EchoSilhouetteDetails({
  materials,
  outline,
  resources,
}: {
  readonly materials: EchoMaterials;
  readonly outline: Material;
  readonly resources: EchoResources;
}) {
  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.39, 1.73, -0.03]}>
          <FighterPart
            geometry={resources.coatTail}
            outlineMaterial={outline}
            rotation={[0, side * 0.16, side * -0.84]}
            scale={[0.28, 0.24, 0.72]}
            toonMaterial={materials.white}
          />
          <mesh
            geometry={resources.ringNode}
            material={materials.electric}
            position={[side * 0.08, 0.07, 0.08]}
          />
        </group>
      ))}

      <group position={[0, 1.46, -0.17]}>
        {[-1, 0, 1].map((index) => (
          <mesh
            geometry={resources.telemetry}
            key={index}
            material={index === 0 ? materials.mirror : materials.electric}
            position={[0, index * 0.17, index === 0 ? 0.01 : 0]}
            rotation-z={Math.PI / 2}
            scale={[0.65, 0.42 + Math.abs(index) * 0.22, 1]}
          />
        ))}
      </group>
    </>
  );
}
