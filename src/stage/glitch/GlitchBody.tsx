/* eslint-disable react-hooks/refs -- R3F attaches these refs during render. */
import type { RefObject } from 'react';
import type { Group, Material } from 'three';
import { FighterPart } from '../FighterPart';
import type { FighterRigRefs } from '../fighterRigRefs';
import { GlitchEffects } from './GlitchEffects';
import { GlitchArmorDetails } from './GlitchArmorDetails';
import { GlitchEnergyScarf } from './GlitchEnergyScarf';
import type { GlitchMaterials } from './glitchMaterials';
import type { GlitchResources } from './glitchResources';

interface GlitchBodyProps {
  readonly fragments: RefObject<Group | null>;
  readonly materials: GlitchMaterials;
  readonly outline: Material;
  readonly refs: FighterRigRefs;
  readonly resources: GlitchResources;
  readonly scarf: RefObject<Group | null>;
}

export function GlitchBody(props: GlitchBodyProps) {
  const { fragments, materials, outline, refs, resources, scarf } = props;
  return (
    <group ref={refs.root}>
      <GlitchEnergyScarf root={scarf} />
      <group ref={refs.torso} position={[0, 1.3, 0]}>
        <HalfPart x={-0.145} geometry={resources.torsoHalf} material={materials.stable} outline={outline} />
        <HalfPart x={0.145} geometry={resources.torsoHalf} material={materials.corrupt} outline={outline} />
        <mesh geometry={resources.pixel} material={materials.ice} position={[-0.1, 0.12, 0.2]} scale={[1.3, 0.18, 0.35]} />
        <mesh geometry={resources.pixel} material={materials.amber} position={[0.14, -0.05, 0.2]} scale={[1.2, 0.2, 0.35]} />
      </group>

      <group ref={refs.head} position={[0, 2.08, 0]}>
        <HalfPart x={-0.08} geometry={resources.headHalf} material={materials.stable} outline={outline} />
        <HalfPart x={0.08} geometry={resources.headHalf} material={materials.corrupt} outline={outline} />
        <mesh geometry={resources.visor} material={materials.ice} position={[-0.08, 0.015, 0.155]} />
        <mesh geometry={resources.visor} material={materials.amber} position={[0.08, 0.015, 0.155]} />
      </group>

      <GlitchArm side="left" {...props} />
      <GlitchArm side="right" {...props} />
      <GlitchLeg side="left" {...props} />
      <GlitchLeg side="right" {...props} />

      <HalfPart x={-0.115} y={0.96} geometry={resources.hipHalf} material={materials.stable} outline={outline} />
      <HalfPart x={0.115} y={0.96} geometry={resources.hipHalf} material={materials.corrupt} outline={outline} />
      <GlitchArmorDetails materials={materials} resources={resources} />

      <group ref={fragments}>
        {([
          [0.5, 2.22, 0, 0.75],
          [0.62, 1.76, -0.08, 0.52],
          [0.47, 1.26, 0.12, 0.42],
          [0.35, 0.67, -0.08, 0.34],
          [0.72, 1.48, 0.08, 0.28],
        ] as const).map(([x, y, z, scale], index) => (
          <mesh
            key={`${x}-${y}`}
            geometry={resources.pixel}
            material={index % 2 === 0 ? materials.amber : materials.ice}
            position={[x, y, z]}
            rotation={[index * 0.4, index * 0.7, index * 0.2]}
            scale={scale}
          />
        ))}
      </group>

      <group ref={refs.leftSword} />
      <group ref={refs.rightSword} />
      <group ref={refs.mouthSword} />
      <GlitchEffects materials={materials} refs={refs} resources={resources} />
    </group>
  );
}

function GlitchArm({
  materials,
  outline,
  refs,
  resources,
  side,
}: GlitchBodyProps & { readonly side: 'left' | 'right' }) {
  const left = side === 'left';
  const material = left ? materials.stable : materials.corrupt;
  return (
    <group ref={left ? refs.leftArm : refs.rightArm} position={[left ? -0.43 : 0.43, 1.64, 0]}>
      <mesh
        castShadow
        geometry={resources.shoulderShell}
        material={left ? materials.ceramic : materials.rustMetal}
        rotation={[0, left ? -0.35 : 0.35, Math.PI / 2]}
        scale={[1, 0.72, 0.82]}
      />
      <FighterPart geometry={resources.upperArm} outlineMaterial={outline} position={[0, -0.17, 0]} toonMaterial={material} />
      <FighterPart geometry={resources.forearm} outlineMaterial={outline} position={[0, -0.48, 0]} toonMaterial={material} />
      <mesh
        castShadow
        geometry={resources.armourPlate}
        material={left ? materials.darkMetal : materials.rustMetal}
        position={[0, -0.47, 0.08]}
        scale={[0.72, 0.58, 0.9]}
      />
      <mesh geometry={resources.hand} material={left ? materials.ice : materials.amber} position={[0, -0.7, 0]} />
    </group>
  );
}

function GlitchLeg({
  materials,
  outline,
  refs,
  resources,
  side,
}: GlitchBodyProps & { readonly side: 'left' | 'right' }) {
  const left = side === 'left';
  const material = left ? materials.stable : materials.corrupt;
  return (
    <group ref={left ? refs.leftLeg : refs.rightLeg} position={[left ? -0.2 : 0.2, 0.72, 0]}>
      <FighterPart geometry={resources.thigh} outlineMaterial={outline} position={[0, -0.06, 0]} toonMaterial={material} />
      <FighterPart geometry={resources.shin} outlineMaterial={outline} position={[0, -0.48, 0]} toonMaterial={material} />
      <mesh
        castShadow
        geometry={resources.armourPlate}
        material={left ? materials.darkMetal : materials.rustMetal}
        position={[0, -0.48, 0.09]}
        scale={[0.86, 0.7, 0.9]}
      />
      <FighterPart geometry={resources.foot} outlineMaterial={outline} position={[0, -0.75, 0.1]} toonMaterial={material} />
    </group>
  );
}

function HalfPart({
  geometry,
  material,
  outline,
  x,
  y,
}: {
  readonly geometry: GlitchResources['headHalf'];
  readonly material: Material;
  readonly outline: Material;
  readonly x: number;
  readonly y?: number;
}) {
  return (
    <FighterPart
      geometry={geometry}
      outlineMaterial={outline}
      position={[x, y ?? 0, 0]}
      toonMaterial={material}
    />
  );
}
