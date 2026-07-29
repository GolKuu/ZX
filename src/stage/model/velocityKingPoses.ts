import {
  clamp01,
  liftHips,
  smooth01,
  turnJoint,
  type RosterAttackPose,
} from './rosterPoseTools';

const projection: RosterAttackPose = (
  joints,
  rest,
  windup,
  strike,
  settle,
) => {
  const load = windup * (1 - strike);
  const dash = strike * (1 - smooth01(settle));
  const followThrough = strike * Math.sin(clamp01(settle) * Math.PI);
  const arrive = smooth01(settle);

  turnJoint(joints, 'hips', 0.34 * load - 0.18 * dash, 0.34, 0);
  turnJoint(joints, 'spine', 0.42 * load - 0.5 * dash, -0.12, 0);
  turnJoint(joints, 'chest', 0.28 * load - 0.42 * dash, -0.1, 0);
  turnJoint(
    joints,
    'neck',
    -0.12 * load + 0.1 * dash,
    -0.08 - dash * 0.1,
    0,
  );
  turnJoint(
    joints,
    'head',
    -0.2 * load + 0.18 * dash - followThrough * 0.05,
    -0.1 - load * 0.08 - dash * 0.18 + followThrough * 0.08,
    0,
  );

  // The lead palm arrives first while the rear arm trails through the dash.
  turnJoint(joints, 'upperArmL', -0.7 - dash * 0.86, 0.24, 0.34);
  turnJoint(joints, 'forearmL', -1.35 + dash * 1.2, 0, 0);
  turnJoint(joints, 'handL', 0, -dash * 0.3, -0.2);
  turnJoint(joints, 'upperArmR', 0.16 + dash * 0.78, -0.2, -0.62);
  turnJoint(joints, 'forearmR', -0.72 - dash * 0.35, 0, 0);

  turnJoint(joints, 'thighL', -0.72 * load - 0.34 * dash, 0.12, 0.14);
  turnJoint(joints, 'shinL', 1.05 * load + 0.34 * dash, 0, 0);
  turnJoint(joints, 'thighR', -0.55 * load + 0.56 * dash, -0.12, -0.16);
  turnJoint(joints, 'shinR', 0.9 * load + arrive * 0.24, 0, 0);
  liftHips(joints, rest, -0.24 * load + 0.04 * dash);
};

const commandThrow: RosterAttackPose = (
  joints,
  rest,
  windup,
  strike,
  settle,
) => {
  const lunge = windup * (1 - strike);
  const seize = strike * (1 - smooth01((settle - 0.35) / 0.65));
  const slam = Math.sin(clamp01(settle / 0.52) * Math.PI);
  const swagger = smooth01((settle - 0.48) / 0.52);

  turnJoint(joints, 'hips', 0.34 * lunge + 0.22 * slam, 0.4, 0);
  turnJoint(joints, 'spine', 0.3 * lunge + 0.48 * slam, -0.14, 0);
  turnJoint(joints, 'chest', 0.16 * lunge + 0.62 * slam, -0.1, 0);
  turnJoint(
    joints,
    'neck',
    -0.08 * lunge + 0.18 * slam,
    -0.08 - seize * 0.08,
    0,
  );
  turnJoint(
    joints,
    'head',
    -0.16 * lunge + 0.3 * slam - 0.12 * swagger,
    -0.1 - lunge * 0.1 - seize * 0.14 + swagger * 0.08,
    0,
  );

  // Open-hand lunge, two-handed collar control, then a downward slam.
  turnJoint(joints, 'upperArmL', -0.78 - seize * 0.75 + slam * 0.42, 0.28, 0.28);
  turnJoint(joints, 'forearmL', -1.25 + seize * 1.08 - slam * 0.4, 0, 0);
  turnJoint(joints, 'handL', 0, -seize * 0.45, -0.2);
  turnJoint(joints, 'upperArmR', -0.42 - seize * 0.82 + slam * 0.38, -0.24, -0.5);
  turnJoint(joints, 'forearmR', -1.42 + seize * 1.2 - slam * 0.45, 0, 0);

  turnJoint(joints, 'thighL', -0.64 * lunge - 0.34 * slam, 0.12, 0.16);
  turnJoint(joints, 'shinL', 0.9 * lunge + 0.58 * slam, 0, 0);
  turnJoint(joints, 'thighR', 0.34 * seize - 0.24 * slam, -0.14, -0.18);
  turnJoint(joints, 'shinR', 0.4 + 0.42 * slam, 0, 0);
  liftHips(joints, rest, -0.2 * lunge - 0.3 * slam);
};

export const VELOCITY_KING_POSES: Readonly<
  Record<string, RosterAttackPose>
> = {
  'vk.projection': projection,
  'vk.throw': commandThrow,
};
