import type { Group } from 'three';
import type { FighterSnapshot } from '@/src/sim';
import type { SpriteJoints } from '../sprite2d/SpriteRigBody';

const FRAME_SKIP_STEPS = 9;

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

  const tick = Math.floor(time * 9);
  const fault = faultSample(tick + (fighter.id === 'p1' ? 0 : 17));
  const isNeutral = action === null
    && fighter.hitstun === 0
    && !fighter.guarding;
  const envelope = isNeutral
    ? (fault > 0.68 ? 0.7 : 0.18)
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
