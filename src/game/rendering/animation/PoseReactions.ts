import type { AnimationStateId } from './AnimationCatalog';
import type { RigPose } from './RigTypes';
import type { CharacterId } from '../../data/characters/circleFighters';
import { VICTORY_POSES } from './victoryPoseConfigs';

export function applyReactionPose(
  pose: RigPose,
  state: AnimationStateId,
  time: number,
  characterId: CharacterId,
) {
  if (state === 'victory') {
    applyVictoryPose(pose, characterId, time);
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

function applyVictoryPose(pose: RigPose, characterId: CharacterId, time: number) {
  const config = VICTORY_POSES[characterId];
  const entrance = Math.min(1, time / 1.4);
  const pulse = Math.sin(time * 1.8);
  pose.frontArm = config.frontArm * entrance;
  pose.backArm = config.backArm * entrance;
  pose.frontLeg = config.frontLeg * entrance;
  pose.backLeg = config.backLeg * entrance;
  pose.rotation = config.rotation * entrance;
  pose.head = config.head + pulse * 0.035;
  pose.x = pulse * config.sway;
  pose.y = -Math.abs(Math.sin(time * 1.35)) * config.bounce;
  pose.scaleX = 1 + (config.scale - 1) * entrance;
  pose.scaleY = 0.88 + 0.12 * entrance;
}
