/* eslint-disable react-hooks/refs -- R3F refs are attached here, never read during render. */
import type { Material } from 'three';
import { FighterPart } from '../FighterPart';
import { ZoroEffects } from './ZoroEffects';
import type { ZoroMaterials } from './zoroMaterials';
import { ZoroArm, ZoroHead, ZoroLeg } from './ZoroParts';
import type { ZoroResources } from './zoroResources';
import type { ZoroRigRefs } from './zoroRigRefs';
import { ZoroSword } from './ZoroSword';

export interface ZoroBodyProps {
  readonly materials: ZoroMaterials;
  readonly outline: Material;
  readonly refs: ZoroRigRefs;
  readonly resources: ZoroResources;
}

export function ZoroBody({
  materials,
  outline,
  refs,
  resources,
}: ZoroBodyProps) {
  return (
    <group ref={refs.root}>
      <group ref={refs.torso} position={[0, 1.3, 0]}>
        <FighterPart
          geometry={resources.body}
          outlineMaterial={outline}
          position={[0, 0.08, 0]}
          scale={[1.22, 1.08, 0.9]}
          toonMaterial={materials.robe}
        />
        <FighterPart
          geometry={resources.chest}
          outlineMaterial={outline}
          position={[0, 0.2, 0.14]}
          scale={[1.12, 0.92, 0.68]}
          toonMaterial={materials.skin}
        />
        <FighterPart
          geometry={resources.hips}
          outlineMaterial={outline}
          position={[0, -0.34, 0]}
          scale={[1.05, 0.82, 0.9]}
          toonMaterial={materials.trousers}
        />
        <FighterPart
          geometry={resources.collar}
          outlineMaterial={outline}
          position={[0, 0.5, 0]}
          scale={[1.02, 0.74, 0.9]}
          toonMaterial={materials.robe}
        />
        <ChestScar materials={materials} resources={resources} />
      </group>

      <ZoroHead
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />
      <ZoroArm
        side="left"
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />
      <ZoroArm
        side="right"
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />
      <ZoroLeg
        side="left"
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />
      <ZoroLeg
        side="right"
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />

      <FighterPart
        geometry={resources.robe}
        outlineMaterial={outline}
        position={[0, 0.7, -0.02]}
        rotation={[0, 0, Math.PI]}
        scale={[1.08, 1, 0.82]}
        toonMaterial={materials.robe}
      />
      <mesh
        geometry={resources.sash}
        material={materials.sash}
        position={[0, 0.94, 0]}
        rotation-x={Math.PI / 2}
        scale={[1.08, 1.08, 1.08]}
      />
      <HipSwords materials={materials} resources={resources} />
      <ZoroSword
        ref={refs.mouthSword}
        materials={materials}
        resources={resources}
        position={[0, 2.06, 0.18]}
        scale={0.66}
      />
      <ZoroEffects materials={materials} refs={refs} resources={resources} />
    </group>
  );
}

function ChestScar({
  materials,
  resources,
}: Pick<ZoroBodyProps, 'materials' | 'resources'>) {
  return (
    <group position={[0.05, 0.2, 0.405]}>
      <mesh
        geometry={resources.blade}
        material={materials.lineArt}
        rotation-z={-0.58}
        scale={[0.035, 0.34, 0.1]}
      />
      <mesh
        geometry={resources.blade}
        material={materials.lineArt}
        position={[-0.08, -0.02, 0.002]}
        rotation-z={-0.58}
        scale={[0.024, 0.18, 0.1]}
      />
    </group>
  );
}

function HipSwords({
  materials,
  resources,
}: Pick<ZoroBodyProps, 'materials' | 'resources'>) {
  return (
    <group position={[-0.4, 0.96, -0.08]} rotation-z={-0.38}>
      {[-0.12, 0, 0.12].map((z, index) => (
        <group
          key={z}
          position={[index * -0.045, 0, z]}
          rotation-z={0.12 * index}
        >
          <mesh
            geometry={resources.scabbard}
            material={index === 1 ? materials.robe : materials.handle}
            position={[0, -0.5, 0]}
            scale={[0.8, 0.86, 0.8]}
          />
          <mesh geometry={resources.guard} material={materials.gold} rotation-x={Math.PI / 2} />
        </group>
      ))}
    </group>
  );
}
