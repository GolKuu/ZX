/**
 * Authored attack strings for the two lead characters.
 *
 * These are original choreography written to each character's archetype, not
 * transcriptions of any existing footage. What is borrowed from reference
 * fight animation is *technique*, which is not ownable and is the part that
 * actually transfers: hold the key pose, spend smoothness only on the strike,
 * put one impossible frame between the coil and the extreme, and let the
 * recovery overshoot before it settles.
 *
 * Beat holds are in simulation frames. Threes read as compression, twos as
 * momentum, ones only on smears.
 */

import {
  liftHips,
  turnJoint as turn,
  type PoseRest,
} from './rosterPoseTools';
import type { Choreography } from './choreography';
import type { HumanoidJoints } from './humanoidBones';

/** Every sequence in this file poses a resolved humanoid rig. */
export type Sequence = Choreography<HumanoidJoints, PoseRest>;

/* ------------------------------------------------------------------ */
/* Blade Phantom — three-blade string                                  */
/* ------------------------------------------------------------------ */

/**
 * Four cuts on a rising diagonal, each from a deeper coil than the last, then
 * a held finish. The character's identity is the *sequence*, so the string
 * spends its frames on distinct key poses rather than one long swing.
 */
export const BLADE_PHANTOM_STRING: Sequence = {
  moveId: '5H',
  beats: [
    {
      name: 'coil',
      hold: 3,
      pose: (joints, rest) => {
        stance(joints, rest, 0.42);
        // Blades drawn back across the body — the further the coil, the more
        // the first cut is worth.
        turn(joints, 'chest', 0.06, 0.52, 0);
        turn(joints, 'upperArmR', -1.15, -0.3, -0.5);
        turn(joints, 'forearmR', -1.55, 0, 0);
        turn(joints, 'upperArmL', -0.72, 0.34, 0.62);
        turn(joints, 'forearmL', -1.3, 0, 0);
        turn(joints, 'head', 0, 0.24, 0);
      },
    },
    {
      name: 'smear-1',
      hold: 1,
      smear: true,
      pose: (joints, rest) => {
        stance(joints, rest, 0.2);
        // Impossible reach. One frame only.
        turn(joints, 'chest', 0, -0.5, 0);
        turn(joints, 'upperArmR', -1.9, 0.4, 0.3);
        turn(joints, 'forearmR', -0.1, 0, 0);
        turn(joints, 'upperArmL', -1.5, 0.2, 0.4);
      },
    },
    {
      name: 'cut-1',
      hold: 2,
      pose: (joints, rest) => {
        stance(joints, rest, 0.16);
        turn(joints, 'hips', 0, -0.36, 0);
        turn(joints, 'chest', 0.04, -0.62, -0.14);
        turn(joints, 'upperArmR', -1.34, 0.42, 0.24);
        turn(joints, 'forearmR', -0.24, 0, 0);
        turn(joints, 'upperArmL', -0.5, -0.2, -0.55);
        turn(joints, 'forearmL', -1.4, 0, 0);
        turn(joints, 'head', -0.06, -0.28, 0);
      },
    },
    {
      name: 'cut-2',
      hold: 2,
      pose: (joints, rest) => {
        stance(joints, rest, 0.24);
        // Counter-rotation: the second cut comes off the recoil of the first,
        // which is what makes a string read as one motion rather than two.
        turn(joints, 'hips', 0, 0.3, 0);
        turn(joints, 'chest', 0.02, 0.44, 0.16);
        turn(joints, 'upperArmL', -1.42, 0.36, 0.5);
        turn(joints, 'forearmL', -0.3, 0, 0);
        turn(joints, 'upperArmR', -0.46, -0.24, -0.6);
        turn(joints, 'forearmR', -1.36, 0, 0);
        turn(joints, 'head', -0.04, 0.2, 0);
      },
    },
    {
      name: 'smear-2',
      hold: 1,
      smear: true,
      pose: (joints, rest) => {
        stance(joints, rest, 0.34);
        turn(joints, 'chest', -0.2, -0.2, 0);
        turn(joints, 'upperArmR', -2.1, 0.1, -0.1);
        turn(joints, 'upperArmL', -2.0, -0.1, 0.1);
      },
    },
    {
      name: 'finish',
      hold: 3,
      pose: (joints, rest, within) => {
        // The finish drops lower and holds. Weight is the point.
        stance(joints, rest, 0.52 + within * 0.06);
        turn(joints, 'hips', 0.16, -0.5, 0);
        turn(joints, 'spine', 0.2, -0.24, 0);
        turn(joints, 'chest', 0.24, -0.4, -0.2);
        turn(joints, 'upperArmR', -0.5, 0.5, 0.9);
        turn(joints, 'forearmR', -0.34, 0, 0);
        turn(joints, 'upperArmL', -0.4, 0.3, -0.8);
        turn(joints, 'forearmL', -0.5, 0, 0);
        turn(joints, 'head', 0.14, -0.3, 0);
      },
    },
    {
      name: 'settle',
      hold: 3,
      pose: (joints, rest, within) => {
        // Overshoot back past neutral, then ease in. Returning straight to
        // neutral reads as an animation stopping, not a body recovering.
        const back = 1 - within;
        stance(joints, rest, 0.3 * back);
        turn(joints, 'chest', 0.1 * back, -0.2 * back, 0);
        turn(joints, 'upperArmR', -0.7 - back * 0.2, 0.2, 0.5);
        turn(joints, 'forearmR', -1.1, 0, 0);
        turn(joints, 'upperArmL', -0.6, -0.2, -0.5);
        turn(joints, 'forearmL', -1.2, 0, 0);
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Void Walker — distance-control string                               */
/* ------------------------------------------------------------------ */

/**
 * The opposite performance. Almost no wind-up, almost no follow-through: a
 * single unhurried gesture, a long *stillness*, then the hit lands away from
 * the body. The stillness is the choreography — for a character whose whole
 * design pillar is composure, the held empty beat does more than a flourish.
 */
export const VOID_WALKER_STRING: Sequence = {
  moveId: 'overtake',
  beats: [
    {
      name: 'raise',
      hold: 3,
      pose: (joints, rest) => {
        stance(joints, rest, 0.1);
        // Hand comes up, body does not move. He does not brace.
        turn(joints, 'upperArmR', -1.5, -0.1, -0.3);
        turn(joints, 'forearmR', -0.9, 0, 0);
        turn(joints, 'handR', 0, 0, 0.2);
        turn(joints, 'head', -0.06, -0.12, 0);
      },
    },
    {
      name: 'still',
      hold: 4,
      pose: (joints, rest, within) => {
        // Held. The only movement is a breath. Four frames of nothing is a
        // long time in a fighting game, and that is the intent.
        stance(joints, rest, 0.08);
        const breath = Math.sin(within * Math.PI) * 0.02;
        turn(joints, 'spine', breath, -0.1, 0);
        turn(joints, 'upperArmR', -1.62, -0.12, -0.28);
        turn(joints, 'forearmR', -0.82, 0, 0);
        turn(joints, 'head', -0.08, -0.14, 0);
      },
    },
    {
      name: 'smear',
      hold: 1,
      smear: true,
      pose: (joints, rest) => {
        stance(joints, rest, 0.1);
        turn(joints, 'upperArmR', -2.2, 0.2, 0.1);
        turn(joints, 'forearmR', -0.05, 0, 0);
      },
    },
    {
      name: 'release',
      hold: 2,
      pose: (joints, rest) => {
        stance(joints, rest, 0.14);
        // The arm extends; the torso barely turns. The distance does the work.
        turn(joints, 'hips', 0, -0.18, 0);
        turn(joints, 'chest', 0, -0.26, 0);
        turn(joints, 'upperArmR', -1.72, 0.24, -0.16);
        turn(joints, 'forearmR', -0.1, 0, 0);
        turn(joints, 'handR', 0, 0, 0.3);
        turn(joints, 'upperArmL', -0.3, -0.16, -0.5);
        turn(joints, 'forearmL', -1.44, 0, 0);
        turn(joints, 'head', -0.05, -0.2, 0);
      },
    },
    {
      name: 'hold',
      hold: 3,
      pose: (joints, rest) => {
        // Held at full extension. No recoil — nothing pushed back at him.
        stance(joints, rest, 0.12);
        turn(joints, 'chest', 0, -0.24, 0);
        turn(joints, 'upperArmR', -1.68, 0.22, -0.14);
        turn(joints, 'forearmR', -0.12, 0, 0);
        turn(joints, 'upperArmL', -0.32, -0.16, -0.52);
        turn(joints, 'forearmL', -1.42, 0, 0);
      },
    },
    {
      name: 'lower',
      hold: 3,
      pose: (joints, rest, within) => {
        const back = 1 - within;
        stance(joints, rest, 0.1);
        turn(joints, 'chest', 0, -0.18 * back, 0);
        turn(joints, 'upperArmR', -0.5 - back * 1.0, 0.1, -0.4);
        turn(joints, 'forearmR', -1.2 + back * 0.9, 0, 0);
        turn(joints, 'upperArmL', -0.34, -0.14, -0.48);
        turn(joints, 'forearmL', -1.4, 0, 0);
      },
    },
  ],
};

/* ------------------------------------------------------------------ */

/**
 * Shared lower body. Every beat calls it so the legs never pop between keys —
 * a string whose stance resets on each beat reads as separate moves.
 */
function stance(joints: HumanoidJoints, rest: PoseRest, sink: number): void {
  turn(joints, 'hips', 0.06 + sink * 0.2, 0.36, 0);
  turn(joints, 'thighL', -0.22 - sink * 0.4, 0.1, 0.13);
  turn(joints, 'shinL', 0.36 + sink * 0.6, 0, 0);
  turn(joints, 'footL', -0.14 - sink * 0.2, 0, 0);
  turn(joints, 'thighR', 0.18 + sink * 0.24, -0.12, -0.15);
  turn(joints, 'shinR', 0.32 + sink * 0.5, 0, 0);
  turn(joints, 'footR', -0.12 - sink * 0.16, 0, 0);
  liftHips(joints, rest, -sink * 0.16);
}

/** Sequences by move id, per character. */
export const BLADE_PHANTOM_CHOREOGRAPHY: readonly Sequence[] = [
  BLADE_PHANTOM_STRING,
];

export const VOID_WALKER_CHOREOGRAPHY: readonly Sequence[] = [
  VOID_WALKER_STRING,
];
