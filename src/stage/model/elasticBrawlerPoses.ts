import {
  clamp01,
  liftHips,
  smooth01,
  turnJoint,
  type RosterAttackPose,
} from './rosterPoseTools';

const pistol: RosterAttackPose = (
  joints,
  rest,
  windup,
  strike,
  settle,
) => {
  const compress = windup * (1 - strike);
  const stretch = strike * (1 - settle * 0.82);
  const snap = Math.sin(clamp01(settle / 0.32) * Math.PI);

  turnJoint(joints, 'hips', 0.08, 0.42 + compress * 0.3 - stretch * 0.52, 0);
  turnJoint(joints, 'spine', 0.08 * compress, -0.14 - stretch * 0.36, 0);
  turnJoint(joints, 'chest', 0.05, -0.12 + compress * 0.28 - stretch * 0.48, 0);
  turnJoint(joints, 'head', 0, -0.08 - stretch * 0.16, 0);

  // The shoulder compresses first; the elbow and wrist then resolve into one
  // long, straight impact line before snapping slightly past neutral.
  turnJoint(joints, 'shoulderL', 0, -stretch * 0.42, -0.14);
  turnJoint(joints, 'upperArmL', -1.34 - compress * 0.3 - stretch * 0.2 + snap * 0.14, 0.2, 0.32);
  turnJoint(joints, 'forearmL', -1.62 + compress * 0.5 + stretch * 1.55 - snap * 0.24, 0, 0);
  turnJoint(joints, 'handL', 0, 0, -0.16 - stretch * 0.2);
  turnJoint(joints, 'upperArmR', -0.34 - stretch * 0.28, -0.18, -0.54);
  turnJoint(joints, 'forearmR', -1.5 - stretch * 0.36, 0, 0);

  turnJoint(joints, 'thighL', -0.24 - stretch * 0.18, 0.1, 0.14);
  turnJoint(joints, 'shinL', 0.38, 0, 0);
  turnJoint(joints, 'thighR', 0.2 + stretch * 0.28, -0.12, -0.16);
  turnJoint(joints, 'shinR', 0.32, 0, 0);
  liftHips(joints, rest, -0.025 * stretch);
};

const axe: RosterAttackPose = (
  joints,
  rest,
  windup,
  strike,
  settle,
) => {
  const chamber = windup * (1 - strike);
  const drop = strike * (1 - settle * 0.72);
  const landing = Math.sin(clamp01(settle / 0.45) * Math.PI);

  turnJoint(joints, 'hips', -0.18 * chamber + 0.28 * drop, 0.42, -0.1 * drop);
  turnJoint(joints, 'spine', -0.24 * chamber + 0.38 * drop, -0.14, 0.12 * drop);
  turnJoint(joints, 'chest', -0.2 * chamber + 0.26 * drop, -0.1, 0.1 * drop);

  turnJoint(joints, 'upperArmL', -0.4 + chamber * 0.7, 0.28, 0.72);
  turnJoint(joints, 'forearmL', -1.12, 0, 0);
  turnJoint(joints, 'upperArmR', -0.42 - chamber * 0.72, -0.26, -0.68);
  turnJoint(joints, 'forearmR', -1.18, 0, 0);

  // Heel rises above the head, extends through the active frames, then lands
  // with a small overshoot that gives the elastic material its weight.
  turnJoint(joints, 'thighR', -0.5 - chamber * 1.45 - drop * 1.2, -0.24, -0.22);
  turnJoint(joints, 'shinR', 1.62 * chamber - 0.34 * drop + landing * 0.18, 0, 0);
  turnJoint(joints, 'footR', -0.34 - drop * 0.32, 0, 0);
  turnJoint(joints, 'thighL', -0.2, 0.14, 0.18);
  turnJoint(joints, 'shinL', 0.42 + landing * 0.3, 0, 0);
  liftHips(joints, rest, 0.08 * chamber - 0.22 * landing);
};

const gearShift: RosterAttackPose = (
  joints,
  rest,
  windup,
  strike,
  settle,
) => {
  const compress = windup * (1 - strike);
  const aftershock = Math.sin(clamp01(settle / 0.55) * Math.PI);
  const surge = Math.max(strike * (1 - settle * 0.6), aftershock);
  const brace = smooth01(settle);

  turnJoint(joints, 'hips', 0.5 * compress - 0.08 * surge, 0.3, 0);
  turnJoint(joints, 'spine', 0.44 * compress - 0.22 * surge, 0, 0);
  turnJoint(joints, 'chest', 0.3 * compress - 0.34 * surge, 0, 0);
  turnJoint(joints, 'head', -0.28 * compress + 0.22 * surge, 0, 0);

  turnJoint(joints, 'upperArmL', -0.5 + surge * 0.22, 0.2, 0.42 + surge * 0.72);
  turnJoint(joints, 'forearmL', -1.38 + surge * 0.34, 0, 0);
  turnJoint(joints, 'upperArmR', -0.5 + surge * 0.22, -0.2, -0.42 - surge * 0.72);
  turnJoint(joints, 'forearmR', -1.38 + surge * 0.34, 0, 0);

  turnJoint(joints, 'thighL', -0.74 * compress - 0.12 * brace, 0.16, 0.18 + brace * 0.12);
  turnJoint(joints, 'shinL', 1.18 * compress + brace * 0.34, 0, 0);
  turnJoint(joints, 'thighR', -0.74 * compress - 0.12 * brace, -0.16, -0.18 - brace * 0.12);
  turnJoint(joints, 'shinR', 1.18 * compress + brace * 0.34, 0, 0);
  liftHips(joints, rest, -0.32 * compress + 0.05 * surge);
};

export const ELASTIC_BRAWLER_POSES: Readonly<
  Record<string, RosterAttackPose>
> = {
  'eb.pistol': pistol,
  'eb.axe': axe,
  'eb.gear': gearShift,
};
