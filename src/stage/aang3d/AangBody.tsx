/* eslint-disable react-hooks/refs -- refs are only attached for R3F. */
import type { Material } from 'three';
import { FighterPart } from '../FighterPart';
import type { FighterResources } from '../fighterResources';
import type { AangMaterials } from './aangMaterials';
import type { AangRigRefs } from './aangRig';

export function AangBody({
  materials,
  outline,
  refs,
  resources,
}: {
  readonly materials: AangMaterials;
  readonly outline: Material;
  readonly refs: AangRigRefs;
  readonly resources: FighterResources;
}) {
  return (
    <group ref={refs.root} scale={1.24}>
      <group ref={refs.leftLeg} position={[-0.15, 0.66, 0]}>
        <FighterPart geometry={resources.thigh} outlineMaterial={outline} position={[0, -0.05, 0]} scale={[0.72, 0.7, 0.72]} toonMaterial={materials.pants} />
        <FighterPart geometry={resources.shin} outlineMaterial={outline} position={[0, -0.35, 0]} scale={[0.7, 0.68, 0.7]} toonMaterial={materials.boots} />
        <FighterPart geometry={resources.foot} outlineMaterial={outline} position={[0, -0.56, 0.06]} scale={[0.9, 0.82, 0.9]} toonMaterial={materials.boots} />
      </group>
      <group ref={refs.rightLeg} position={[0.15, 0.66, 0]}>
        <FighterPart geometry={resources.thigh} outlineMaterial={outline} position={[0, -0.05, 0]} scale={[0.72, 0.7, 0.72]} toonMaterial={materials.pants} />
        <FighterPart geometry={resources.shin} outlineMaterial={outline} position={[0, -0.35, 0]} scale={[0.7, 0.68, 0.7]} toonMaterial={materials.boots} />
        <FighterPart geometry={resources.foot} outlineMaterial={outline} position={[0, -0.56, 0.06]} scale={[0.9, 0.82, 0.9]} toonMaterial={materials.boots} />
      </group>

      <group ref={refs.torso} position={[0, 1.08, 0]}>
        <FighterPart geometry={resources.hips} outlineMaterial={outline} position={[0, -0.3, 0]} scale={[0.92, 0.8, 0.9]} toonMaterial={materials.pants} />
        <FighterPart geometry={resources.waist} outlineMaterial={outline} position={[0, -0.05, 0]} scale={[0.92, 0.78, 0.9]} toonMaterial={materials.sash} />
        <FighterPart geometry={resources.chest} outlineMaterial={outline} position={[0, 0.28, 0]} scale={[0.78, 0.72, 0.78]} toonMaterial={materials.robe} />
        <FighterPart geometry={resources.collar} outlineMaterial={outline} position={[0, 0.54, 0]} scale={[0.9, 0.7, 0.9]} toonMaterial={materials.sash} />
      </group>

      <AangArm side="left" materials={materials} outline={outline} refGroup={refs.leftArm} resources={resources} />
      <AangArm side="right" materials={materials} outline={outline} refGroup={refs.rightArm} resources={resources} />

      <group ref={refs.head} position={[0, 1.78, 0]}>
        <FighterPart geometry={resources.neck} outlineMaterial={outline} position={[0, -0.19, 0]} scale={[0.85, 0.75, 0.85]} toonMaterial={materials.skin} />
        <FighterPart geometry={resources.head} outlineMaterial={outline} scale={[0.92, 1.04, 0.92]} toonMaterial={materials.skin} />
        <mesh material={materials.glow} position={[0, 0.06, 0.119]} scale={[0.12, 0.34, 0.035]}>
          <boxGeometry args={[0.13, 0.42, 0.06]} />
        </mesh>
        <mesh material={materials.glow} position={[0, 0.25, 0.119]} rotation-z={Math.PI / 4} scale={[0.1, 0.1, 0.035]}>
          <boxGeometry args={[0.18, 0.18, 0.06]} />
        </mesh>
      </group>

      <group ref={refs.staff} position={[-0.43, 1.14, -0.14]}>
        <mesh material={materials.staff} rotation-z={0.1}>
          <cylinderGeometry args={[0.025, 0.025, 1.7, 8]} />
        </mesh>
      </group>

      <group ref={refs.effect} visible={false}>
        {[0, 1, 2].map((index) => (
          <mesh
            key={index}
            material={materials.effect}
            rotation={[Math.PI / 2, index * 0.7, index * 0.9]}
            scale={1 - index * 0.18}
          >
            <torusGeometry args={[0.35, 0.035, 8, 32]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function AangArm({
  side,
  materials,
  outline,
  refGroup,
  resources,
}: {
  readonly side: 'left' | 'right';
  readonly materials: AangMaterials;
  readonly outline: Material;
  readonly refGroup: AangRigRefs['leftArm'];
  readonly resources: FighterResources;
}) {
  const direction = side === 'left' ? -1 : 1;
  return (
    <group ref={refGroup} position={[direction * 0.32, 1.39, 0]}>
      <FighterPart geometry={resources.shoulder} outlineMaterial={outline} scale={[0.72, 0.72, 0.72]} toonMaterial={materials.robe} />
      <FighterPart geometry={resources.upperArm} outlineMaterial={outline} position={[direction * 0.035, -0.19, 0]} scale={[0.72, 0.72, 0.72]} toonMaterial={materials.robe} />
      <FighterPart geometry={resources.forearm} outlineMaterial={outline} position={[direction * 0.055, -0.43, 0.02]} scale={[0.72, 0.72, 0.72]} toonMaterial={materials.skin} />
      <FighterPart geometry={resources.hand} outlineMaterial={outline} position={[direction * 0.06, -0.58, 0.03]} scale={[0.7, 0.7, 0.7]} toonMaterial={materials.skin} />
    </group>
  );
}
