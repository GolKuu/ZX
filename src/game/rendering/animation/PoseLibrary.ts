import type { AnimationStateId } from './AnimationCatalog';
import type { RigFrame, RigPose } from './RigTypes';
import { applyReactionPose } from './PoseReactions';
import type { CharacterId } from '../../data/characters/circleFighters';
import { CHARACTER_MOTION } from './CharacterMotionProfiles';

const BASE: RigPose = {
  x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1,
  head: 0, torso: 0, frontArm: -0.1, backArm: 0.12,
  frontLeg: 0, backLeg: 0,
};

export function poseFor(
  frame: RigFrame,
  kind: 'granite' | 'shira',
  characterId: CharacterId,
): RigPose {
  const motion = CHARACTER_MOTION[characterId];
  const time = frame.tick / motion.cadence;
  const pose = { ...BASE };
  pose.y = -Math.abs(Math.sin(time * 0.7)) * motion.bounce;
  pose.head = Math.sin(time * 0.55) * 0.025;
  if (applyReactionPose(pose, frame.state, time, characterId)) return pose;
  if (frame.state === 'walk') applyWalk(pose, time, kind);
  else if (frame.state.startsWith('dash')) applyDash(pose, frame.state, kind);
  else if (frame.state === 'jump-fall') applyFall(pose, kind);
  else if (frame.state.startsWith('jump')) applyJump(pose, kind);
  else if (frame.state === 'landing') applyLanding(pose);
  else if (frame.state === 'crouch') applyCrouch(pose);
  else if (isDefense(frame.state)) applyDefense(pose, frame.state);
  else if (isAttack(frame.state)) applyAttack(pose, frame, kind, motion.reach);
  return pose;
}

function applyWalk(pose: RigPose, time: number, kind: 'granite' | 'shira') {
  const stride = Math.sin(time * (kind === 'granite' ? 1.2 : 1.8));
  pose.frontLeg = stride * 0.55;
  pose.backLeg = -stride * 0.55;
  pose.frontArm = -stride * (kind === 'shira' ? 0.18 : 0.42);
  pose.backArm = stride * (kind === 'shira' ? 0.18 : 0.42);
  pose.y -= Math.abs(stride) * 2;
  pose.rotation = stride * 0.025;
}

function applyDash(pose: RigPose, state: AnimationStateId, kind: 'granite' | 'shira') {
  pose.rotation = state === 'dash-whiff' ? -0.18 : 0.24;
  pose.scaleX = state === 'dash-whiff' ? 0.92 : 1.16;
  pose.scaleY = state === 'dash-whiff' ? 1.08 : 0.84;
  pose.frontArm = kind === 'shira' ? -0.32 : -1.05;
  pose.backArm = kind === 'shira' ? 0.24 : 0.82;
  pose.frontLeg = -0.58;
  pose.backLeg = 0.72;
}

function applyJump(pose: RigPose, kind: 'granite' | 'shira') {
  pose.scaleX = 0.88;
  pose.scaleY = 1.14;
  pose.frontLeg = -0.45;
  pose.backLeg = 0.35;
  pose.frontArm = kind === 'shira' ? -0.24 : -0.72;
  pose.backArm = kind === 'shira' ? 0.2 : 0.6;
}

function applyFall(pose: RigPose, kind: 'granite' | 'shira') {
  pose.rotation = 0.08;
  pose.frontLeg = 0.72;
  pose.backLeg = -0.42;
  pose.frontArm = kind === 'shira' ? 0.18 : 0.55;
  pose.backArm = kind === 'shira' ? -0.16 : -0.48;
}

function applyLanding(pose: RigPose) {
  pose.y = 0;
  pose.scaleX = 1.15;
  pose.scaleY = 0.74;
  pose.frontLeg = -0.24;
  pose.backLeg = 0.24;
}

function applyCrouch(pose: RigPose) {
  pose.y = 0;
  pose.scaleY = 0.72;
  pose.frontLeg = -0.55;
  pose.backLeg = 0.45;
}

function applyDefense(pose: RigPose, state: AnimationStateId) {
  pose.scaleX = 0.9;
  pose.scaleY = 1.04;
  pose.frontArm = -1.2;
  pose.backArm = -0.82;
  pose.rotation = -0.08;
  if (state === 'combo-break') {
    pose.frontArm = -2.2;
    pose.backArm = 2.2;
    pose.scaleX = 1.22;
  }
  if (state === 'combo-escape') pose.x = -14;
}

function applyAttack(
  pose: RigPose,
  frame: RigFrame,
  kind: 'granite' | 'shira',
  reach: number,
) {
  const drive = frame.phase === 'startup' ? -0.4 : frame.phase === 'active' ? 1 : 0.28;
  const heavy = frame.state.includes('heavy') || frame.state === 'super';
  const low = frame.state.includes('low');
  if (frame.motion?.includes('kick')) {
    applyKick(pose, frame.motion, drive, heavy);
    if (low) applyCrouch(pose);
    if (frame.state.includes('air')) pose.y -= 9;
    return;
  }
  // Specific handling for punch-like motions to emulate jab/hook/uppercut dynamics
  if (frame.motion === 'punch') {
    // lighter startup for jab, stronger snap for heavy
    const punchDrive = drive * (heavy ? 1.1 : 0.85);
    pose.torso += punchDrive * 0.15; // torso twist
    pose.frontArm = punchDrive * (kind === 'shira' ? -0.9 : -1.6) * reach;
    pose.backArm = -punchDrive * (kind === 'shira' ? 0.3 : 0.8);
    pose.rotation += punchDrive * 0.06;
    // more hip/leg brace for a committed punch
    pose.frontLeg = -punchDrive * 0.6;
    pose.scaleX = frame.phase === 'active' ? 1.18 : 1.0;
    if (frame.phase === 'active') {
      pose.frontArm -= heavy ? 0.9 : 0.5; // snap forward
      pose.backArm += heavy ? 0.5 : 0.28;
    }
    if (frame.state.includes('special') || frame.state === 'super') {
      pose.frontArm -= 0.6;
    }
    return;
  }
  pose.x = drive * (heavy ? 11 : 7) * reach;
  pose.rotation = drive * (heavy ? 0.18 : 0.12);
  // stronger, more realistic arm extension during strikes
  pose.frontArm = drive * (kind === 'shira' ? -0.6 : -1.9) * reach;
  pose.backArm = -drive * (kind === 'shira' ? 0.36 : 0.95);
  // legs brace the body more for real punches
  pose.frontLeg = -drive * 0.5;
  pose.scaleX = frame.phase === 'active' ? 1.16 : 0.96;
  pose.scaleY = frame.phase === 'active' ? 0.87 : 1.05;
  if (low) applyCrouch(pose);
  if (frame.state.includes('air')) applyJump(pose, kind);
  if (frame.state.includes('special') || frame.state === 'super') {
    // active snap for special attacks
    pose.frontArm -= kind === 'shira' ? 0.8 : 1.0;
    pose.backArm += kind === 'shira' ? 0.4 : 0.7;
    pose.scaleX += 0.12;
  }
}

function applyKick(
  pose: RigPose,
  motion: NonNullable<RigFrame['motion']>,
  drive: number,
  heavy: boolean,
) {
  pose.x = drive * (heavy ? 13 : 9);
  // counterbalance arms more during kicks
  pose.frontArm = -1.2;
  pose.backArm = 1.0;
  pose.backLeg = drive < 0 ? 0.42 : -0.22;
  pose.scaleX = drive > 0 ? 1.2 : 0.94;
  pose.scaleY = drive > 0 ? 0.84 : 1.06;
  if (motion === 'front-kick') {
    pose.frontLeg = drive * -1.28;
    pose.rotation = drive * -0.08;
  } else if (motion === 'roundhouse-kick') {
    // roundhouse: more pronounced hip rotation and extended striking leg
    pose.frontLeg = drive * -2.2;
    pose.backLeg = 0.62;
    pose.rotation = drive * 0.44;
  } else if (motion === 'sweep-kick') {
    pose.frontLeg = drive * 1.42;
    pose.backLeg = -0.76;
    pose.y = 0;
    pose.rotation = drive * -0.18;
  } else {
    pose.frontLeg = drive < 0 ? -1.75 : 0.32;
    pose.backLeg = -0.38;
    pose.y = drive > 0 ? -5 : 0;
    pose.rotation = drive * 0.12;
  }
}

function isDefense(state: AnimationStateId) {
  return state.includes('block') || state === 'combo-break' || state === 'combo-escape';
}

function isAttack(state: AnimationStateId) {
  return /light|heavy|special|throw|grab|super|reversal|auto-combo/.test(state);
}
