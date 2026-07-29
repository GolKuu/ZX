/* eslint-disable react-hooks/refs -- R3F refs are attached here, never read during render. */
import type { RefObject } from 'react';
import type { Group, Material } from 'three';
import { FighterPart } from '../FighterPart';
import type { ZoroRigRefs } from '../zoro/zoroRigRefs';
import { VoidWalkerEffects } from './VoidWalkerEffects';
import type { VoidWalkerMaterials } from './voidWalkerMaterials';
import { VoidWalkerArm, VoidWalkerHead, VoidWalkerLeg } from './VoidWalkerParts';
import { HEAD_UNIT as H, type VoidWalkerResources } from './voidWalkerResources';

export interface VoidWalkerBodyProps {
  readonly materials: VoidWalkerMaterials;
  readonly outline: Material;
  readonly refs: ZoroRigRefs;
  readonly resources: VoidWalkerResources;
}

/** Violet inlays on the coat. Angled, never parallel to the body axis. */
const COAT_PANELS = [
  { id: 'p-0', x: -H * 1.15, y: 0.1, roll: 0.34 },
  { id: 'p-1', x: -H * 0.62, y: -0.06, roll: 0.2 },
  { id: 'p-2', x: H * 0.62, y: -0.06, roll: -0.2 },
  { id: 'p-3', x: H * 1.15, y: 0.1, roll: -0.34 },
] as const;

export function VoidWalkerBody({
  materials,
  outline,
  refs,
  resources,
}: VoidWalkerBodyProps) {
  return (
    <group ref={refs.root}>
      <group ref={refs.torso} position={[0, 1.45, 0]}>
        <FighterPart
          geometry={resources.chest}
          outlineMaterial={outline}
          position={[0, 0.06, 0]}
          scale={[1.3, 1, 0.72]}
          toonMaterial={materials.coat}
        />
        <FighterPart
          geometry={resources.waist}
          outlineMaterial={outline}
          position={[0, -0.3, 0]}
          scale={[1.2, 1, 0.7]}
          toonMaterial={materials.coat}
        />

        {/* Front closure, offset off-centre — a symmetrical placket reads as
            a mannequin seam, an asymmetric one reads as a garment. */}
        <mesh
          geometry={resources.coatSeam}
          material={materials.panel}
          position={[H * 0.34, -0.02, H * 1.42]}
          rotation={[0, 0, -0.09]}
        />
        {[0.16, 0.02, -0.12].map((y) => (
          <mesh
            key={y}
            geometry={resources.clasp}
            material={materials.clasp}
            position={[H * 0.34, y, H * 1.5]}
          />
        ))}
        {COAT_PANELS.map(({ id, x, y, roll }) => (
          <mesh
            key={id}
            geometry={resources.coatPanel}
            material={materials.panel}
            position={[x, y, H * 1.36]}
            rotation={[0, 0, roll]}
          />
        ))}

        {/* Standing collar: the second strongest silhouette element after the
            crown, and the one that gives the head somewhere to sit. */}
        <mesh
          geometry={resources.collar}
          material={materials.collar}
          position={[0, 0.55, -H * 0.06]}
          scale={[1.15, 1, 0.95]}
        />
      </group>

      <VoidWalkerHead
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />
      {(['left', 'right'] as const).map((side) => (
        <VoidWalkerArm
          key={side}
          side={side}
          materials={materials}
          outline={outline}
          refs={refs}
          resources={resources}
        />
      ))}
      {(['left', 'right'] as const).map((side) => (
        <VoidWalkerLeg
          key={side}
          side={side}
          materials={materials}
          outline={outline}
          refs={refs}
          resources={resources}
        />
      ))}

      <FighterPart
        geometry={resources.hips}
        outlineMaterial={outline}
        position={[0, 1.05, 0]}
        scale={[1.25, 1, 0.75]}
        toonMaterial={materials.trousers}
      />

      {/* Coat skirt hangs from the root, not the torso: it should lag the
          upper body rather than rotate rigidly with it. */}
      <mesh
        geometry={resources.coat}
        material={materials.coat}
        position={[0, 1.12, 0]}
        scale={[1.08, 1, 0.82]}
      />

      <HandCharge
        ref={refs.rightSword}
        materials={materials}
        resources={resources}
      />
      <HandCharge
        ref={refs.leftSword}
        materials={materials}
        resources={resources}
      />

      {/* Sits where the rig puts the off-hand prop — here, a rune that spins
          up in front of the face while a super is charging. */}
      <group ref={refs.mouthSword}>
        <mesh
          geometry={resources.ring}
          material={materials.aura}
          scale={0.55}
        />
        <mesh
          geometry={resources.ring}
          material={materials.phantom}
          rotation={[0.9, 0, 0]}
          scale={0.42}
        />
      </group>

      <VoidWalkerEffects
        materials={materials}
        refs={refs}
        resources={resources}
      />
    </group>
  );
}

/**
 * Void charge around a hand. Parented to the rig's prop socket and pushed down
 * to the palm, so every swing carries it without extra animation code.
 */
function HandCharge({
  materials,
  ref,
  resources,
}: Pick<VoidWalkerBodyProps, 'materials' | 'resources'> & {
  readonly ref: RefObject<Group | null>;
}) {
  return (
    <group ref={ref}>
      <group position={[0, -0.18, 0]}>
        <mesh
          geometry={resources.orb}
          material={materials.voidCore}
          scale={0.62}
        />
        <mesh
          geometry={resources.orb}
          material={materials.aura}
          scale={0.86}
        />
        <mesh
          geometry={resources.ring}
          material={materials.aura}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.34}
        />
      </group>
    </group>
  );
}
