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
      <group ref={refs.torso} position={[0, 1.45, 0]}>
        <FighterPart
          geometry={resources.body}
          outlineMaterial={outline}
          toonMaterial={materials.robe}
        />
        <FighterPart
          geometry={resources.chest}
          outlineMaterial={outline}
          position={[0, 0.18, 0.28]}
          scale={[0.92, 0.82, 0.28]}
          toonMaterial={materials.skin}
        />
        <mesh
          geometry={resources.blade}
          material={materials.trousers}
          position={[0.03, 0.2, 0.39]}
          rotation-z={-0.72}
          scale={[0.07, 0.5, 0.18]}
        />
      </group>

      <ZoroHead materials={materials} outline={outline} refs={refs} resources={resources} />
      <ZoroArm side="left" materials={materials} outline={outline} refs={refs} resources={resources} />
      <ZoroArm side="right" materials={materials} outline={outline} refs={refs} resources={resources} />
      <ZoroLeg side="left" materials={materials} outline={outline} refs={refs} resources={resources} />
      <ZoroLeg side="right" materials={materials} outline={outline} refs={refs} resources={resources} />

      <FighterPart
        geometry={resources.robe}
        outlineMaterial={outline}
        position={[0, 0.8, -0.02]}
        rotation={[0, 0, Math.PI]}
        toonMaterial={materials.robe}
      />
      <mesh
        geometry={resources.sash}
        material={materials.sash}
        position={[0, 1.08, 0]}
        rotation-x={Math.PI / 2}
      />
      <HipSwords materials={materials} resources={resources} />
      <ZoroSword
        ref={refs.mouthSword}
        materials={materials}
        resources={resources}
        position={[0, 2.4, 0.22]}
        scale={0.72}
      />
      <ZoroEffects materials={materials} refs={refs} resources={resources} />
    </group>
  );
}

function HipSwords({
  materials,
  resources,
}: Pick<ZoroBodyProps, 'materials' | 'resources'>) {
  return (
    <group position={[-0.46, 1.05, -0.08]} rotation-z={-0.22}>
      {[-0.12, 0, 0.12].map((z, index) => (
        <group key={z} position={[index * -0.05, 0, z]} rotation-z={0.08 * index}>
          <mesh geometry={resources.scabbard} material={materials.handle} position={[0, -0.62, 0]} />
          <mesh geometry={resources.guard} material={materials.gold} rotation-x={Math.PI / 2} />
        </group>
      ))}
    </group>
  );
}
