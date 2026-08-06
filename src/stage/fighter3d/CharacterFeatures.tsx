'use client';

import { DoubleSide } from 'three';
import { hasFeature, type CharacterBuild } from './characterBuild';
import type { FighterSurfaces } from './fighter3dMaterials';

/**
 * The pieces that make a body into a *character*.
 *
 * The base skeleton is deliberately generic — every fighter is the same capsules
 * — because identity at fighting-game distances comes almost entirely from what
 * sticks out past the silhouette. Mim's mask, Vorgh's horns, Titan's pauldrons
 * and Lucky's coat-tails are all read before a single colour is; that is why
 * they are modelled and the costume detail is not.
 *
 * Everything here hangs off the torso joint, so it swings with the body for
 * free rather than needing its own animation.
 */
export function CharacterFeatures({
  build,
  shoulder,
  surfaces,
}: {
  readonly build: CharacterBuild;
  readonly shoulder: number;
  readonly surfaces: FighterSurfaces;
}) {
  return (
    <>
      {hasFeature(build, 'mask') ? <Mask surfaces={surfaces} /> : null}
      {hasFeature(build, 'visor') ? <Visor surfaces={surfaces} /> : null}
      {hasFeature(build, 'horns') ? <Horns surfaces={surfaces} /> : null}
      {hasFeature(build, 'hair') ? <Hair surfaces={surfaces} /> : null}
      {hasFeature(build, 'pauldrons') ? (
        <Pauldrons shoulder={shoulder} surfaces={surfaces} />
      ) : null}
      {hasFeature(build, 'spikes') ? (
        <Spikes shoulder={shoulder} surfaces={surfaces} />
      ) : null}
      {hasFeature(build, 'cape') ? <Cape shoulder={shoulder} surfaces={surfaces} /> : null}
      {hasFeature(build, 'coat') ? <Coat shoulder={shoulder} surfaces={surfaces} /> : null}
    </>
  );
}

/** MIM: a smooth bone face with two dark hollows where the eyes should be. */
function Mask({ surfaces }: { readonly surfaces: FighterSurfaces }) {
  return (
    <group position={[0, 0.62, 0.07]}>
      <mesh castShadow scale={[1, 1.2, 0.7]}>
        <sphereGeometry args={[0.105, 14, 12]} />
        <primitive attach="material" object={surfaces.plate} />
      </mesh>
      {[-0.042, 0.042].map((x) => (
        <mesh key={x} position={[x, 0.02, 0.058]} scale={[1, 1.5, 1]}>
          <sphereGeometry args={[0.021, 8, 6]} />
          <primitive attach="material" object={surfaces.under} />
        </mesh>
      ))}
    </group>
  );
}

/** GLITCH: a single horizontal light band across the face. */
function Visor({ surfaces }: { readonly surfaces: FighterSurfaces }) {
  return (
    <mesh position={[0, 0.635, 0.088]}>
      <boxGeometry args={[0.15, 0.032, 0.05]} />
      <primitive attach="material" object={surfaces.glow} />
    </mesh>
  );
}

/** VORGH: a swept pair, the widest thing on his silhouette. */
function Horns({ surfaces }: { readonly surfaces: FighterSurfaces }) {
  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          castShadow
          key={side}
          position={[0.075 * side, 0.7, -0.01]}
          rotation={[-0.4, 0, side * -0.55]}
        >
          <coneGeometry args={[0.032, 0.24, 6]} />
          <primitive attach="material" object={surfaces.plate} />
        </mesh>
      ))}
    </>
  );
}

/** LUCKY: a swept-back crest, read as hair rather than modelled as strands. */
function Hair({ surfaces }: { readonly surfaces: FighterSurfaces }) {
  return (
    <mesh castShadow position={[0, 0.69, -0.03]} rotation={[0.34, 0, 0]}>
      <coneGeometry args={[0.1, 0.24, 7]} />
      <primitive attach="material" object={surfaces.under} />
    </mesh>
  );
}

/** GLITCH and TITAN: shoulder armour, the industrial read. */
function Pauldrons({
  shoulder,
  surfaces,
}: {
  readonly shoulder: number;
  readonly surfaces: FighterSurfaces;
}) {
  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          castShadow
          key={side}
          position={[shoulder * 1.06 * side, 0.42, 0]}
          receiveShadow
          rotation={[0, 0, side * -0.24]}
        >
          <sphereGeometry args={[shoulder * 0.62, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <primitive attach="material" object={surfaces.plate} />
        </mesh>
      ))}
    </>
  );
}

/** VORGH and TITAN: a back ridge. Only visible in profile, which is the point. */
function Spikes({
  shoulder,
  surfaces,
}: {
  readonly shoulder: number;
  readonly surfaces: FighterSurfaces;
}) {
  return (
    <>
      {[0, 1, 2].map((index) => (
        <mesh
          castShadow
          key={index}
          position={[0, 0.46 - index * 0.13, -shoulder * 0.78]}
          rotation={[0.9, 0, 0]}
        >
          <coneGeometry args={[0.028, 0.15 - index * 0.02, 5]} />
          <primitive attach="material" object={surfaces.plate} />
        </mesh>
      ))}
    </>
  );
}

/** MIM: a hanging sheet. Double-sided, because it is seen from both edges. */
function Cape({
  shoulder,
  surfaces,
}: {
  readonly shoulder: number;
  readonly surfaces: FighterSurfaces;
}) {
  return (
    <mesh position={[0, 0.14, -shoulder * 0.92]} rotation={[0.12, 0, 0]}>
      <planeGeometry args={[shoulder * 2.1, 0.86]} />
      <meshStandardMaterial
        color={surfaces.under.color}
        roughness={0.92}
        side={DoubleSide}
      />
    </mesh>
  );
}

/** LUCKY: split coat-tails, so the shape moves like cloth without simulating it. */
function Coat({
  shoulder,
  surfaces,
}: {
  readonly shoulder: number;
  readonly surfaces: FighterSurfaces;
}) {
  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[shoulder * 0.5 * side, -0.12, -0.04]}
          rotation={[0.16, 0, side * 0.08]}
        >
          <planeGeometry args={[shoulder * 0.98, 0.72]} />
          <meshStandardMaterial
            color={surfaces.body.color}
            roughness={0.88}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}
