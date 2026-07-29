/**
 * Fighter geometry.
 *
 * Proportions are locked to a head-unit grid: HEAD is the head's *radius* and
 * every other dimension is a multiple of it. The figure resolves to roughly 7.3
 * heads at 1.9 m, which is where the reference titles sit — tall enough to read
 * as an adult, stylised enough that the head still carries the silhouette.
 *
 * The previous set ran at about 3 heads, which is why it read as a mannequin no
 * matter how good the shading was.
 */

import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three';

const HEAD = 0.13;

export function createZoroResources() {
  return {
    // --- head ---
    head: new SphereGeometry(HEAD, 22, 18),
    jaw: new SphereGeometry(HEAD * 0.86, 16, 12),
    neck: new CylinderGeometry(HEAD * 0.4, HEAD * 0.48, HEAD * 0.8, 10),
    hair: new ConeGeometry(HEAD * 0.4, HEAD * 1.5, 5),
    hairMass: new SphereGeometry(HEAD * 1.15, 18, 14),
    earring: new TorusGeometry(HEAD * 0.19, HEAD * 0.055, 5, 10),

    // --- eyes: deliberately oversized, the strongest single style signal ---
    eyeWhite: new SphereGeometry(HEAD * 0.42, 16, 12),
    iris: new CircleGeometry(HEAD * 0.3, 20),
    pupil: new CircleGeometry(HEAD * 0.15, 16),
    catchlight: new CircleGeometry(HEAD * 0.075, 10),
    lidLine: new BoxGeometry(HEAD * 0.78, HEAD * 0.1, HEAD * 0.06),
    brow: new BoxGeometry(HEAD * 0.6, HEAD * 0.09, HEAD * 0.06),

    // --- torso ---
    chest: new CapsuleGeometry(HEAD * 1.46, HEAD * 1.5, 6, 16),
    body: new CapsuleGeometry(HEAD * 1.1, HEAD * 1.0, 6, 14),
    hips: new CapsuleGeometry(HEAD * 1.28, HEAD * 0.42, 5, 14),
    shoulder: new SphereGeometry(HEAD * 0.8, 14, 10),

    // --- limbs ---
    arm: new CapsuleGeometry(HEAD * 0.4, HEAD * 1.7, 4, 10),
    forearm: new CapsuleGeometry(HEAD * 0.34, HEAD * 1.55, 4, 10),
    hand: new SphereGeometry(HEAD * 0.47, 12, 10),
    leg: new CapsuleGeometry(HEAD * 0.6, HEAD * 2.15, 4, 12),
    shin: new CapsuleGeometry(HEAD * 0.46, HEAD * 2.05, 4, 12),
    foot: new BoxGeometry(HEAD * 0.62, HEAD * 0.38, HEAD * 1.4),

    // --- costume ---
    robe: new ConeGeometry(HEAD * 2.0, HEAD * 3.6, 12, 1, true),
    collar: new CylinderGeometry(HEAD * 0.82, HEAD * 0.64, HEAD * 0.75, 12, 1, true),
    sash: new TorusGeometry(HEAD * 1.16, HEAD * 0.2, 6, 20),

    // --- weapons ---
    blade: new BoxGeometry(HEAD * 0.36, HEAD * 7.2, HEAD * 0.13),
    handle: new CylinderGeometry(HEAD * 0.3, HEAD * 0.3, HEAD * 2.3, 8),
    guard: new TorusGeometry(HEAD * 0.72, HEAD * 0.18, 5, 12),
    scabbard: new BoxGeometry(HEAD * 0.48, HEAD * 7.5, HEAD * 0.4),

    // --- effects ---
    slash: new TorusGeometry(HEAD * 4.1, HEAD * 0.24, 6, 32, Math.PI * 1.35),
    projectile: new TorusGeometry(HEAD * 3.05, HEAD * 0.34, 6, 28, Math.PI),
  };
}

export type ZoroResources = ReturnType<typeof createZoroResources>;

export function disposeZoroResources(resources: ZoroResources): void {
  for (const geometry of Object.values(resources) as BufferGeometry[]) {
    geometry.dispose();
  }
}

/** Head radius, so the rig can lay parts out on the same grid. */
export const HEAD_UNIT = HEAD;
/** Finished figure height, for camera framing and ground shadows. */
export const FIGHTER_HEIGHT = HEAD * 14.6;
