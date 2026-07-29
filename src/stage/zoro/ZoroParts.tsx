/* eslint-disable react-hooks/refs -- R3F refs are attached here, never read during render. */
import { FighterPart } from '../FighterPart';
import type { ZoroBodyProps } from './ZoroBody';
import { ZoroSword } from './ZoroSword';

import { HEAD_UNIT as H } from './zoroResources';

const hairSpikes = [
  [-H * 1.5, H * 1.7, -H * 0.15, -0.4],
  [0, H * 2.1, -H * 0.3, 0],
  [H * 1.5, H * 1.7, -H * 0.15, 0.4],
  [-H * 0.85, H * 1.8, H * 1.25, -0.2],
  [H * 0.85, H * 1.8, H * 1.25, 0.2],
] as const;

/** Eyes sit forward on the face and are wide — the primary style read. */
const EYE_X = H * 0.44;
const EYE_Y = H * 0.1;
const EYE_Z = H * 0.86;

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
      <FighterPart
        geometry={resources.jaw}
        outlineMaterial={outline}
        position={[0, -H * 0.34, H * 0.1]}
        scale={[0.92, 0.78, 0.96]}
        toonMaterial={materials.skin}
      />

      {/* Eyes. Drawn elements, not surfaces — no outline pass, no shading. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[EYE_X * side, EYE_Y, EYE_Z]}>
          <mesh
            geometry={resources.eyeWhite}
            material={materials.eyeWhite}
            scale={[1.32, 1.06, 0.42]}
          />
          <mesh
            geometry={resources.iris}
            material={materials.iris}
            position={[side * H * 0.03, -H * 0.02, H * 0.19]}
          />
          <mesh
            geometry={resources.pupil}
            material={materials.pupil}
            position={[side * H * 0.03, -H * 0.02, H * 0.2]}
          />
          <mesh
            geometry={resources.catchlight}
            material={materials.catchlight}
            position={[side * H * 0.13, H * 0.12, H * 0.21]}
          />
          {/* Upper lid line: the heaviest stroke on the face. */}
          <mesh
            geometry={resources.lidLine}
            material={materials.lineArt}
            position={[0, H * 0.24, H * 0.16]}
            rotation={[0, 0, side * -0.14]}
          />
          <mesh
            geometry={resources.brow}
            material={materials.lineArt}
            position={[0, H * 0.46, H * 0.1]}
            rotation={[0, 0, side * -0.26]}
          />
        </group>
      ))}

      {/* Hair mass first, spikes over it, so the silhouette reads as one shape. */}
      <FighterPart
        geometry={resources.hairMass}
        outlineMaterial={outline}
        position={[0, H * 0.24, -H * 0.16]}
        scale={[1, 0.9, 1]}
        toonMaterial={materials.hair}
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
      {[-H * 0.7, 0, H * 0.7].map((offset) => (
        <mesh
          key={offset}
          geometry={resources.earring}
          material={materials.gold}
          position={[H * 1.02, -H * 0.5 + offset, 0]}
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
