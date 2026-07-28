import type { AnimationStateId } from './AnimationCatalog';
import type { RigFrame, RigPose } from './RigTypes';

const BASE: RigPose = {
  x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1,
  head: 0, torso: 0, frontArm: -0.1, backArm: 0.12,
  frontLeg: 0, backLeg: 0,
};

export function poseFor(frame: RigFrame, kind: 'granite' | 'shira'): RigPose {
  const time = frame.tick / 7;
  const pose = { ...BASE };
  pose.y = Math.sin(time * 0.7) * (kind === 'granite' ? 1.2 : 2);
  pose.head = Math.sin(time * 0.55) * 0.025;
  if (frame.state === 'walk') applyWalk(pose, time, kind);
  else if (frame.state.startsWith('dash')) applyDash(pose, frame.state);
  else if (frame.state.startsWith('jump') || frame.state === 'jump-rise') applyJump(pose);
  else if (frame.state === 'jump-fall') applyFall(pose);
  else if (frame.state === 'landing') applyLanding(pose);
  else if (frame.state === 'crouch') applyCrouch(pose);
  else if (isDefense(frame.state)) applyDefense(pose, frame.state);
  else if (isAttack(frame.state)) applyAttack(pose, frame, kind);
  else if (isReaction(frame.state)) applyReaction(pose, frame.state);
  else if (frame.state === 'victory') applyVictory(pose, time, kind);
  else if (frame.state === 'defeat') applyDefeat(pose);
  else if (frame.state === 'passive-full') applyCharged(pose, time);
  return pose;
}

function applyWalk(pose: RigPose, time: number, kind: 'granite' | 'shira') {
  const stride = Math.sin(time * (kind === 'granite' ? 1.2 : 1.8));
  pose.frontLeg = stride * 0.55;
  pose.backLeg = -stride * 0.55;
  pose.frontArm = -stride * 0.42;
  pose.backArm = stride * 0.42;
  pose.y += Math.abs(stride) * 2;
  pose.rotation = stride * 0.025;
}

function applyDash(pose: RigPose, state: AnimationStateId) {
  pose.rotation = state === 'dash-whiff' ? -0.18 : 0.24;
  pose.scaleX = state === 'dash-whiff' ? 0.92 : 1.16;
  pose.scaleY = state === 'dash-whiff' ? 1.08 : 0.84;
  pose.frontArm = -1.05;
  pose.backArm = 0.82;
  pose.frontLeg = -0.58;
  pose.backLeg = 0.72;
}

function applyJump(pose: RigPose) {
  pose.scaleX = 0.88;
  pose.scaleY = 1.14;
  pose.frontLeg = -0.45;
  pose.backLeg = 0.35;
  pose.frontArm = -0.72;
  pose.backArm = 0.6;
}

function applyFall(pose: RigPose) {
  pose.rotation = 0.08;
  pose.frontLeg = 0.72;
  pose.backLeg = -0.42;
  pose.frontArm = 0.55;
  pose.backArm = -0.48;
}

function applyLanding(pose: RigPose) {
  pose.y = 7;
  pose.scaleX = 1.15;
  pose.scaleY = 0.74;
  pose.frontLeg = -0.24;
  pose.backLeg = 0.24;
}

function applyCrouch(pose: RigPose) {
  pose.y = 13;
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

function applyAttack(pose: RigPose, frame: RigFrame, kind: 'granite' | 'shira') {
  const drive = frame.phase === 'startup' ? -0.4 : frame.phase === 'active' ? 1 : 0.28;
  const heavy = frame.state.includes('heavy') || frame.state === 'super';
  const low = frame.state.includes('low');
  pose.x = drive * (heavy ? 11 : 7);
  pose.rotation = drive * (heavy ? 0.18 : 0.12);
  pose.frontArm = drive * (kind === 'shira' ? -1.55 : -1.22);
  pose.backArm = -drive * 0.72;
  pose.frontLeg = -drive * 0.28;
  pose.scaleX = frame.phase === 'active' ? 1.16 : 0.96;
  pose.scaleY = frame.phase === 'active' ? 0.87 : 1.05;
  if (low) applyCrouch(pose);
  if (frame.state.includes('air')) applyJump(pose);
  if (frame.state.includes('special') || frame.state === 'super') {
    pose.frontArm -= 0.5;
    pose.backArm += 0.5;
    pose.scaleX += 0.08;
  }
}

function applyReaction(pose: RigPose, state: AnimationStateId) {
  if (state === 'knockdown') {
    pose.rotation = 1.35;
    pose.y = 24;
  } else if (state === 'wake-up') {
    pose.rotation = 0.4;
    pose.y = 15;
    pose.scaleY = 0.8;
  } else {
    pose.rotation = -0.24;
    pose.x = -9;
    pose.frontArm = 0.8;
    pose.backArm = -0.7;
  }
}

function applyVictory(pose: RigPose, time: number, kind: 'granite' | 'shira') {
  pose.frontArm = -2.45;
  pose.backArm = kind === 'granite' ? 2.45 : -1.9;
  pose.y = -Math.abs(Math.sin(time)) * (kind === 'shira' ? 7 : 2);
  pose.scaleX = 1.08;
}

function applyDefeat(pose: RigPose) {
  pose.rotation = 1.45;
  pose.y = 28;
  pose.scaleY = 0.82;
}

function applyCharged(pose: RigPose, time: number) {
  pose.scaleX = 1.03 + Math.sin(time * 2) * 0.035;
  pose.scaleY = 1.03 + Math.cos(time * 2) * 0.035;
}

function isDefense(state: AnimationStateId) {
  return state.includes('block') || state === 'combo-break' || state === 'combo-escape';
}

function isAttack(state: AnimationStateId) {
  return /light|heavy|special|throw|grab|super|reversal|auto-combo/.test(state);
}

function isReaction(state: AnimationStateId) {
  return /reaction|knockdown|wake-up/.test(state);
}
