/* eslint-disable react-hooks/refs -- R3F refs are attached here, never read during render. */
import { FighterPart } from '../FighterPart';
import type { ZoroBodyProps } from './ZoroBody';
import { ZoroSword } from './ZoroSword';

const hairSpikes = [
  [-0.22, 0.25, -0.02, -0.4],
  [0, 0.32, -0.04, 0],
  [0.22, 0.25, -0.02, 0.4],
  [-0.12, 0.26, 0.18, -0.2],
  [0.12, 0.26, 0.18, 0.2],
] as const;

export function ZoroHead({
  materials,
  outline,
  refs,
  resources,
}: ZoroBodyProps) {
  return (
    <group ref={refs.head} position={[0, 2.45, 0]}>
      <FighterPart
        geometry={resources.head}
        outlineMaterial={outline}
        toonMaterial={materials.skin}
      />
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
      {[-0.09, 0, 0.09].map((offset) => (
        <mesh
          key={offset}
          geometry={resources.earring}
          material={materials.gold}
          position={[0.31, -0.16 + offset, 0]}
        />
      ))}
    </group>
  );
}

export function ZoroArm({
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
      <mesh
        geometry={resources.hand}
        material={materials.skin}
        position={[0, -0.72, 0]}
      />
      <ZoroSword
        ref={left ? refs.leftSword : refs.rightSword}
        materials={materials}
        resources={resources}
        position={[0, -0.72, 0.02]}
      />
    </group>
  );
}

export function ZoroLeg({
  side,
  materials,
  outline,
  refs,
  resources,
}: ZoroBodyProps & { readonly side: 'left' | 'right' }) {
  const left = side === 'left';
  return (
    <group
      ref={left ? refs.leftLeg : refs.rightLeg}
      position={[left ? -0.2 : 0.2, 0.92, 0]}
    >
      <FighterPart
        geometry={resources.leg}
        outlineMaterial={outline}
        position={[0, -0.38, 0]}
        toonMaterial={materials.trousers}
      />
    </group>
  );
}
