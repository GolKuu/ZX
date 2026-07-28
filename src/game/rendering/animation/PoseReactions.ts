import type { AnimationStateId } from './AnimationCatalog';
import type { RigPose } from './RigTypes';

export function applyReactionPose(
  pose: RigPose,
  state: AnimationStateId,
  time: number,
  kind: 'granite' | 'shira',
) {
  if (state === 'victory') {
    pose.frontArm = -2.45;
    pose.backArm = kind === 'granite' ? 2.45 : -1.9;
    pose.y = -Math.abs(Math.sin(time)) * (kind === 'shira' ? 7 : 2);
    pose.scaleX = 1.08;
    return true;
  }
  if (state === 'defeat' || state === 'knockdown') {
    pose.rotation = state === 'defeat' ? 1.45 : 1.35;
    pose.y = state === 'defeat' ? 28 : 24;
    pose.scaleY = state === 'defeat' ? 0.82 : 1;
    return true;
  }
  if (state === 'wake-up') {
    pose.rotation = 0.4;
    pose.y = 15;
    pose.scaleY = 0.8;
    return true;
  }
  if (/reaction/.test(state)) {
    pose.rotation = -0.24;
    pose.x = -9;
    pose.frontArm = 0.8;
    pose.backArm = -0.7;
    return true;
  }
  if (state === 'passive-full') {
    pose.scaleX = 1.03 + Math.sin(time * 2) * 0.035;
    pose.scaleY = 1.03 + Math.cos(time * 2) * 0.035;
    return true;
  }
  return false;
}
