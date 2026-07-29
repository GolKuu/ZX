/**
 * Placeholder fighter geometry.
 *
 * Still primitives — authored meshes are an asset task, not a code one — but
 * built to a real figure instead of a capsule mannequin: 1.90 m at roughly 7.5
 * heads, with the joints and mass distribution a fighter needs to read as a
 * silhouette (ART-CCU-400 §1.3).
 *
 * Every dimension is expressed against HEAD so the proportions stay locked when
 * the scale changes.
 */

import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  SphereGeometry,
} from 'three';

const HEAD = 0.125;

export function createFighterResources() {
  return {
    // head group
    head: new SphereGeometry(HEAD, 20, 16),
    neck: new CylinderGeometry(HEAD * 0.4, HEAD * 0.46, HEAD * 0.85, 10),
    hairBack: new SphereGeometry(HEAD * 1.14, 16, 12),
    hairSpike: new ConeGeometry(HEAD * 0.32, HEAD * 1.45, 5),

    // torso
    chest: new CapsuleGeometry(HEAD * 1.42, HEAD * 1.75, 6, 16),
    waist: new CapsuleGeometry(HEAD * 1.06, HEAD * 0.8, 5, 14),
    hips: new CapsuleGeometry(HEAD * 1.3, HEAD * 0.45, 5, 14),
    shoulder: new SphereGeometry(HEAD * 0.78, 14, 10),

    // arms
    upperArm: new CapsuleGeometry(HEAD * 0.4, HEAD * 1.75, 4, 10),
    forearm: new CapsuleGeometry(HEAD * 0.34, HEAD * 1.6, 4, 10),
    hand: new SphereGeometry(HEAD * 0.48, 12, 10),

    // legs
    thigh: new CapsuleGeometry(HEAD * 0.6, HEAD * 2.2, 4, 12),
    shin: new CapsuleGeometry(HEAD * 0.46, HEAD * 2.1, 4, 12),
    foot: new BoxGeometry(HEAD * 0.64, HEAD * 0.4, HEAD * 1.45),

    // costume silhouette — the part that stops it reading as a mannequin
    coat: new CylinderGeometry(HEAD * 1.26, HEAD * 2.0, HEAD * 3.3, 14, 1, true),
    collar: new CylinderGeometry(HEAD * 0.8, HEAD * 0.62, HEAD * 0.78, 12, 1, true),
    belt: new CylinderGeometry(HEAD * 1.14, HEAD * 1.14, HEAD * 0.26, 14),
  };
}

export type FighterResources = ReturnType<typeof createFighterResources>;

export function disposeFighterResources(resources: FighterResources): void {
  for (const geometry of Object.values(resources) as BufferGeometry[]) {
    geometry.dispose();
  }
}

/** Finished height, for camera framing and blob shadows. */
export const FIGHTER_HEIGHT = 1.9;
export const FIGHTER_HEAD_RADIUS = HEAD;
