/**
 * Poses for the tiers a per-move row cannot cover: supers, ultimates, the taunt
 * and the ground dash.
 *
 * Authored the same way as the tables in `modelPose.ts` — additive rotations in
 * character space, driven by the simulation's own beats — and kept in their own
 * file because those tables are long enough already.
 */

import { turnJointInCharacterSpace } from './boneSpace';
import type { HumanoidJointName, HumanoidJoints } from './humanoidBones';
import type { RestPose } from './modelPose';

export type ModelPose = (
  joints: HumanoidJoints,
  rest: RestPose,
  windup: number,
  strike: number,
  settle: number,
) => void;

function turn(
  joints: HumanoidJoints,
  name: HumanoidJointName,
  x: number,
  y: number,
  z: number,
): void {
  turnJointInCharacterSpace(joints, name, x, y, z);
}

function lift(joints: HumanoidJoints, rest: RestPose, offset: number): void {
  const hips = joints.hips;
  if (hips === null) return;
  hips.position.y = rest.hipsHeight + offset;
}

function recoveredStrike(strike: number, settle: number): number {
  const eased = settle * settle * (3 - 2 * settle);
  return strike * (1 - eased);
}

/** Super: deep coil, both arms driving through, hips dropped into a long lunge. */
const superBlow: ModelPose = (joints, rest, windup, strike, settle) => {
  const coil = windup * (1 - strike);
  const reach = recoveredStrike(strike, settle);

  turn(joints, 'hips', 0.1 * reach, 0.46 - reach * 0.9 + coil * 0.3, 0);
  turn(joints, 'spine', 0.16 * coil - 0.24 * reach, -0.2 - reach * 0.55, 0);
  turn(joints, 'chest', 0.06 - 0.16 * reach, -0.16 - reach * 0.7 + coil * 0.34, 0);
  turn(joints, 'neck', 0.08 * reach, -0.1 - reach * 0.18, 0);
  turn(joints, 'head', -reach * 0.05, -0.12 - reach * 0.26, 0);

  turn(joints, 'shoulderL', 0, -reach * 0.55, -0.14 - reach * 0.2);
  turn(joints, 'upperArmL', -1.7 - coil * 0.35 + reach * 0.1, 0.2, 0.34);
  turn(joints, 'forearmL', -1.5 + coil * 0.45 + reach * 1.75, 0, 0);
  turn(joints, 'shoulderR', 0, -reach * 0.4, 0.12 - reach * 0.16);
  turn(joints, 'upperArmR', -1.35 - coil * 0.3 + reach * 0.1, -0.16, -0.5);
  turn(joints, 'forearmR', -1.55 + coil * 0.4 + reach * 1.45, 0, 0);

  turn(joints, 'thighL', -0.5 - reach * 0.5, 0.12, 0.18);
  turn(joints, 'shinL', 0.62, 0, 0);
  turn(joints, 'thighR', 0.36 + reach * 0.6, -0.14, -0.2);
  turn(joints, 'shinR', 0.24, 0, 0);

  lift(joints, rest, -0.07 - reach * 0.1);
};

/** Ultimate: the comeback finisher goes up — arched spine, both arms open. */
const ultimateBlow: ModelPose = (joints, rest, windup, strike, settle) => {
  const coil = windup * (1 - strike);
  const reach = recoveredStrike(strike, settle);

  turn(joints, 'hips', -0.22 * reach + 0.16 * coil, 0.4 - reach * 0.55, 0);
  turn(joints, 'spine', 0.24 * coil - 0.4 * reach, -0.14, 0);
  turn(joints, 'chest', 0.1 * coil - 0.34 * reach, -0.12, 0);
  turn(joints, 'neck', -0.12 * reach, -0.08, 0);
  turn(joints, 'head', -0.24 * reach, -0.06, 0);

  // Both arms are thrown open above the shoulders.
  turn(joints, 'shoulderL', 0, 0, -0.16 - reach * 0.5);
  turn(joints, 'upperArmL', -1.6 - coil * 0.4 + reach * 0.5, 0.2, 0.34 + reach * 0.9);
  turn(joints, 'forearmL', -1.45 + coil * 0.3 + reach * 1.3, 0, 0);
  turn(joints, 'shoulderR', 0, 0, 0.14 + reach * 0.5);
  turn(joints, 'upperArmR', -1.4 - coil * 0.35 + reach * 0.5, -0.18, -0.5 - reach * 0.85);
  turn(joints, 'forearmR', -1.5 + coil * 0.3 + reach * 1.2, 0, 0);

  // Rear knee drives up as the fighter rises out of the coil.
  turn(joints, 'thighL', -0.3 - coil * 0.3 - reach * 0.95, 0.12, 0.16);
  turn(joints, 'shinL', 0.5 + coil * 0.5 - reach * 0.3, 0, 0);
  turn(joints, 'thighR', 0.3 + reach * 0.4, -0.12, -0.16);
  turn(joints, 'shinR', 0.26, 0, 0);

  lift(joints, rest, -0.05 - coil * 0.06 + reach * 0.16);
};

/** Taunt: out of the crouch, chest open, lead hand beckoning, rear hand on the hip. */
const taunt: ModelPose = (joints, rest, windup, strike, settle) => {
  const out = Math.max(windup * 0.35, recoveredStrike(strike, settle));

  turn(joints, 'hips', 0, 0.34 - out * 0.2, 0);
  turn(joints, 'spine', -0.06 - out * 0.16, -0.12, 0);
  turn(joints, 'chest', 0.02 - out * 0.12, -0.1 + out * 0.24, 0);
  turn(joints, 'neck', 0.02 + out * 0.1, -0.12, 0);
  turn(joints, 'head', -0.04 + out * 0.22, -0.1 + out * 0.14, 0);

  // Lead hand up and open; the elbow stays folded so it reads as a gesture
  // rather than a punch.
  turn(joints, 'shoulderL', 0, 0, -0.12 - out * 0.3);
  turn(joints, 'upperArmL', -0.62 - out * 0.5, 0.18, 0.32 + out * 0.5);
  turn(joints, 'forearmL', -1.15 - out * 0.35, 0, 0);
  turn(joints, 'shoulderR', 0, 0, 0.1);
  turn(joints, 'upperArmR', -0.34 + out * 0.3, -0.14, -0.46 + out * 0.2);
  turn(joints, 'forearmR', -1.42 - out * 0.2, 0, 0);

  // Knees straighten out of the fighting crouch — the fighter stands up.
  turn(joints, 'thighL', -0.2 + out * 0.14, 0.1, 0.12);
  turn(joints, 'shinL', 0.34 - out * 0.2, 0, 0);
  turn(joints, 'thighR', 0.16 - out * 0.1, -0.12, -0.14);
  turn(joints, 'shinR', 0.3 - out * 0.18, 0, 0);

  lift(joints, rest, -0.045 + out * 0.035);
};

export const MODEL_KIND_POSES: Readonly<Record<string, ModelPose>> = {
  super: superBlow,
  ultimate: ultimateBlow,
  taunt,
};

/**
 * Ground dash. `phase` is the dash's own 0…1 countdown, so the burst peaks in
 * the middle instead of holding one frozen frame for eight ticks.
 */
export function poseModelDash(
  joints: HumanoidJoints,
  rest: RestPose,
  forward: boolean,
  phase: number,
): void {
  const drive = Math.sin(Math.max(0, Math.min(1, phase)) * Math.PI);

  if (!forward) {
    turn(joints, 'hips', -0.1 * drive, 0.34, 0);
    turn(joints, 'spine', -0.04 - drive * 0.2, -0.12, 0);
    turn(joints, 'chest', 0.02 - drive * 0.12, -0.1, 0);
    turn(joints, 'head', -0.04 + drive * 0.06, -0.1, 0);
    // The guard stays where it was: a back dash exists to keep it up.
    turn(joints, 'upperArmL', -0.62 - drive * 0.2, 0.18, 0.32);
    turn(joints, 'forearmL', -1.15 - drive * 0.2, 0, 0);
    turn(joints, 'upperArmR', -0.34 - drive * 0.15, -0.14, -0.46);
    turn(joints, 'forearmR', -1.42 - drive * 0.15, 0, 0);
    turn(joints, 'thighL', -0.2 - drive * 0.55, 0.1, 0.12);
    turn(joints, 'shinL', 0.34 + drive * 0.5, 0, 0);
    turn(joints, 'thighR', 0.16 - drive * 0.45, -0.12, -0.14);
    turn(joints, 'shinR', 0.3 + drive * 0.45, 0, 0);
    lift(joints, rest, -0.045 + drive * 0.12);
    return;
  }

  turn(joints, 'hips', 0.16 * drive, 0.34 - drive * 0.3, 0);
  turn(joints, 'spine', -0.04 + drive * 0.26, -0.12, 0);
  turn(joints, 'chest', 0.02 + drive * 0.16, -0.1, 0);
  turn(joints, 'head', -0.04 - drive * 0.1, -0.1, 0);
  // Arms strung out behind, far arm reaching ahead into the run.
  turn(joints, 'upperArmL', -0.62 + drive * 0.75, 0.18, 0.32);
  turn(joints, 'forearmL', -1.15 - drive * 0.25, 0, 0);
  turn(joints, 'upperArmR', -0.34 - drive * 0.6, -0.14, -0.46);
  turn(joints, 'forearmR', -1.42 + drive * 0.3, 0, 0);
  turn(joints, 'thighL', -0.2 - drive * 0.75, 0.1, 0.12);
  turn(joints, 'shinL', 0.34 + drive * 0.3, 0, 0);
  turn(joints, 'thighR', 0.16 + drive * 0.55, -0.12, -0.14);
  turn(joints, 'shinR', 0.3 + drive * 0.45, 0, 0);
  lift(joints, rest, -0.045 - drive * 0.055);
}
