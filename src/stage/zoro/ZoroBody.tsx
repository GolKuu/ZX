import type { Material } from 'three';
import { FighterPart } from '../FighterPart';
import { ZoroEffects } from './ZoroEffects';
import type { ZoroMaterials } from './zoroMaterials';
import type { ZoroResources } from './zoroResources';
import type { ZoroRigRefs } from './zoroRigRefs';
import { ZoroSword } from './ZoroSword';

interface ZoroBodyProps {
  readonly materials: ZoroMaterials;
  readonly outline: Material;
  readonly refs: ZoroRigRefs;
  readonly resources: ZoroResources;
}

const hairSpikes = [
  [-0.22, 0.25, -0.02, -0.4],
  [0, 0.32, -0.04, 0],
  [0.22, 0.25, -0.02, 0.4],
  [-0.12, 0.26, 0.18, -0.2],
  [0.12, 0.26, 0.18, 0.2],
] as const;

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

      <Head materials={materials} outline={outline} refs={refs} resources={resources} />
      <Arm side="left" materials={materials} outline={outline} refs={refs} resources={resources} />
      <Arm side="right" materials={materials} outline={outline} refs={refs} resources={resources} />
      <Leg side="left" materials={materials} outline={outline} refs={refs} resources={resources} />
      <Leg side="right" materials={materials} outline={outline} refs={refs} resources={resources} />

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

function Head({ materials, outline, refs, resources }: ZoroBodyProps) {
  return (
    <group ref={refs.head} position={[0, 2.45, 0]}>
      <FighterPart geometry={resources.head} outlineMaterial={outline} toonMaterial={materials.skin} />
      {hairSpikes.map(([x, y, z, rotation]) => (
        <FighterPart
          key={`${x}-${z}`}
          geometry={resources.hair}
          outlineMaterial={outline}
          position={[x, y, z]}
          rotation={[0, 0, rotation]}
          toonMaterial={materials.hair}
        />
      ))}
      {[-0.09, 0, 0.09].map((x) => (
        <mesh
          key={x}
          geometry={resources.earring}
          material={materials.gold}
          position={[0.31, -0.16 + x, 0]}
        />
      ))}
    </group>
  );
}

function Arm({
  side,
  materials,
  outline,
  refs,
  resources,
}: ZoroBodyProps & { readonly side: 'left' | 'right' }) {
  const left = side === 'left';
  return (
    <group
      ref={left ? refs.leftArm : refs.rightArm}
      position={[left ? -0.46 : 0.46, 1.82, 0]}
    >
      <FighterPart
        geometry={resources.arm}
        outlineMaterial={outline}
        position={[0, -0.34, 0]}
        toonMaterial={materials.skin}
      />
      <mesh geometry={resources.hand} material={materials.skin} position={[0, -0.72, 0]} />
      <ZoroSword
        ref={left ? refs.leftSword : refs.rightSword}
        materials={materials}
        resources={resources}
        position={[0, -0.72, 0.02]}
      />
    </group>
  );
}

function Leg({
  side,
  materials,
  outline,
  refs,
  resources,
}: ZoroBodyProps & { readonly side: 'left' | 'right' }) {
  const left = side === 'left';
  return (
    <group ref={left ? refs.leftLeg : refs.rightLeg} position={[left ? -0.2 : 0.2, 0.92, 0]}>
      <FighterPart
        geometry={resources.leg}
        outlineMaterial={outline}
        position={[0, -0.38, 0]}
        toonMaterial={materials.trousers}
      />
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
