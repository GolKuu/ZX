/**
 * Void Walker — geometry.
 *
 * Proportions are locked to a head-unit grid where HEAD is the head *radius*.
 * The figure resolves to roughly 7.7 heads, built to the shared rig anchors in
 * `zoroRig.resetZoroRig` (hips 0.92, shoulders 1.82, head 2.45) so every part
 * actually meets its neighbour instead of floating.
 *
 * Silhouette targets, in order of how strongly each one carries the read at
 * fighting-game camera distance (CHR-CCU-810 §2):
 *
 *   1. Radial spiked crown, near-white, wider than the shoulders are deep.
 *   2. Standing collar that runs from the shoulder line to the jaw.
 *   3. Long coat split at the front, breaking at mid-thigh.
 *   4. Slim legs and hard-edged dress shoes — no bulk below the knee.
 */

import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three';

const HEAD = 0.17;

export function createVoidWalkerResources() {
  return {
    // --- head ---
    head: new SphereGeometry(HEAD, 24, 18),
    jaw: new SphereGeometry(HEAD * 0.8, 16, 12),
    ear: new SphereGeometry(HEAD * 0.2, 8, 6),
    neck: new CylinderGeometry(HEAD * 0.36, HEAD * 0.46, HEAD * 1.0, 12),
    nose: new ConeGeometry(HEAD * 0.09, HEAD * 0.2, 4),

    // --- hair: one mass plus a crown of flat blades, never round cones ---
    hairMass: new SphereGeometry(HEAD * 1.1, 20, 16),
    hairSpike: new ConeGeometry(HEAD * 0.3, HEAD * 1.7, 4),
    hairFringe: new ConeGeometry(HEAD * 0.24, HEAD * 1.0, 4),

    // --- eyes: oversized on purpose, the strongest single style signal ---
    eyeWhite: new SphereGeometry(HEAD * 0.36, 16, 12),
    iris: new CircleGeometry(HEAD * 0.27, 22),
    pupil: new CircleGeometry(HEAD * 0.12, 16),
    catchlight: new CircleGeometry(HEAD * 0.075, 10),
    catchlightSmall: new CircleGeometry(HEAD * 0.034, 8),
    lidLine: new BoxGeometry(HEAD * 0.74, HEAD * 0.085, HEAD * 0.05),
    brow: new BoxGeometry(HEAD * 0.54, HEAD * 0.075, HEAD * 0.05),

    // --- visor: an arc across the brow, plus the strap that closes it ---
    visor: new CylinderGeometry(
      HEAD * 1.04, HEAD * 1.04, HEAD * 0.4, 22, 1, true, -1.16, 2.32,
    ),
    visorStrap: new TorusGeometry(HEAD * 1.02, HEAD * 0.05, 6, 26),

    // --- torso: capsules, squashed in Z by the parts file into an oval ---
    chest: new CapsuleGeometry(HEAD * 1.5, HEAD * 1.3, 6, 18),
    waist: new CapsuleGeometry(HEAD * 1.2, HEAD * 0.5, 5, 14),
    hips: new CapsuleGeometry(HEAD * 1.35, HEAD * 0.3, 5, 14),
    shoulder: new SphereGeometry(HEAD * 0.6, 14, 10),

    // --- limbs ---
    upperArm: new CapsuleGeometry(HEAD * 0.38, HEAD * 2.0, 4, 12),
    forearm: new CapsuleGeometry(HEAD * 0.33, HEAD * 1.75, 4, 12),
    hand: new SphereGeometry(HEAD * 0.34, 12, 10),
    cuff: new CylinderGeometry(HEAD * 0.38, HEAD * 0.36, HEAD * 0.26, 12),
    thigh: new CapsuleGeometry(HEAD * 0.5, HEAD * 1.9, 4, 12),
    shin: new CapsuleGeometry(HEAD * 0.38, HEAD * 1.9, 4, 12),
    shoe: new BoxGeometry(HEAD * 0.58, HEAD * 0.3, HEAD * 1.45),
    shoeToe: new SphereGeometry(HEAD * 0.28, 10, 8),

    // --- costume ---
    collar: new CylinderGeometry(
      HEAD * 1.18, HEAD * 0.94, HEAD * 2.2, 18, 1, true,
    ),
    coat: new CylinderGeometry(HEAD * 1.6, HEAD * 2.1, HEAD * 4.6, 18, 1, true),
    coatPanel: new BoxGeometry(HEAD * 0.14, HEAD * 2.4, HEAD * 0.05),
    coatSeam: new BoxGeometry(HEAD * 0.09, HEAD * 4.3, HEAD * 0.05),
    clasp: new SphereGeometry(HEAD * 0.11, 10, 8),

    // --- effects ---
    orb: new IcosahedronGeometry(HEAD * 1.45, 2),
    barrier: new SphereGeometry(HEAD * 5.4, 30, 22),
    ring: new TorusGeometry(HEAD * 2.6, HEAD * 0.085, 6, 34),
    slash: new TorusGeometry(HEAD * 3.2, HEAD * 0.19, 6, 34, Math.PI * 1.25),
    tendril: new ConeGeometry(HEAD * 0.3, HEAD * 4.4, 4),
  };
}

export type VoidWalkerResources = ReturnType<typeof createVoidWalkerResources>;

export function disposeVoidWalkerResources(
  resources: VoidWalkerResources,
): void {
  for (const geometry of Object.values(resources) as BufferGeometry[]) {
    geometry.dispose();
  }
}

/** Head radius, so the parts file can lay out on the same grid. */
export const HEAD_UNIT = HEAD;
/** Crown of the hair, for camera framing and ground shadows. */
export const FIGHTER_HEIGHT = 2.95;
