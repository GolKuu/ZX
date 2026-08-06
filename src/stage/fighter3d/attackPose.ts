import type { Pose } from './fighterPose';

/**
 * The shapes an attack can take, keyed off the move's id.
 *
 * A fighting game does not need one animation per move; it needs each move to
 * be *legible* — the player has to know from the first three frames whether to
 * block high or low. So the library is small and the shapes are exaggerated,
 * and the frame data decides how long each one takes.
 */
export type AttackShape =
  | 'jab'
  | 'straight'
  | 'hook'
  | 'uppercut'
  | 'lowSweep'
  | 'highKick'
  | 'frontKick'
  | 'spin540'
  | 'slam';

/**
 * Chamber → contact → return, as a single 0…1 value.
 *
 * Every shape below reads this one number. `chamber` peaks during the wind-up
 * and `contact` at the strike, and both return to zero, so an attack always
 * lands back on the neutral stance without a separate settle pass.
 */
function envelope(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const chamber = Math.sin(Math.min(1, p / 0.34) * Math.PI * 0.5) * (1 - p);
  const contact = p < 0.34
    ? 0
    : Math.sin(((p - 0.34) / 0.66) * Math.PI);
  return { p, chamber, contact };
}

export function applyAttackPose(
  pose: Pose,
  shape: AttackShape,
  progress: number,
): void {
  const { p, chamber, contact } = envelope(progress);

  if (shape === 'spin540') {
    applySpin(pose, p, contact);
    return;
  }

  // Every strike drives off the back foot and turns the hips into the blow.
  pose.torsoPitch += chamber * 0.18 - contact * 0.14;
  pose.rootYaw += chamber * 0.22 - contact * 0.34;

  if (shape === 'jab' || shape === 'straight') {
    const reach = shape === 'jab' ? 1 : 1.25;
    pose.rightArm.pitch = -1.5 - chamber * 0.5 + contact * 0.35;
    pose.rightArm.hinge = -2.1 * chamber - 0.12 * (1 - contact) + contact * 0.05;
    pose.rightArm.pitch -= contact * 1.15 * reach;
    pose.torsoRoll -= contact * 0.16;
    return;
  }
  if (shape === 'hook') {
    pose.rightArm.spread = 0.3 + chamber * 0.9 + contact * 0.5;
    pose.rightArm.pitch = -1.6 - chamber * 0.3 - contact * 0.4;
    pose.rightArm.hinge = -1.6;
    pose.torsoRoll -= contact * 0.34;
    return;
  }
  if (shape === 'uppercut') {
    pose.hipsY -= chamber * 0.24;
    pose.rootY += contact * 0.42;
    pose.rightArm.pitch = -0.6 + chamber * 0.8 - contact * 2.6;
    pose.rightArm.hinge = -1.9 + contact * 1.3;
    pose.torsoPitch -= contact * 0.3;
    return;
  }
  if (shape === 'lowSweep') {
    pose.hipsY -= 0.26 + contact * 0.16;
    pose.torsoPitch += 0.3;
    pose.rightLeg.pitch = 0.3 + chamber * 0.5 - contact * 1.5;
    pose.rightLeg.spread = contact * 1.15;
    pose.rightLeg.hinge = -1.4 * chamber - 0.1;
    pose.leftLeg.hinge = -1.1;
    return;
  }
  if (shape === 'highKick') {
    pose.rootRoll -= contact * 0.24;
    pose.rightLeg.pitch = 0.2 + chamber * 0.7 - contact * 2.5;
    pose.rightLeg.hinge = -2 * chamber + contact * 0.2;
    pose.rightLeg.spread = contact * 0.4;
    pose.torsoPitch -= contact * 0.34;
    pose.leftArm.spread += contact * 0.7;
    return;
  }
  if (shape === 'frontKick') {
    pose.rightLeg.pitch = chamber * 1.1 - contact * 1.7;
    pose.rightLeg.hinge = -2.2 * chamber + contact * 0.15;
    pose.torsoPitch += contact * 0.22;
    return;
  }
  // slam
  pose.rootY += chamber * 0.3 - contact * 0.14;
  pose.leftArm.pitch = -2.4 * chamber + contact * 0.6;
  pose.rightArm.pitch = -2.4 * chamber + contact * 0.6;
  pose.torsoPitch += contact * 0.5 - chamber * 0.4;
}

/**
 * The 540: a hop, a turn and a half, and a heel arriving out of the rotation.
 *
 * The rotation is the animation. It is driven straight off progress rather than
 * off the envelope, because a spin that eases in and out at both ends reads as a
 * pirouette — the body has to keep turning at speed right through the strike and
 * only settle once the foot is down. One and a half turns is 3π; the extra
 * quarter at the end lands the fighter square to the opponent again.
 */
function applySpin(pose: Pose, p: number, contact: number): void {
  // Ease out of the turn only in the last fifth, so the hit lands mid-rotation.
  const turn = p < 0.8 ? p / 0.8 : 1;
  const eased = turn * turn * (3 - 2 * turn);
  pose.rootYaw += eased * Math.PI * 3;

  // The hop. Peaks under the strike and is back on the floor for recovery.
  const hop = Math.sin(Math.min(1, p / 0.75) * Math.PI);
  pose.rootY += hop * 0.5;
  pose.hipsY += hop * 0.05;

  // Body tilted into the turn, arms tucked — a spinning body pulls its arms in,
  // and a rig that leaves them out looks like it is falling over.
  pose.rootRoll -= hop * 0.3;
  pose.torsoPitch += 0.12 - contact * 0.2;
  pose.leftArm.pitch = -1.9;
  pose.leftArm.spread = 0.15;
  pose.leftArm.hinge = -2.3;
  pose.rightArm.pitch = -1.7;
  pose.rightArm.spread = 0.2;
  pose.rightArm.hinge = -2.1;

  // Kicking leg extends through the middle of the spin; the other tucks up so
  // the two never read as one shape.
  const extend = Math.sin(Math.min(1, Math.max(0, (p - 0.2) / 0.6)) * Math.PI);
  pose.rightLeg.pitch = 0.2 - extend * 1.85;
  pose.rightLeg.spread = extend * 0.75;
  pose.rightLeg.hinge = -0.15 - (1 - extend) * 1.2;
  pose.leftLeg.pitch = 0.15 + hop * 0.5;
  pose.leftLeg.hinge = -0.3 - hop * 1.5;
}
