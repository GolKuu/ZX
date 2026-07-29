/* eslint-disable react-hooks/refs -- R3F attaches these refs during render. */
import type { RefObject } from 'react';
import type { Group, Material } from 'three';
import { FighterPart } from '../FighterPart';
import type { ZoroRigRefs } from '../zoro/zoroRigRefs';
import { GlitchEffects } from './GlitchEffects';
import type { GlitchMaterials } from './glitchMaterials';
import type { GlitchResources } from './glitchResources';

interface GlitchBodyProps {
  readonly fragments: RefObject<Group | null>;
  readonly materials: GlitchMaterials;
  readonly outline: Material;
  readonly refs: ZoroRigRefs;
  readonly resources: GlitchResources;
}

export function GlitchBody(props: GlitchBodyProps) {
  const { fragments, materials, outline, refs, resources } = props;
  return (
    <group ref={refs.root}>
      <group ref={refs.torso} position={[0, 1.3, 0]}>
        <HalfPart x={-0.145} geometry={resources.torsoHalf} material={materials.stable} outline={outline} />
        <HalfPart x={0.145} geometry={resources.torsoHalf} material={materials.corrupt} outline={outline} />
        <mesh geometry={resources.pixel} material={materials.cyan} position={[-0.1, 0.12, 0.2]} scale={[1.3, 0.18, 0.35]} />
        <mesh geometry={resources.pixel} material={materials.magenta} position={[0.14, -0.05, 0.2]} scale={[1.2, 0.2, 0.35]} />
      </group>

      <group ref={refs.head} position={[0, 2.08, 0]}>
        <HalfPart x={-0.08} geometry={resources.headHalf} material={materials.stable} outline={outline} />
        <HalfPart x={0.08} geometry={resources.headHalf} material={materials.corrupt} outline={outline} />
        <mesh geometry={resources.visor} material={materials.cyan} position={[-0.08, 0.015, 0.155]} />
        <mesh geometry={resources.visor} material={materials.magenta} position={[0.08, 0.015, 0.155]} />
      </group>

      <GlitchArm side="left" {...props} />
      <GlitchArm side="right" {...props} />
      <GlitchLeg side="left" {...props} />
      <GlitchLeg side="right" {...props} />

      <HalfPart x={-0.115} y={0.96} geometry={resources.hipHalf} material={materials.stable} outline={outline} />
      <HalfPart x={0.115} y={0.96} geometry={resources.hipHalf} material={materials.corrupt} outline={outline} />

      <group ref={fragments}>
        {[
          [0.5, 2.22, 0, 0.75],
          [0.62, 1.76, -0.08, 0.52],
          [0.47, 1.26, 0.12, 0.42],
          [0.35, 0.67, -0.08, 0.34],
          [0.72, 1.48, 0.08, 0.28],
        ].map(([x, y, z, scale], index) => (
          <mesh
            key={`${x}-${y}`}
            geometry={resources.pixel}
            material={index % 2 === 0 ? materials.magenta : materials.cyan}
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
      <FighterPart geometry={resources.upperArm} outlineMaterial={outline} position={[0, -0.17, 0]} toonMaterial={material} />
      <FighterPart geometry={resources.forearm} outlineMaterial={outline} position={[0, -0.48, 0]} toonMaterial={material} />
      <mesh geometry={resources.hand} material={left ? materials.cyan : materials.magenta} position={[0, -0.7, 0]} />
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
