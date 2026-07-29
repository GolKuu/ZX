/* eslint-disable react-hooks/refs -- refs are only attached for R3F. */
import type { Material } from 'three';
import { FighterPart } from '../FighterPart';
import type { FighterResources } from '../fighterResources';
import type { ChronoMaterials } from './chronoMaterials';
import type { ChronoRigRefs } from './chronoRig';

export function ChronoBody({
  materials,
  outline,
  refs,
  resources,
}: {
  readonly materials: ChronoMaterials;
  readonly outline: Material;
  readonly refs: ChronoRigRefs;
  readonly resources: FighterResources;
}) {
  return (
    <group ref={refs.root} scale={1.2}>
      <ChronoLeg side="left" materials={materials} outline={outline} refGroup={refs.leftLeg} resources={resources} />
      <ChronoLeg side="right" materials={materials} outline={outline} refGroup={refs.rightLeg} resources={resources} />

      <group ref={refs.coat} position={[0, 0.92, -0.04]}>
        <FighterPart geometry={resources.coat} outlineMaterial={outline} position={[0, -0.1, 0]} scale={[0.92, 1.78, 0.82]} toonMaterial={materials.coat} />
        <FighterPart geometry={resources.belt} outlineMaterial={outline} position={[0, 0.3, 0]} scale={[0.94, 0.72, 0.9]} toonMaterial={materials.silver} />
      </group>

      <group ref={refs.torso} position={[0, 1.12, 0]}>
        <FighterPart geometry={resources.hips} outlineMaterial={outline} position={[0, -0.31, 0]} scale={[0.9, 0.82, 0.86]} toonMaterial={materials.suit} />
        <FighterPart geometry={resources.waist} outlineMaterial={outline} position={[0, -0.04, 0]} scale={[0.88, 0.78, 0.86]} toonMaterial={materials.suit} />
        <FighterPart geometry={resources.chest} outlineMaterial={outline} position={[0, 0.28, 0]} scale={[0.84, 0.78, 0.82]} toonMaterial={materials.coat} />
        <FighterPart geometry={resources.collar} outlineMaterial={outline} position={[0, 0.58, 0]} scale={[1.02, 0.86, 0.96]} toonMaterial={materials.silver} />
        <mesh material={materials.energy} position={[0, 0.3, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.018, 6, 24]} />
        </mesh>
      </group>

      <ChronoArm side="left" materials={materials} outline={outline} refGroup={refs.leftArm} resources={resources} />
      <ChronoArm side="right" materials={materials} outline={outline} refGroup={refs.rightArm} resources={resources} />

      <group ref={refs.head} position={[0, 1.86, 0]}>
        <FighterPart geometry={resources.neck} outlineMaterial={outline} position={[0, -0.2, 0]} scale={[0.82, 0.72, 0.82]} toonMaterial={materials.skin} />
        <FighterPart geometry={resources.head} outlineMaterial={outline} scale={[0.9, 1.02, 0.9]} toonMaterial={materials.skin} />
        <FighterPart geometry={resources.hairBack} outlineMaterial={outline} position={[0, 0.08, -0.045]} scale={[0.96, 0.9, 0.96]} toonMaterial={materials.hair} />
        <mesh material={materials.energy} position={[0.045, 0.02, 0.122]} scale={[0.3, 0.08, 0.03]}>
          <boxGeometry args={[0.32, 0.08, 0.05]} />
        </mesh>
      </group>

      <ClockFragments material={materials.energy} refGroup={refs.fragments} />
      <ClockStrike material={materials.energy} refGroup={refs.effect} />
    </group>
  );
}

function ChronoArm({
  side,
  materials,
  outline,
  refGroup,
  resources,
}: {
  readonly side: 'left' | 'right';
  readonly materials: ChronoMaterials;
  readonly outline: Material;
  readonly refGroup: ChronoRigRefs['leftArm'];
  readonly resources: FighterResources;
}) {
  const direction = side === 'left' ? -1 : 1;
  return (
    <group ref={refGroup} position={[direction * 0.37, 1.48, 0]}>
      <FighterPart geometry={resources.shoulder} outlineMaterial={outline} scale={[0.8, 0.72, 0.78]} toonMaterial={materials.silver} />
      <FighterPart geometry={resources.upperArm} outlineMaterial={outline} position={[direction * 0.03, -0.2, 0]} scale={[0.75, 0.76, 0.75]} toonMaterial={materials.coat} />
      <FighterPart geometry={resources.forearm} outlineMaterial={outline} position={[direction * 0.05, -0.45, 0.02]} scale={[0.8, 0.78, 0.8]} toonMaterial={materials.silver} />
      <FighterPart geometry={resources.hand} outlineMaterial={outline} position={[direction * 0.06, -0.61, 0.03]} scale={[0.72, 0.72, 0.72]} toonMaterial={materials.suit} />
    </group>
  );
}

function ChronoLeg({
  side,
  materials,
  outline,
  refGroup,
  resources,
}: {
  readonly side: 'left' | 'right';
  readonly materials: ChronoMaterials;
  readonly outline: Material;
  readonly refGroup: ChronoRigRefs['leftLeg'];
  readonly resources: FighterResources;
}) {
  const direction = side === 'left' ? -1 : 1;
  return (
    <group ref={refGroup} position={[direction * 0.17, 0.68, 0]}>
      <FighterPart geometry={resources.thigh} outlineMaterial={outline} position={[0, -0.06, 0]} scale={[0.78, 0.76, 0.76]} toonMaterial={materials.suit} />
      <FighterPart geometry={resources.shin} outlineMaterial={outline} position={[0, -0.4, 0]} scale={[0.76, 0.74, 0.76]} toonMaterial={materials.coat} />
      <FighterPart geometry={resources.foot} outlineMaterial={outline} position={[0, -0.64, 0.07]} scale={[0.94, 0.84, 0.96]} toonMaterial={materials.silver} />
    </group>
  );
}

function ClockFragments({
  material,
  refGroup,
}: {
  readonly material: Material;
  readonly refGroup: ChronoRigRefs['fragments'];
}) {
  return (
    <group ref={refGroup}>
      {[
        [-0.58, 0.32, -0.1, -0.4],
        [0.62, 0.18, 0.04, 1.8],
        [-0.48, -0.55, 0.08, 3.5],
      ].map(([x, y, z, rotation], index) => (
        <mesh key={index} material={material} position={[x, y, z]} rotation-z={rotation}>
          <torusGeometry args={[0.13, 0.018, 5, 18, Math.PI * 0.72]} />
        </mesh>
      ))}
    </group>
  );
}

function ClockStrike({
  material,
  refGroup,
}: {
  readonly material: Material;
  readonly refGroup: ChronoRigRefs['effect'];
}) {
  return (
    <group ref={refGroup} visible={false}>
      <mesh material={material}><torusGeometry args={[0.42, 0.035, 8, 40]} /></mesh>
      <mesh material={material} rotation-z={0.45} scale={[1, 0.08, 1]}>
        <boxGeometry args={[0.72, 0.12, 0.04]} />
      </mesh>
      <mesh material={material} rotation-z={-0.82} scale={[1, 0.08, 1]}>
        <boxGeometry args={[0.56, 0.1, 0.04]} />
      </mesh>
    </group>
  );
}
