import { MathUtils, type Group } from 'three';
import type { FighterSnapshot } from '../sim/index.js';

interface LocomotionRig {
  readonly root: Group;
  readonly torso: Group;
  readonly head: Group;
  readonly leftArm: Group;
  readonly rightArm: Group;
  readonly leftLeg: Group;
  readonly rightLeg: Group;
}

const COMBAT_YAW = 0.55;
const HEAD_YAW = 0.22;
const WALK_SPEED = 8.4;
const WALK_VELOCITY = 65;
const WALK_THRESHOLD = 16;

export function facingOpponent(
  fighter: FighterSnapshot,
  opponent: FighterSnapshot | null,
): -1 | 1 {
  if (opponent === null) return fighter.facing;
  const distance = opponent.position.x - fighter.position.x;
  if (distance === 0) return fighter.facing;
  return distance > 0 ? 1 : -1;
}

/**
 * A render-only snapshot whose facing follows the fighter's current side.
 *
 * Simulation facing can deliberately stay locked during guard or an active
 * move. The presentation must still mirror after a cross-over, otherwise the
 * body turns toward the opponent while its attacking limbs keep the old pose.
 */
export function withOpponentFacing(
  fighter: FighterSnapshot,
  opponent: FighterSnapshot | null,
): FighterSnapshot {
  const facing = facingOpponent(fighter, opponent);
  return facing === fighter.facing ? fighter : { ...fighter, facing };
}

/**
 * Horizontal scale for flat artwork whose source has an authored direction.
 *
 * A negative scale mirrors the sheet. Keeping this in one place prevents a
 * left-facing turnaround and a right-facing turnaround from using opposite
 * conventions in different fighter components.
 */
export function spriteFacingScale(
  sourceFacesRight: boolean,
  desiredFacing: -1 | 1,
): -1 | 1 {
  const sourceFacing = sourceFacesRight ? 1 : -1;
  return (sourceFacing * desiredFacing) as -1 | 1;
}

export function turnTowardOpponent(
  group: Group,
  head: Group,
  facing: -1 | 1,
): void {
  group.rotation.y = facing * COMBAT_YAW;
  head.rotation.y = facing * HEAD_YAW;
}

export function applyWalkCycle(
  rig: LocomotionRig,
  fighter: FighterSnapshot,
  time: number,
  visualFacing: -1 | 1,
  bodyScale = 1,
): void {
  const isWalking = (
    fighter.grounded
    && fighter.action === null
    && !fighter.guarding
    && fighter.hitstop === 0
    && fighter.hitstun === 0
    && Math.abs(fighter.velocity.x) >= WALK_THRESHOLD
  );
  if (!isWalking) return;

  const speed = MathUtils.clamp(
    Math.abs(fighter.velocity.x) / WALK_VELOCITY,
    0.62,
    1.18,
  );
  const travelDirection = fighter.velocity.x * visualFacing >= 0 ? 1 : -1;
  const phase = time * WALK_SPEED * speed * travelDirection;
  const stride = Math.sin(phase);
  const counterStride = Math.sin(phase + Math.PI);
  const landing = Math.abs(Math.sin(phase));

  rig.root.position.y += landing * 0.04 * bodyScale;
  rig.root.rotation.z -= stride * 0.018;
  rig.torso.rotation.z += stride * 0.038;
  rig.head.rotation.z -= stride * 0.018;

  rig.leftLeg.rotation.x += stride * 0.18;
  rig.leftLeg.rotation.z += stride * 0.2;
  rig.rightLeg.rotation.x += counterStride * 0.18;
  rig.rightLeg.rotation.z += counterStride * 0.2;

  rig.leftArm.rotation.x += counterStride * 0.12;
  rig.leftArm.rotation.z += counterStride * 0.16;
  rig.rightArm.rotation.x += stride * 0.12;
  rig.rightArm.rotation.z += stride * 0.16;
}
