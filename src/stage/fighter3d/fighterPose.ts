import type { FighterSnapshot } from '@/src/sim';
import type { FighterJoints } from './FighterSkeleton';

/**
 * Every joint angle the rig will hold this frame.
 *
 * Poses are produced as plain data and applied in one place, rather than each
 * state reaching into the rig and setting rotations directly. That is what lets
 * a walk cycle, an attack and a hit reaction be *blended* — the thing that
 * separates a rig that animates from a rig that snaps between states.
 */
export interface Pose {
  rootY: number;
  rootRoll: number;
  /** Whole-body spin about the vertical. The 540 lives here. */
  rootYaw: number;
  hipsY: number;
  hipsYaw: number;
  hipsRoll: number;
  torsoPitch: number;
  torsoRoll: number;
  torsoYaw: number;
  headPitch: number;
  headYaw: number;
  leftArm: Limb;
  rightArm: Limb;
  leftLeg: Limb;
  rightLeg: Limb;
}

/** Shoulder/hip swing plus the hinge below it. */
export interface Limb {
  pitch: number;
  spread: number;
  hinge: number;
  /** Rotation across the body, essential for hooks and natural punches. */
  yaw: number;
}

function limb(pitch = 0, spread = 0, hinge = 0, yaw = 0): Limb {
  return { pitch, spread, hinge, yaw };
}

/** The fighting stance every other pose is a departure from. */
export function neutralPose(stoop: number): Pose {
  return {
    rootY: 0,
    rootRoll: 0,
    rootYaw: 0,
    hipsY: 0,
    hipsYaw: -0.08,
    hipsRoll: 0,
    torsoPitch: stoop,
    torsoRoll: 0,
    torsoYaw: 0.12,
    headPitch: -stoop * 0.6,
    headYaw: -0.04,
    // Hands up, elbows in: a guard, not a T-pose. The lead arm is carried
    // lower so the two read as different arms from the front.
    leftArm: limb(-0.5, 0.34, -1.05),
    rightArm: limb(-0.85, 0.26, -1.35),
    leftLeg: limb(0.12, 0.12, -0.22),
    rightLeg: limb(-0.14, 0.14, -0.3),
  };
}

export function idleBreath(pose: Pose, time: number): void {
  const breath = Math.sin(time * 2.3);
  pose.rootY += breath * 0.012;
  pose.torsoPitch += breath * 0.02;
  pose.torsoYaw += breath * 0.012;
  pose.headPitch -= breath * 0.015;
  pose.leftArm.pitch += breath * 0.04;
  pose.rightArm.pitch += breath * 0.03;
}

export function walkPose(pose: Pose, time: number, speed: number): void {
  const phase = time * 8.6 * speed;
  const stride = Math.sin(phase);
  const counter = Math.sin(phase + Math.PI);
  pose.rootY += Math.abs(Math.sin(phase)) * 0.035;
  pose.hipsY -= Math.abs(Math.sin(phase)) * 0.02;
  pose.leftLeg.pitch += stride * 0.5;
  pose.leftLeg.hinge -= Math.max(0, -stride) * 0.7;
  pose.rightLeg.pitch += counter * 0.5;
  pose.rightLeg.hinge -= Math.max(0, -counter) * 0.7;
  pose.leftArm.pitch += counter * 0.32;
  pose.rightArm.pitch += stride * 0.32;
  pose.torsoRoll += stride * 0.05;
  pose.hipsYaw += stride * 0.08;
  pose.torsoYaw -= stride * 0.07;
}

export function crouchPose(pose: Pose): void {
  pose.hipsY -= 0.3;
  pose.torsoPitch += 0.34;
  pose.hipsRoll += 0.05;
  pose.leftLeg.pitch += 0.62;
  pose.leftLeg.hinge -= 1.3;
  pose.rightLeg.pitch += 0.62;
  pose.rightLeg.hinge -= 1.3;
  pose.leftArm.pitch -= 0.2;
}

export function guardPose(pose: Pose): void {
  pose.torsoPitch += 0.14;
  pose.torsoRoll += 0.18;
  pose.torsoYaw -= 0.22;
  pose.leftArm.pitch = -1.5;
  pose.leftArm.hinge = -1.9;
  pose.rightArm.pitch = -1.35;
  pose.rightArm.hinge = -2;
  pose.headPitch += 0.12;
}

/** Struck: the body folds away from the blow and the guard breaks open. */
export function hitPose(pose: Pose, intensity: number): void {
  pose.torsoPitch -= 0.5 * intensity;
  pose.torsoRoll -= 0.3 * intensity;
  pose.torsoYaw -= 0.35 * intensity;
  pose.hipsYaw += 0.16 * intensity;
  pose.headPitch -= 0.4 * intensity;
  pose.rootRoll -= 0.16 * intensity;
  pose.leftArm.pitch += 0.9 * intensity;
  pose.leftArm.spread += 0.5 * intensity;
  pose.rightArm.pitch += 0.7 * intensity;
  pose.rightArm.spread += 0.4 * intensity;
  pose.leftLeg.pitch -= 0.3 * intensity;
}

/** On the floor: hips down, body flat, limbs loose. */
export function downPose(pose: Pose, progress: number): void {
  const fold = Math.min(1, progress);
  pose.rootY -= 0.62 * fold;
  pose.rootRoll -= 1.35 * fold;
  pose.torsoPitch -= 0.4 * fold;
  pose.leftArm.spread += 0.9 * fold;
  pose.rightArm.spread += 0.7 * fold;
  pose.leftLeg.pitch += 0.5 * fold;
  pose.rightLeg.pitch += 0.2 * fold;
}

export function applyPose(joints: FighterJoints, pose: Pose): void {
  joints.root.position.y = pose.rootY;
  joints.root.rotation.z = pose.rootRoll;
  joints.root.rotation.y = pose.rootYaw;
  joints.hips.position.y = 0.86 + pose.hipsY;
  joints.hips.rotation.y = pose.hipsYaw;
  joints.hips.rotation.z = pose.hipsRoll;
  joints.torso.rotation.x = pose.torsoPitch;
  joints.torso.rotation.z = pose.torsoRoll;
  joints.torso.rotation.y = pose.torsoYaw;
  joints.head.rotation.x = pose.headPitch;
  joints.head.rotation.y = pose.headYaw;
  setLimb(joints.leftArm, joints.leftForearm, pose.leftArm, -1);
  setLimb(joints.rightArm, joints.rightForearm, pose.rightArm, 1);
  setLimb(joints.leftLeg, joints.leftShin, pose.leftLeg, -1);
  setLimb(joints.rightLeg, joints.rightShin, pose.rightLeg, 1);
}

function setLimb(
  upper: FighterJoints['leftArm'],
  lower: FighterJoints['leftArm'],
  values: Limb,
  side: -1 | 1,
): void {
  upper.rotation.x = values.pitch;
  upper.rotation.z = values.spread * side;
  upper.rotation.y = values.yaw * side;
  lower.rotation.x = values.hinge;
}

/** Frame-rate independent blend toward a target angle. */
export function damp(current: number, target: number, rate: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-rate * delta));
}

export function isKnockedDown(fighter: FighterSnapshot): boolean {
  return fighter.knockdownPhase !== 'none';
}
