/* eslint-disable react-hooks/refs -- R3F attaches these refs during commit. */
import type { Material } from 'three';
import { FighterPart } from '../FighterPart';
import type { MimMaterials } from './mimMaterials';
import { MimProps } from './MimProps';
import type { MimResources } from './mimResources';
import type { MimRigRefs } from './mimRig';

interface MimBodyProps {
  readonly materials: MimMaterials;
  readonly outline: Material;
  readonly refs: MimRigRefs;
  readonly resources: MimResources;
}

const ARMS = [
  { id: 'left', key: 'leftArm', x: -0.39 },
  { id: 'right', key: 'rightArm', x: 0.39 },
] as const;

const LEGS = [
  { id: 'left', key: 'leftLeg', x: -0.19 },
  { id: 'right', key: 'rightLeg', x: 0.19 },
] as const;

export function MimBody({
  materials,
  outline,
  refs,
  resources,
}: MimBodyProps) {
  return (
    <group ref={refs.root}>
      <group ref={refs.torso}>
        <FighterPart
          geometry={resources.torso}
          outlineMaterial={outline}
          scale={[1.18, 1, 0.78]}
          toonMaterial={materials.hoodie}
        />
        <mesh
          geometry={resources.hood}
          material={materials.hoodie}
          position={[0, 0.52, -0.08]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={resources.pouch}
          material={materials.purple}
          position={[0, -0.22, 0.25]}
        />
        {[-0.1, 0.1].map((x) => (
          <mesh
            key={x}
            geometry={resources.drawstring}
            material={materials.yellow}
            position={[x, 0.27, 0.29]}
          />
        ))}
      </group>

      <group ref={refs.head}>
        <FighterPart
          geometry={resources.head}
          outlineMaterial={outline}
          toonMaterial={materials.yellow}
        />
        {[-0.075, 0.075].map((x) => (
          <mesh
            key={x}
            geometry={resources.eye}
            material={materials.eye}
            position={[x, 0, 0.22]}
          />
        ))}
      </group>

      {ARMS.map(({ id, key, x }) => (
        <group key={id} ref={refs[key]} position={[x, 1.72, 0]}>
          <FighterPart
            geometry={resources.arm}
            outlineMaterial={outline}
            position={[0, -0.31, 0]}
            toonMaterial={materials.hoodie}
          />
          <FighterPart
            geometry={resources.hand}
            outlineMaterial={outline}
            position={[0, -0.7, 0]}
            toonMaterial={materials.yellow}
          />
        </group>
      ))}

      {LEGS.map(({ id, key, x }) => (
        <group key={id} ref={refs[key]} position={[x, 0.78, 0]}>
          <FighterPart
            geometry={resources.leg}
            outlineMaterial={outline}
            position={[0, -0.32, 0]}
            toonMaterial={materials.purple}
          />
          <group position={[0, -0.75, 0.11]}>
            <FighterPart
              geometry={resources.shoe}
              outlineMaterial={outline}
              toonMaterial={materials.white}
            />
            <mesh
              geometry={resources.sole}
              material={materials.purple}
              position={[0, -0.12, 0]}
            />
          </group>
        </group>
      ))}

      <group ref={refs.scarf}>
        <mesh geometry={resources.knot} material={materials.yellow} />
        <mesh
          geometry={resources.scarfTail}
          material={materials.yellow}
          position={[-0.43, -0.2, -0.04]}
          rotation={[0, 0, -1.05]}
        />
        <mesh
          geometry={resources.scarfTail}
          material={materials.yellow}
          position={[-0.67, -0.06, -0.06]}
          rotation={[0, 0, -1.32]}
          scale={[0.82, 0.82, 0.82]}
        />
      </group>

      <MimProps
        materials={materials}
        refs={refs}
        resources={resources}
      />
    </group>
  );
}
