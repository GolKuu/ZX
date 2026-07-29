/* eslint-disable react-hooks/refs -- R3F refs are attached here, never read during render. */
import { FighterPart } from '../FighterPart';
import type { ZoroBodyProps } from './ZoroBody';
import { ZoroSword } from './ZoroSword';
import { HEAD_UNIT as H } from './zoroResources';

const hairSpikes = [
  [-H * 1.05, H * 1.2, -H * 0.2, -0.46],
  [0, H * 1.55, -H * 0.3, 0],
  [H * 1.05, H * 1.2, -H * 0.2, 0.46],
  [-H * 0.75, H * 1.1, H * 0.72, -0.22],
  [H * 0.75, H * 1.1, H * 0.72, 0.22],
  [-H * 1.2, H * 0.62, H * 0.25, -0.7],
  [H * 1.2, H * 0.62, H * 0.25, 0.7],
] as const;

const EYE_X = H * 0.42;
const EYE_Y = H * 0.02;
const EYE_Z = H * 0.9;

export function ZoroHead({
  materials,
  outline,
  refs,
  resources,
}: ZoroBodyProps) {
  return (
    <group ref={refs.head} position={[0, 2.08, 0]}>
      <FighterPart
        geometry={resources.neck}
        outlineMaterial={outline}
        position={[0, -H * 1.15, 0]}
        scale={[1.05, 0.92, 1.05]}
        toonMaterial={materials.skin}
      />
      <FighterPart
        geometry={resources.head}
        outlineMaterial={outline}
        scale={[0.94, 1.04, 0.94]}
        toonMaterial={materials.skin}
      />
      <FighterPart
        geometry={resources.jaw}
        outlineMaterial={outline}
        position={[0, -H * 0.34, H * 0.1]}
        scale={[0.9, 0.74, 0.94]}
        toonMaterial={materials.skin}
      />

      <OpenEye materials={materials} resources={resources} />
      <ClosedScarredEye materials={materials} resources={resources} />
      <mesh
        geometry={resources.lidLine}
        material={materials.lineArt}
        position={[0, -H * 0.58, H * 0.91]}
        scale={[0.54, 0.6, 0.8]}
      />

      <FighterPart
        geometry={resources.hairMass}
        outlineMaterial={outline}
        position={[0, H * 0.22, -H * 0.2]}
        scale={[1, 0.76, 0.96]}
        toonMaterial={materials.hair}
      />
      {hairSpikes.map(([x, y, z, rotation]) => (
        <FighterPart
          key={`${x}-${y}-${z}`}
          geometry={resources.hair}
          outlineMaterial={outline}
          position={[x, y, z]}
          rotation={[0, 0, rotation]}
          scale={[0.84, 0.84, 0.84]}
          toonMaterial={materials.hair}
        />
      ))}
      {[-H * 0.52, -H * 0.15, H * 0.22].map((offset) => (
        <mesh
          key={offset}
          geometry={resources.earring}
          material={materials.gold}
          position={[H * 1.02, -H * 0.55 + offset, 0]}
          scale={0.86}
        />
      ))}
    </group>
  );
}

function OpenEye({
  materials,
  resources,
}: Pick<ZoroBodyProps, 'materials' | 'resources'>) {
  return (
    <group position={[EYE_X, EYE_Y, EYE_Z]}>
      <mesh geometry={resources.eyeWhite} material={materials.eyeWhite} scale={[1.05, 0.62, 0.28]} />
      <mesh geometry={resources.iris} material={materials.iris} position={[H * 0.02, -H * 0.015, H * 0.12]} scale={0.78} />
      <mesh geometry={resources.pupil} material={materials.pupil} position={[H * 0.02, -H * 0.015, H * 0.13]} scale={0.82} />
      <mesh geometry={resources.catchlight} material={materials.catchlight} position={[H * 0.1, H * 0.06, H * 0.14]} />
      <mesh geometry={resources.lidLine} material={materials.lineArt} position={[0, H * 0.2, H * 0.12]} rotation-z={-0.12} scale={[1.05, 0.8, 1]} />
      <mesh geometry={resources.brow} material={materials.lineArt} position={[0, H * 0.42, H * 0.08]} rotation-z={-0.22} />
    </group>
  );
}

function ClosedScarredEye({
  materials,
  resources,
}: Pick<ZoroBodyProps, 'materials' | 'resources'>) {
  return (
    <group position={[-EYE_X, EYE_Y, EYE_Z]}>
      <mesh geometry={resources.lidLine} material={materials.lineArt} rotation-z={0.08} scale={[0.94, 0.72, 1]} />
      <mesh geometry={resources.brow} material={materials.lineArt} position={[0, H * 0.42, H * 0.08]} rotation-z={0.24} />
      <mesh geometry={resources.lidLine} material={materials.lineArt} position={[-H * 0.01, -H * 0.02, H * 0.015]} rotation-z={1.12} scale={[1.18, 0.72, 1]} />
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
    <group ref={left ? refs.leftArm : refs.rightArm} position={[left ? -0.43 : 0.43, 1.64, 0]}>
      <FighterPart geometry={resources.shoulder} outlineMaterial={outline} scale={[0.72, 0.72, 0.72]} toonMaterial={materials.skin} />
      <FighterPart geometry={resources.arm} outlineMaterial={outline} position={[0, -0.2, 0]} scale={[0.9, 0.88, 0.9]} toonMaterial={materials.skin} />
      <FighterPart geometry={resources.forearm} outlineMaterial={outline} position={[0, -0.48, 0]} scale={[0.9, 0.86, 0.9]} toonMaterial={materials.skin} />
      <mesh geometry={resources.hand} material={materials.skin} position={[0, -0.66, 0]} scale={0.88} />
      {left && <Bandana materials={materials} resources={resources} />}
      <ZoroSword
        ref={left ? refs.leftSword : refs.rightSword}
        materials={materials}
        resources={resources}
        position={[0, -0.66, 0.02]}
        scale={0.9}
      />
    </group>
  );
}

function Bandana({
  materials,
  resources,
}: Pick<ZoroBodyProps, 'materials' | 'resources'>) {
  return (
    <group position={[0, -0.08, 0]}>
      <mesh geometry={resources.sash} material={materials.handle} rotation-x={Math.PI / 2} scale={0.38} />
      <mesh geometry={resources.blade} material={materials.handle} position={[-0.08, -0.08, -0.04]} rotation-z={0.48} scale={[0.06, 0.1, 0.12]} />
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
    <group ref={left ? refs.leftLeg : refs.rightLeg} position={[left ? -0.2 : 0.2, 0.72, 0]}>
      <FighterPart geometry={resources.leg} outlineMaterial={outline} position={[0, -0.04, 0]} scale={[0.88, 0.8, 0.88]} toonMaterial={materials.trousers} />
      <FighterPart geometry={resources.shin} outlineMaterial={outline} position={[0, -0.42, 0]} scale={[0.9, 0.86, 0.9]} toonMaterial={materials.trousers} />
      <FighterPart geometry={resources.foot} outlineMaterial={outline} position={[0, -0.69, 0.06]} scale={[1.05, 0.92, 1.05]} toonMaterial={materials.handle} />
    </group>
  );
}
