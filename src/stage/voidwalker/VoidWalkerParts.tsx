/* eslint-disable react-hooks/refs -- R3F refs are attached here, never read during render. */
import { FighterPart } from '../FighterPart';
import type { VoidWalkerBodyProps } from './VoidWalkerBody';
import { HEAD_UNIT as H } from './voidWalkerResources';

/**
 * The crown. Each entry is a direction, not a position: the spike is parented
 * to a yaw group and a pitch group, then pushed out along +Y, so it always
 * leaves the skull along its own normal. Placing spikes by hand-authored XYZ is
 * what produces the "cones stuck in a ball" read.
 *
 * `s` scales length only. Every blade is squashed to 0.5 in Z so it is a sheet
 * of hair rather than a cone — flat blades are what the reference silhouette is
 * actually made of.
 */
const HAIR_SPIKES = [
  { id: 'top-l', azimuth: 0.3, tilt: 0.1, scale: 0.86 },
  { id: 'top-r', azimuth: -0.3, tilt: 0.1, scale: 0.86 },
  { id: 'fwd-c', azimuth: 0, tilt: 0.42, scale: 1.0 },
  { id: 'fwd-l', azimuth: 0.6, tilt: 0.52, scale: 0.92 },
  { id: 'fwd-r', azimuth: -0.6, tilt: 0.52, scale: 0.92 },
  { id: 'mid-l', azimuth: 1.12, tilt: 0.78, scale: 1.16 },
  { id: 'mid-r', azimuth: -1.12, tilt: 0.78, scale: 1.16 },
  { id: 'side-l', azimuth: 1.62, tilt: 0.98, scale: 1.26 },
  { id: 'side-r', azimuth: -1.62, tilt: 0.98, scale: 1.26 },
  { id: 'rear-l', azimuth: 2.2, tilt: 0.82, scale: 1.1 },
  { id: 'rear-r', azimuth: -2.2, tilt: 0.82, scale: 1.1 },
  { id: 'back-l', azimuth: 2.74, tilt: 0.6, scale: 1.0 },
  { id: 'back-r', azimuth: -2.74, tilt: 0.6, scale: 1.0 },
  { id: 'back-c', azimuth: Math.PI, tilt: 0.44, scale: 0.94 },
] as const;

/** Fringe falls forward over the brow and breaks the visor line. */
const HAIR_FRINGE = [
  { id: 'fr-0', x: -H * 0.52, roll: 0.42 },
  { id: 'fr-1', x: -H * 0.18, roll: 0.16 },
  { id: 'fr-2', x: H * 0.18, roll: -0.16 },
  { id: 'fr-3', x: H * 0.52, roll: -0.42 },
] as const;

const EYE_X = H * 0.42;
const EYE_Y = -H * 0.02;
const EYE_Z = H * 0.83;

export function VoidWalkerHead({
  materials,
  outline,
  refs,
  resources,
}: VoidWalkerBodyProps) {
  return (
    <group ref={refs.head} position={[0, 2.45, 0]}>
      <FighterPart
        geometry={resources.head}
        outlineMaterial={outline}
        scale={[0.97, 1.06, 1]}
        toonMaterial={materials.skin}
      />
      <FighterPart
        geometry={resources.jaw}
        outlineMaterial={outline}
        position={[0, -H * 0.44, H * 0.14]}
        scale={[0.86, 0.72, 0.9]}
        toonMaterial={materials.skin}
      />
      <mesh
        geometry={resources.neck}
        material={materials.skin}
        position={[0, -H * 1.05, -H * 0.04]}
      />
      <mesh
        geometry={resources.nose}
        material={materials.skin}
        position={[0, -H * 0.14, H * 0.92]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {[-1, 1].map((side) => (
        <mesh
          key={`ear-${String(side)}`}
          geometry={resources.ear}
          material={materials.skin}
          position={[side * H * 0.95, -H * 0.06, -H * 0.04]}
          scale={[0.5, 1.15, 0.75]}
        />
      ))}

      {/* Eyes. Drawn elements, not surfaces — no outline pass, no shading. */}
      {[-1, 1].map((side) => (
        <group key={`eye-${String(side)}`} position={[EYE_X * side, EYE_Y, EYE_Z]}>
          <mesh
            geometry={resources.eyeWhite}
            material={materials.eyeWhite}
            scale={[1.3, 1.04, 0.38]}
          />
          <mesh
            geometry={resources.iris}
            material={materials.iris}
            position={[side * H * 0.025, -H * 0.015, H * 0.16]}
          />
          <mesh
            geometry={resources.pupil}
            material={materials.pupil}
            position={[side * H * 0.025, -H * 0.015, H * 0.17]}
          />
          {/* Two catchlights: a large one high, a small one opposite. Never
              removed — it is the whole difference between a gaze and a bead. */}
          <mesh
            geometry={resources.catchlight}
            material={materials.catchlight}
            position={[side * H * 0.14, H * 0.11, H * 0.18]}
          />
          <mesh
            geometry={resources.catchlightSmall}
            material={materials.catchlight}
            position={[side * -H * 0.09, -H * 0.11, H * 0.18]}
          />
          {/* Upper lid is the heaviest stroke on the face. */}
          <mesh
            geometry={resources.lidLine}
            material={materials.lineArt}
            position={[0, H * 0.22, H * 0.14]}
            rotation={[0, 0, side * -0.16]}
          />
          <mesh
            geometry={resources.brow}
            material={materials.lineArt}
            position={[0, H * 0.44, H * 0.08]}
            rotation={[0, 0, side * -0.3]}
          />
        </group>
      ))}

      {/* Visor sits on the brow, not over the eyes: a fighting game has to
          keep the gaze readable at camera distance. */}
      <group position={[0, H * 0.52, 0]} rotation={[0.12, 0, -0.13]}>
        <mesh geometry={resources.visor} material={materials.visor} />
        <mesh
          geometry={resources.visorStrap}
          material={materials.visor}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1, 1, 0.55]}
        />
      </group>

      {/* Hair mass first, blades over it, so the crown reads as one shape. */}
      <FighterPart
        geometry={resources.hairMass}
        outlineMaterial={outline}
        position={[0, H * 0.2, -H * 0.07]}
        scale={[1, 0.9, 1.02]}
        toonMaterial={materials.hair}
      />
      {HAIR_SPIKES.map(({ id, azimuth, tilt, scale }) => (
        <group key={id} rotation={[0, azimuth, 0]}>
          <group rotation={[-tilt, 0, 0]}>
            <FighterPart
              geometry={resources.hairSpike}
              outlineMaterial={outline}
              position={[0, H * (0.95 + 0.85 * scale), 0]}
              scale={[1, scale, 0.5]}
              toonMaterial={materials.hair}
            />
          </group>
        </group>
      ))}
      {HAIR_FRINGE.map(({ id, roll, x }) => (
        <FighterPart
          key={id}
          geometry={resources.hairFringe}
          outlineMaterial={outline}
          position={[x, H * 0.78, H * 0.62]}
          rotation={[2.5, 0, roll]}
          scale={[1, 1, 0.55]}
          toonMaterial={materials.hair}
        />
      ))}
    </group>
  );
}

export function VoidWalkerArm({
  side,
  materials,
  outline,
  refs,
  resources,
}: VoidWalkerBodyProps & { readonly side: 'left' | 'right' }) {
  const left = side === 'left';
  return (
    <group
      ref={left ? refs.leftArm : refs.rightArm}
      position={[left ? -0.46 : 0.46, 1.82, 0]}
    >
      <mesh geometry={resources.shoulder} material={materials.coat} />
      <FighterPart
        geometry={resources.upperArm}
        outlineMaterial={outline}
        position={[0, -0.22, 0]}
        toonMaterial={materials.coat}
      />
      <FighterPart
        geometry={resources.forearm}
        outlineMaterial={outline}
        position={[0, -0.63, 0]}
        toonMaterial={materials.coat}
      />
      {/* Shirt cuff breaking out of the sleeve — a small light value at the
          end of a long dark limb, which is what makes the arm read. */}
      <mesh
        geometry={resources.cuff}
        material={materials.shirt}
        position={[0, -0.835, 0]}
      />
      <mesh
        geometry={resources.hand}
        material={materials.skin}
        position={[0, -0.91, 0]}
        scale={[1, 1.3, 0.78]}
      />
    </group>
  );
}

export function VoidWalkerLeg({
  side,
  materials,
  outline,
  refs,
  resources,
}: VoidWalkerBodyProps & { readonly side: 'left' | 'right' }) {
  const left = side === 'left';
  return (
    <group
      ref={left ? refs.leftLeg : refs.rightLeg}
      position={[left ? -0.2 : 0.2, 0.92, 0]}
    >
      <FighterPart
        geometry={resources.thigh}
        outlineMaterial={outline}
        position={[0, -0.24, 0]}
        toonMaterial={materials.trousers}
      />
      <FighterPart
        geometry={resources.shin}
        outlineMaterial={outline}
        position={[0, -0.68, 0]}
        toonMaterial={materials.trousers}
      />
      <FighterPart
        geometry={resources.shoe}
        outlineMaterial={outline}
        position={[0, -0.9, H * 0.32]}
        toonMaterial={materials.boot}
      />
      <mesh
        geometry={resources.shoeToe}
        material={materials.boot}
        position={[0, -0.895, H * 0.98]}
        scale={[0.9, 0.55, 1.1]}
      />
    </group>
  );
}
