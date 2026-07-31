import type { Group } from 'three';
import type { FighterSnapshot } from '@/src/sim';
import type { SpriteJoints } from '../sprite2d/SpriteRigBody';
import { readGlitchDefenseState } from './glitchDefenseState';

const FRAME_SKIP_STEPS = 9;
export const GLITCH_IDLE_FRAMES = 18;

/**
 * Render-only broken interpolation. Simulation frames, hitboxes, and timings
 * stay untouched; only Glitch's anticipation/recovery drawings skip samples.
 */
export function glitchSpriteProgress(
  progress: number,
  actionFrame: number,
  strike: boolean,
): number {
  if (strike) return progress;
  const stepped = Math.floor(progress * FRAME_SKIP_STEPS) / FRAME_SKIP_STEPS;
  const rollback = actionFrame % 11 === 7 ? 1 / FRAME_SKIP_STEPS : 0;
  return clamp(stepped - rollback);
}

export function applyGlitchSpriteCorruption(
  joints: SpriteJoints,
  body: Group,
  time: number,
  fighter: FighterSnapshot,
  progress: number,
  strike: boolean,
): void {
  body.rotation.set(0, 0, 0);
  body.scale.set(1, 1, 1);

  const action = fighter.action;
  if (strike) {
    const impactFrame = action?.frame ?? 0;
    const tear = impactFrame % 2 === 0 ? 0.018 : -0.018;
    body.position.x += tear * fighter.facing;
    body.scale.x = 1.012;
    return;
  }

  const defenseState = readGlitchDefenseState(fighter);
  if (defenseState !== null && fighter.guarding) {
    applySpatialGuard(joints, body, fighter);
    return;
  }
  if (
    defenseState === 'stand-block-release'
    || defenseState === 'crouch-block-release'
    || defenseState === 'block-stun-recovery'
    || defenseState === 'throw-escape'
  ) {
    applyDefenseRecovery(joints, body, defenseState);
    return;
  }
  if (defenseState === 'guard-break') {
    applyGuardBreak(joints, body, fighter.hitstun);
    return;
  }

  const tick = Math.floor(time * 9);
  const fault = faultSample(tick + (fighter.id === 'p1' ? 0 : 17));
  const isNeutral = action === null
    && fighter.hitstun === 0
    && !fighter.guarding;
  const envelope = isNeutral
    ? 0
    : action === null
      ? 0
      : corruptionEnvelope(progress);

  const lateral = signedFault(tick * 3 + 5) * 0.045 * envelope;
  body.position.x += lateral;
  body.position.y += fault > 0.84 ? 0.025 * envelope : 0;
  body.rotation.z = signedFault(tick * 5 + 2) * 0.035 * envelope;
  body.scale.x = 1 + signedFault(tick + 8) * 0.018 * envelope;
  body.scale.y = 1 - signedFault(tick + 13) * 0.012 * envelope;

  rotate(joints.head, signedFault(tick + 21) * 0.14 * envelope);
  rotate(joints.torso, -signedFault(tick + 3) * 0.055 * envelope);
  rotate(joints.forearm, signedFault(tick + 31) * 0.18 * envelope);
  rotate(joints.farForearm, -signedFault(tick + 31) * 0.12 * envelope);

  if (fault > 0.9 && envelope > 0.4) {
    rotate(joints.upperArm, fighter.facing * 0.24);
    rotate(joints.shin, -fighter.facing * 0.2);
  }

  if (isNeutral) applyEighteenFrameIdle(joints, time);
}

function applyEighteenFrameIdle(joints: SpriteJoints, time: number): void {
  const frame = Math.floor(time * 60) % GLITCH_IDLE_FRAMES;
  const phase = (frame / GLITCH_IDLE_FRAMES) * Math.PI * 2;
  const breath = Math.sin(phase);
  const weight = Math.sin(phase + Math.PI / 2);
  rotate(joints.torso, breath * 0.012);
  rotate(joints.head, -breath * 0.008);
  rotate(joints.thigh, weight * 0.014);
  rotate(joints.farThigh, -weight * 0.012);
  rotate(joints.forearm, -breath * 0.018);
  // A two-frame local desync at the loop midpoint; the root/pivot never moves.
  if (frame === 8 || frame === 9) {
    rotate(joints.farForearm, frame === 8 ? 0.045 : -0.045);
  }
}

function applySpatialGuard(
  joints: SpriteJoints,
  body: Group,
  fighter: FighterSnapshot,
): void {
  const start = Math.min(1, fighter.guardFrames / 4);
  const impact = fighter.hitstun > 0 ? Math.min(1, fighter.hitstun / 18) : 0;
  const perfect = impact > 0 && fighter.guardFrames <= 3;
  rotate(joints.upperArm, 0.52 * start - 0.1 * impact);
  rotate(joints.forearm, -0.72 * start);
  rotate(joints.farUpperArm, -0.28 * start);
  rotate(joints.farForearm, -0.58 * start);
  rotate(joints.torso, -0.08 * start + 0.16 * impact);
  rotate(joints.head, 0.05 * start - 0.1 * impact);
  body.position.x -= fighter.facing * impact * 0.025;
  if (!fighter.grounded) {
    body.position.y += 0.04;
    rotate(joints.upperArm, 0.18 * start);
    rotate(joints.farUpperArm, -0.16 * start);
    rotate(joints.thigh, 0.62 * start);
    rotate(joints.shin, -0.88 * start);
    rotate(joints.farThigh, 0.5 * start);
    rotate(joints.farShin, -0.72 * start);
  }
  if (fighter.crouching) {
    body.position.y -= 0.28 * start;
    rotate(joints.thigh, 0.42 * start);
    rotate(joints.shin, -0.72 * start);
    rotate(joints.farThigh, 0.28 * start);
    rotate(joints.farShin, -0.62 * start);
  }
  if (perfect) {
    body.scale.x = 0.97;
    rotate(joints.torso, -0.08);
  }
}

function applyGuardBreak(
  joints: SpriteJoints,
  body: Group,
  hitstun: number,
): void {
  const force = Math.min(1, hitstun / 36);
  body.rotation.z = 0.14 * force;
  body.scale.x = 1 + 0.025 * force;
  rotate(joints.torso, 0.28 * force);
  rotate(joints.head, -0.32 * force);
  rotate(joints.upperArm, -0.72 * force);
  rotate(joints.farUpperArm, 0.64 * force);
  rotate(joints.thigh, 0.24 * force);
  rotate(joints.farThigh, -0.22 * force);
}

function applyDefenseRecovery(
  joints: SpriteJoints,
  body: Group,
  state: 'stand-block-release' | 'crouch-block-release'
    | 'block-stun-recovery' | 'throw-escape',
): void {
  const crouching = state === 'crouch-block-release';
  const recoil = state === 'block-stun-recovery';
  const escape = state === 'throw-escape';
  rotate(joints.upperArm, escape ? -0.82 : recoil ? -0.28 : 0.26);
  rotate(joints.forearm, escape ? -0.18 : -0.36);
  rotate(joints.farUpperArm, escape ? 0.76 : recoil ? 0.22 : -0.14);
  rotate(joints.farForearm, escape ? -0.12 : -0.4);
  rotate(joints.torso, recoil ? 0.18 : -0.04);
  rotate(joints.head, recoil ? -0.16 : 0.03);
  if (crouching) {
    body.position.y -= 0.18;
    rotate(joints.thigh, 0.3);
    rotate(joints.shin, -0.54);
    rotate(joints.farThigh, 0.2);
    rotate(joints.farShin, -0.46);
  }
}

function corruptionEnvelope(progress: number): number {
  if (progress < 0.34) return 0.35 + progress * 1.7;
  if (progress < 0.58) return 0.22;
  return 0.3 + (1 - progress) * 0.72;
}

function rotate(joint: Group | null, amount: number): void {
  if (joint !== null) joint.rotation.z += amount;
}

function faultSample(value: number): number {
  const wave = Math.sin(value * 91.771 + 17.13) * 43_758.5453;
  return wave - Math.floor(wave);
}

function signedFault(value: number): number {
  return faultSample(value) * 2 - 1;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}
