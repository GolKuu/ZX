/**
 * Our own animation, applied to somebody else's skeleton.
 *
 * The model is bought or downloaded; the motion is not. Nothing here plays a
 * clip that shipped inside the GLB — every pose below is authored against the
 * simulation's frame data (`src/data/combat-moves.ts`), which is what keeps
 * rule R4 true: the simulation owns the timeline and animation reads it. A
 * baked clip would own its own timeline and drift out of the frame data on the
 * first balance change.
 *
 * ## How the rotations are applied
 *
 * Rigs disagree about bone axes. Mixamo's arm bones run down +Y with an
 * arbitrary roll; another vendor's run down +X. Rotating in bone-local *or*
 * parent space therefore means something different in every file — Mixamo's
 * `LeftShoulder` is oriented along the arm, so a raise authored as Z rolls the
 * limb instead of lifting it.
 *
 * Every rotation below is therefore applied in **character space**, conjugated
 * through a per-bone basis captured from the rest pose (`boneSpace.ts`). X is
 * forward/back swing, Y twist and Z raise-to-the-side, on every model, which is
 * what makes "swap the GLB, change nothing else" actually hold.
 *
 * Each frame every joint is reset to its captured rest orientation first, so
 * poses are additive and never accumulate drift.
 */

import { Quaternion, type Bone } from 'three';
import {
  captureBoneSpace,
  relaxArm,
  setPoseMirror,
  turnJointInCharacterSpace,
} from './boneSpace';
import type { FighterSnapshot } from '@/src/sim';
import { FIXED_SCALE } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import {
  HUMANOID_JOINTS,
  type HumanoidJointName,
  type HumanoidJoints,
} from './humanoidBones';

/** Phase boundaries, matching `combatAnimationProgress`. */
const WINDUP_END = 0.34;
const ACTIVE_END = 0.58;

export interface RestPose {
  readonly rotations: ReadonlyMap<Bone, Quaternion>;
  readonly hipsHeight: number;
}

export function captureRestPose(joints: HumanoidJoints): RestPose {
  // Normalise before capturing, never after: the pose tables are additive, so
  // a rig delivered in a T-pose would otherwise keep its arms out through every
  // move in the game.
  relaxArm(joints.upperArmL, joints.forearmL);
  relaxArm(joints.upperArmR, joints.forearmR);

  const rotations = new Map<Bone, Quaternion>();
  for (const name of HUMANOID_JOINTS) {
    const bone = joints[name];
    if (bone === null) continue;
    captureBoneSpace(bone);
    rotations.set(bone, bone.quaternion.clone());
  }
  return { rotations, hipsHeight: joints.hips?.position.y ?? 0 };
}

function reset(joints: HumanoidJoints, rest: RestPose): void {
  for (const name of HUMANOID_JOINTS) {
    const bone = joints[name];
    if (bone === null) continue;
    const restRotation = rest.rotations.get(bone);
    if (restRotation === undefined) continue;
    bone.quaternion.copy(restRotation);
  }
}

/** Additive rotation in character space. See the module note. */
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

/**
 * Drive one fighter for one rendered frame.
 *
 * `time` is wall-clock seconds and is used only for the idle texture; every
 * pose that matters to gameplay is a pure function of the simulation state.
 */
export function applyFighterPose(
  joints: HumanoidJoints,
  rest: RestPose,
  fighter: FighterSnapshot,
  time: number,
  /** Per-character choreographed overrides; falls through when absent. */
  choreography?: Readonly<Record<string, AttackPose>>,
): void {
  // Every pose below is authored for a fighter facing right. Facing left is the
  // same pose mirrored, which keeps both characters turned toward the camera.
  setPoseMirror(fighter.facing === -1);
  reset(joints, rest);
  lift(joints, rest, 0);
  poseByState(joints, rest, fighter, time, choreography);
  setPoseMirror(false);
}

function poseByState(
  joints: HumanoidJoints,
  rest: RestPose,
  fighter: FighterSnapshot,
  time: number,
  choreography?: Readonly<Record<string, AttackPose>>,
): void {
  if (!fighter.grounded) {
    poseAirborne(joints, rest, fighter);
    return;
  }

  if (fighter.action !== null) {
    const progress = combatAnimationProgress(
      fighter.action.moveId,
      fighter.action.frame,
    );
    poseAttack(
      joints,
      rest,
      fighter.action.moveId,
      progress,
      fighter.facing,
      choreography,
    );
    return;
  }

  if (fighter.hitstun > 0) {
    poseHitstun(joints, rest, fighter);
    return;
  }

  if (fighter.guarding) {
    poseGuard(joints, time);
    return;
  }

  poseLocomotion(joints, rest, fighter, time);
}

/* ------------------------------------------------------------------ */
/* Neutral                                                             */
/* ------------------------------------------------------------------ */

/**
 * Idle is stepped in feel rather than smooth: the breath curve is shallow and
 * slow, and the arms carry a slight counter-phase so the character never looks
 * like a single sine wave (VIS-CCU-800 §8.2).
 */
function poseLocomotion(
  joints: HumanoidJoints,
  rest: RestPose,
  fighter: FighterSnapshot,
  time: number,
): void {
  const speed = Math.abs(fighter.velocity.x) / FIXED_SCALE;
  const moving = Math.min(1, speed / 0.58);
  const breath = Math.sin(time * 2.2);

  // Fighting stance: side-on, knees bent, guard hand forward. This is the
  // read the whole match is spent looking at, so it gets the most attention.
  turn(joints, 'hips', 0.06, 0.34, 0);
  turn(joints, 'spine', -0.04 + breath * 0.012, -0.12, 0);
  turn(joints, 'chest', 0.02 + breath * 0.016, -0.1, 0);
  turn(joints, 'neck', 0.02 + breath * 0.004, -0.12, 0);
  turn(joints, 'head', -0.04 - breath * 0.008, -0.1, 0);

  // Lead arm high and forward, rear arm tucked at the ribs.
  turn(joints, 'shoulderL', 0, 0, -0.12);
  turn(joints, 'upperArmL', -0.62, 0.18, 0.32 + breath * 0.02);
  turn(joints, 'forearmL', -1.15, 0, 0);
  turn(joints, 'handL', 0, 0, -0.2);

  turn(joints, 'shoulderR', 0, 0, 0.1);
  turn(joints, 'upperArmR', -0.34, -0.14, -0.46 + breath * 0.02);
  turn(joints, 'forearmR', -1.42, 0, 0);
  turn(joints, 'handR', 0, 0, 0.2);

  // Stance legs, widened and bent.
  turn(joints, 'thighL', -0.2, 0.1, 0.12);
  turn(joints, 'shinL', 0.34, 0, 0);
  turn(joints, 'footL', -0.14, 0, 0);

  turn(joints, 'thighR', 0.16, -0.12, -0.14);
  turn(joints, 'shinR', 0.3, 0, 0);
  turn(joints, 'footR', -0.12, 0, 0);
  lift(joints, rest, -0.045 + breath * 0.008);

  if (moving < 0.02) return;

  // Walk: legs counter-swing, torso counter-rotates against the hips. A step
  // cycle that does not counter-rotate the shoulders reads as a shuffle.
  const travelDirection = fighter.velocity.x * fighter.facing >= 0 ? 1 : -1;
  const cycle = time * 8.2 * travelDirection;
  const swing = Math.sin(cycle) * moving;
  const step = Math.cos(cycle) * moving;
  const lead = travelDirection;

  turn(joints, 'thighL', swing * 0.52 * lead, 0, 0);
  turn(joints, 'shinL', Math.max(0, -swing * lead) * 0.6, 0, 0);
  turn(joints, 'thighR', -swing * 0.52 * lead, 0, 0);
  turn(joints, 'shinR', Math.max(0, swing * lead) * 0.6, 0, 0);

  turn(joints, 'hips', 0, 0, swing * 0.05);
  turn(joints, 'chest', 0, -swing * 0.12 * lead, 0);
  // The gaze settles a fraction after the shoulders. This counter-motion keeps
  // the opponent framed while still letting the head share the step rhythm.
  turn(joints, 'neck', step * 0.012, swing * 0.04 * lead, 0);
  turn(joints, 'head', -step * 0.024, swing * 0.07 * lead, -swing * 0.018);
  turn(joints, 'upperArmL', -swing * 0.18 * lead, 0, 0);
  turn(joints, 'upperArmR', swing * 0.18 * lead, 0, 0);
  const stepRise = (1 - Math.cos(cycle * 2)) * 0.5 * moving;
  lift(joints, rest, -0.045 + stepRise * 0.04);
}

function poseGuard(joints: HumanoidJoints, time: number): void {
  const shake = Math.sin(time * 26) * 0.012;

  // Both arms in tight, shoulders raised, chin down, weight back. Guard has to
  // read as a distinct silhouette from idle at a glance — that is a gameplay
  // requirement, not a style one.
  turn(joints, 'hips', 0.1, 0.42, 0);
  turn(joints, 'spine', 0.14, -0.16, 0);
  turn(joints, 'chest', 0.12, -0.12, 0);
  turn(joints, 'neck', 0.16, 0, 0);
  turn(joints, 'head', 0.1, -0.08, 0);

  turn(joints, 'shoulderL', 0, 0, -0.3);
  turn(joints, 'upperArmL', -1.28 + shake, 0.3, 0.44);
  turn(joints, 'forearmL', -1.72, 0, 0);
  turn(joints, 'shoulderR', 0, 0, 0.28);
  turn(joints, 'upperArmR', -1.2 + shake, -0.26, -0.5);
  turn(joints, 'forearmR', -1.8, 0, 0);

  turn(joints, 'thighL', -0.3, 0.1, 0.14);
  turn(joints, 'shinL', 0.5, 0, 0);
  turn(joints, 'thighR', 0.2, -0.12, -0.16);
  turn(joints, 'shinR', 0.46, 0, 0);
}

function poseHitstun(
  joints: HumanoidJoints,
  rest: RestPose,
  fighter: FighterSnapshot,
): void {
  // Decays over the stun so recovery is visible rather than a snap back.
  const force = Math.min(1, fighter.hitstun / 14);

  turn(joints, 'hips', -0.16 * force, 0.3, 0);
  turn(joints, 'spine', -0.34 * force, -0.1, 0);
  turn(joints, 'chest', -0.3 * force, 0, 0);
  turn(joints, 'neck', -0.36 * force, 0, 0);
  turn(joints, 'head', -0.42 * force, 0.1 * force, 0);

  // Arms go slack and trail the torso — the single clearest signal that the
  // character is not in control.
  turn(joints, 'shoulderL', 0, 0, -0.2 * force);
  turn(joints, 'upperArmL', 0.5 * force, 0.2, 0.6 * force);
  turn(joints, 'forearmL', -0.5, 0, 0);
  turn(joints, 'shoulderR', 0, 0, 0.2 * force);
  turn(joints, 'upperArmR', 0.44 * force, -0.2, -0.64 * force);
  turn(joints, 'forearmR', -0.44, 0, 0);

  turn(joints, 'thighL', 0.22 * force, 0, 0.1);
  turn(joints, 'shinL', 0.3, 0, 0);
  turn(joints, 'thighR', -0.1 * force, 0, -0.12);
  turn(joints, 'shinR', 0.42, 0, 0);

  lift(joints, rest, -0.05 * force);
}

function poseAirborne(
  joints: HumanoidJoints,
  rest: RestPose,
  fighter: FighterSnapshot,
): void {
  const rising = fighter.velocity.y > 0;
  const tuck = rising ? 1 : 0.45;

  turn(joints, 'hips', 0.12 * tuck, 0.3, 0);
  turn(joints, 'spine', 0.2 * tuck, -0.1, 0);
  turn(joints, 'chest', 0.14 * tuck, 0, 0);
  turn(joints, 'neck', rising ? -0.1 : 0.08, -0.08, 0);
  turn(joints, 'head', rising ? -0.16 : 0.12, -0.1, 0);

  turn(joints, 'upperArmL', -0.9, 0.24, 0.5);
  turn(joints, 'forearmL', -1.3, 0, 0);
  turn(joints, 'upperArmR', -0.7, -0.22, -0.56);
  turn(joints, 'forearmR', -1.1, 0, 0);

  // Knees up on the rise, legs reaching down on the fall. Reading the arc off
  // the pose is what lets a player time an anti-air.
  turn(joints, 'thighL', -1.1 * tuck, 0.08, 0.14);
  turn(joints, 'shinL', 1.5 * tuck, 0, 0);
  turn(joints, 'thighR', -0.7 * tuck, -0.08, -0.16);
  turn(joints, 'shinR', 1.1 * tuck, 0, 0);

  lift(joints, rest, rising ? -0.04 : 0.02);
}

/* ------------------------------------------------------------------ */
/* Attacks                                                             */
/* ------------------------------------------------------------------ */

type AttackPose = (
  joints: HumanoidJoints,
  rest: RestPose,
  windup: number,
  strike: number,
  settle: number,
) => void;

/**
 * Splits `combatAnimationProgress` into the three beats the pose functions
 * want, each normalised to 0..1:
 *
 *   windup  compression before the extreme
 *   strike  the extreme itself — this is the frame that sells the hit
 *   settle  overshoot and recovery
 */
function beats(progress: number): [number, number, number] {
  const windup = Math.min(1, progress / WINDUP_END);
  const strike = progress < WINDUP_END
    ? 0
    : Math.min(1, (progress - WINDUP_END) / (ACTIVE_END - WINDUP_END));
  const settle = progress < ACTIVE_END
    ? 0
    : Math.min(1, (progress - ACTIVE_END) / (1 - ACTIVE_END));
  return [windup, strike, settle];
}

function recoveredStrike(strike: number, settle: number): number {
  const eased = settle * settle * (3 - 2 * settle);
  return strike * (1 - eased);
}

function recoveryArc(strike: number, settle: number): number {
  return strike * Math.sin(settle * Math.PI);
}

function poseAttack(
  joints: HumanoidJoints,
  rest: RestPose,
  moveId: string,
  progress: number,
  facing: -1 | 1,
  choreography?: Readonly<Record<string, AttackPose>>,
): void {
  // Character choreography wins over the shared pose table. Move ids are
  // roster-wide, so the scoping has to happen here.
  const pose =
    choreography?.[moveId]
    ?? ATTACKS[moveId]
    ?? straightPunch;
  const [windup, strike, settle] = beats(progress);
  pose(joints, rest, windup, strike, settle);
  void facing;
}

/**
 * The extreme is over-extended and the recovery pulls back past neutral. An
 * attack that returns directly to neutral reads as an animation stopping
 * rather than a body recovering (VIS-CCU-800 §8.3).
 */
function straightPunch(
  joints: HumanoidJoints,
  rest: RestPose,
  windup: number,
  strike: number,
  settle: number,
): void {
  const coil = windup * (1 - strike);
  const reach = recoveredStrike(strike, settle);
  const rebound = recoveryArc(strike, settle);
  const back = rebound * 0.3;

  // Sheet silhouette (`LP` on every character sheet): lead arm horizontal and
  // fully out, rear elbow pinned back at the ribs, front knee deep, rear leg
  // long behind, torso pitched forward over the front foot.
  turn(joints, 'hips', 0.06 * reach, 0.42 - reach * 0.62 + coil * 0.2, 0);
  turn(joints, 'spine', 0.08 * coil - 0.16 * reach, -0.18 + reach * -0.4, 0);
  turn(joints, 'chest', 0.04 - 0.1 * reach, -0.14 - reach * 0.5 + coil * 0.24, 0);
  turn(
    joints,
    'neck',
    0.06 * reach,
    -0.08 - coil * 0.05 - reach * 0.14 + rebound * 0.04,
    0,
  );
  turn(
    joints,
    'head',
    -reach * 0.025,
    -0.1 - coil * 0.1 - reach * 0.22 + rebound * 0.06,
    0,
  );

  // Lead arm fires, rear arm retracts to the ribs as counterweight.
  turn(joints, 'shoulderL', 0, -reach * 0.42, -0.12 - reach * 0.14);
  turn(joints, 'upperArmL', -1.62 - coil * 0.24 + reach * 0.06, 0.18, 0.3);
  turn(joints, 'forearmL', -1.5 + coil * 0.4 + reach * 1.62 - back * 0.3, 0, 0);
  turn(joints, 'handL', 0, 0, -0.18);

  turn(joints, 'upperArmR', -0.24 - reach * 0.5, -0.14, -0.52);
  turn(joints, 'forearmR', -1.62 - reach * 0.55, 0, 0);

  turn(joints, 'thighL', -0.44 - reach * 0.3, 0.1, 0.16);
  turn(joints, 'shinL', 0.58, 0, 0);
  turn(joints, 'thighR', 0.32 + reach * 0.42, -0.12, -0.18);
  turn(joints, 'shinR', 0.2, 0, 0);

  lift(joints, rest, -0.06 - reach * 0.05);
}

function heavyPunch(
  joints: HumanoidJoints,
  rest: RestPose,
  windup: number,
  strike: number,
  settle: number,
): void {
  const coil = windup * (1 - strike);
  const reach = recoveredStrike(strike, settle);
  const rebound = recoveryArc(strike, settle);

  // Sheet silhouette (`HP`): the whole body turns over, the striking arm sweeps
  // a wide arc well outside the body outline, and the stance opens into a deep
  // lunge. A heavy reads as the torso rotating, never as a longer arm.
  turn(joints, 'hips', 0, 0.5 + coil * 0.62 - reach * 1.38, 0);
  turn(joints, 'spine', 0.1 * coil - 0.12 * reach, -0.16 + coil * 0.4 - reach * 0.84, 0);
  turn(joints, 'chest', 0.06 - 0.1 * reach, -0.12 + coil * 0.48 - reach * 1.02, 0);
  turn(
    joints,
    'neck',
    0.04,
    -coil * 0.08 - reach * 0.24 + rebound * 0.06,
    0,
  );
  turn(
    joints,
    'head',
    -0.04 - reach * 0.04,
    -0.1 - coil * 0.16 - reach * 0.34 + rebound * 0.09,
    0,
  );

  turn(joints, 'shoulderR', 0, -reach * 0.5, 0.1 - reach * 0.34);
  turn(joints, 'upperArmR', -1.58 - coil * 0.42 + reach * 0.12, -0.16, -0.34 - reach * 0.3);
  turn(joints, 'forearmR', -1.82 + coil * 0.24 + reach * 1.92, 0, 0);
  turn(joints, 'handR', 0, 0, 0.2);

  turn(joints, 'upperArmL', -0.44 - reach * 0.46, 0.2, 0.6 + reach * 0.34);
  turn(joints, 'forearmL', -1.34 - reach * 0.6, 0, 0);

  turn(joints, 'thighL', -0.52 - reach * 0.34, 0.1, 0.18);
  turn(joints, 'shinL', 0.66, 0, 0);
  turn(joints, 'thighR', 0.36 + reach * 0.5, -0.12, -0.2);
  turn(joints, 'shinR', 0.24, 0, 0);

  lift(joints, rest, -0.1 - reach * 0.09);
}

function roundKick(
  joints: HumanoidJoints,
  rest: RestPose,
  windup: number,
  strike: number,
  settle: number,
): void {
  const coil = windup * (1 - strike);
  const reach = recoveredStrike(strike, settle);
  const rebound = recoveryArc(strike, settle);

  turn(joints, 'hips', -0.1 * reach, 0.44 + coil * 0.3 - reach * 0.88, 0.14 * reach);
  turn(joints, 'spine', 0.14 * reach, -0.16 - reach * 0.3, -0.16 * reach);
  turn(joints, 'chest', 0.1 * reach, -0.12 - reach * 0.28, -0.12 * reach);
  turn(
    joints,
    'neck',
    -0.04 * coil,
    -0.08 - coil * 0.1 - reach * 0.16 + rebound * 0.06,
    0.04 * reach,
  );
  turn(
    joints,
    'head',
    -0.08 * coil,
    -0.1 - coil * 0.16 - reach * 0.24 + rebound * 0.1,
    0.08 * reach,
  );

  // Arms swing opposite the kicking leg or the pose has no balance.
  turn(joints, 'upperArmL', -0.5 + reach * 0.62, 0.3, 0.78 + reach * 0.66);
  turn(joints, 'forearmL', -1.2, 0, 0);
  turn(joints, 'upperArmR', -0.4 - reach * 0.86, -0.3, -0.66 - reach * 0.52);
  turn(joints, 'forearmR', -1.3, 0, 0);

  // Sheet silhouette (`HK`): the foot finishes at head height with the torso
  // counter-leaning away from it. Chambered knee first, then the shin whips
  // out — kicking from a straight leg is the classic tell of procedural
  // animation, and the sheets never draw one.
  turn(joints, 'thighR', -0.5 - coil * 0.86 - reach * 1.5, -0.2 - reach * 0.6, -0.24 - reach * 0.78);
  turn(joints, 'shinR', 1.62 * (coil + 0.3) - reach * 2.05, 0, 0);
  turn(joints, 'footR', -0.24 - reach * 0.28, 0, 0);

  turn(joints, 'thighL', -0.16 + reach * 0.16, 0.12, 0.16);
  turn(joints, 'shinL', 0.34 - reach * 0.18, 0, 0);

  lift(joints, rest, -0.05 * reach);
}

function lowStrike(
  joints: HumanoidJoints,
  rest: RestPose,
  windup: number,
  strike: number,
  settle: number,
): void {
  const coil = windup * (1 - strike);
  const reach = recoveredStrike(strike, settle);
  const rebound = recoveryArc(strike, settle);
  const crouch = Math.max(coil * 0.6, reach);

  turn(joints, 'hips', 0.4 * crouch, 0.4, 0);
  turn(joints, 'spine', 0.2 * crouch, -0.14, 0);
  turn(joints, 'chest', 0.1 * crouch, -0.12, 0);
  turn(joints, 'neck', -0.12 * crouch, -0.08 - reach * 0.06, 0);
  turn(
    joints,
    'head',
    -0.24 * crouch + rebound * 0.05,
    -0.1 - reach * 0.1 + rebound * 0.04,
    0,
  );

  turn(joints, 'upperArmL', -1.0 - reach * 0.5, 0.2, 0.3);
  turn(joints, 'forearmL', -1.3 + reach * 1.1, 0, 0);
  turn(joints, 'upperArmR', -0.5, -0.2, -0.5);
  turn(joints, 'forearmR', -1.5, 0, 0);

  turn(joints, 'thighL', -0.9 * crouch, 0.12, 0.2);
  turn(joints, 'shinL', 1.5 * crouch, 0, 0);
  turn(joints, 'footL', -0.4 * crouch, 0, 0);
  turn(joints, 'thighR', -0.6 * crouch + reach * 0.3, -0.14, -0.22);
  turn(joints, 'shinR', 1.2 * crouch, 0, 0);

  lift(joints, rest, -0.34 * crouch);
}

function sweep(
  joints: HumanoidJoints,
  rest: RestPose,
  windup: number,
  strike: number,
  settle: number,
): void {
  const coil = windup * (1 - strike);
  const reach = recoveredStrike(strike, settle);
  const rebound = recoveryArc(strike, settle);
  const crouch = Math.max(coil * 0.7, reach * 0.85);

  // Sheet silhouette (`LK`): the body drops almost to the floor, the support
  // hand is planted flat on the ground and the sweeping leg runs out along it,
  // nearly straight. The height drop is what sells it — a sweep played from a
  // standing crouch reads as a low kick.
  turn(joints, 'hips', 0.72 * crouch, 0.42 - reach * 0.46, 0);
  turn(joints, 'spine', 0.34 * crouch, -0.16, -0.18 * reach);
  turn(joints, 'chest', 0.14, -0.12, -0.14 * reach);
  turn(joints, 'neck', -0.2 * crouch, -0.08 - reach * 0.1, 0.03 * reach);
  turn(
    joints,
    'head',
    -0.38 * crouch + rebound * 0.06,
    -0.1 - coil * 0.08 - reach * 0.18 + rebound * 0.08,
    0.06 * reach,
  );

  // The supporting hand goes to the floor. It is the pose element that makes a
  // sweep read as a sweep rather than a low kick.
  turn(joints, 'upperArmL', 1.05 + reach * 0.62, 0.4, 1.05);
  turn(joints, 'forearmL', -0.34, 0, 0);
  turn(joints, 'upperArmR', -0.4 - reach * 0.66, -0.3, -0.78);
  turn(joints, 'forearmR', -1.2, 0, 0);

  turn(joints, 'thighL', -1.34 * crouch, 0.14, 0.28);
  turn(joints, 'shinL', 2.05 * crouch, 0, 0);
  turn(joints, 'thighR', -0.24 - reach * 0.44, -0.3 - reach * 1.15, -0.3 - reach * 0.62);
  turn(joints, 'shinR', 1.4 * (1 - reach * 0.94), 0, 0);

  lift(joints, rest, -0.62 * crouch);
}

function overtake(
  joints: HumanoidJoints,
  rest: RestPose,
  windup: number,
  strike: number,
  settle: number,
): void {
  const coil = windup * (1 - strike);
  const reach = recoveredStrike(strike, settle);
  const rebound = recoveryArc(strike, settle);

  // The signature. Full body commitment: deep coil, then a rotation the
  // character cannot recover from quickly, which is what earns the frame data.
  turn(joints, 'hips', -0.2 * reach, 0.5 + coil * 0.9 - reach * 1.8, 0.2 * reach);
  turn(joints, 'spine', 0.1 - reach * 0.2, -0.16 + coil * 0.5 - reach * 0.9, -0.2 * reach);
  turn(joints, 'chest', 0.08, -0.12 + coil * 0.5 - reach * 1.0, -0.16 * reach);
  turn(
    joints,
    'neck',
    0.06,
    -coil * 0.12 - reach * 0.3 + rebound * 0.08,
    0,
  );
  turn(
    joints,
    'head',
    -0.1 * reach,
    -0.1 - coil * 0.2 - reach * 0.4 + rebound * 0.12,
    0,
  );

  turn(joints, 'shoulderR', 0, -reach * 0.5, 0.1 - reach * 0.5);
  turn(joints, 'upperArmR', -1.9 - coil * 0.5 + reach * 0.4, -0.2, -0.3 - reach * 0.3);
  turn(joints, 'forearmR', -1.5 + coil * 0.3 + reach * 1.5, 0, 0);

  turn(joints, 'upperArmL', -0.6 - reach * 0.6, 0.3, 0.6 + reach * 0.4);
  turn(joints, 'forearmL', -1.4, 0, 0);

  turn(joints, 'thighL', -0.4 - reach * 0.3, 0.14, 0.2);
  turn(joints, 'shinL', 0.6 + reach * 0.3, 0, 0);
  turn(joints, 'thighR', 0.3 + reach * 0.5, -0.14, -0.22);
  turn(joints, 'shinR', 0.4, 0, 0);

  lift(joints, rest, -0.12 * coil - 0.06 * reach);
}

/**
 * Move id → pose. Adding a move means adding a row, never an `if` (rule R6).
 * Unmapped ids fall through to `straightPunch` so a new move is always visible
 * rather than silently frozen in idle.
 */
const ATTACKS: Readonly<Record<string, AttackPose>> = {
  '5L': straightPunch,
  '5M': roundKick,
  '5H': heavyPunch,
  '2L': lowStrike,
  '2M': sweep,
  overtake,
};
