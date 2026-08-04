import type { HitData } from './frame-data.js';
import type { MutableFighterState } from './state.js';

export const KNOCKDOWN_FRAMES = 90;
export const KNOCKDOWN_DOWN_FRAMES = 30;
export const KNOCKDOWN_GETUP_FRAMES = 22;
export const KNOCKDOWN_COOLDOWN_FRAMES = 360;
export const DEFAULT_IMPACT_ARMOUR = 160;

/**
 * A hit's force combines its authored damage with its physical launch impulse.
 * Fixed-point knockback is divided back into a small, readable force bonus.
 */
export function calculateImpactForce(hit: HitData): number {
  const impulse = Math.abs(hit.knockback.x) + Math.abs(hit.knockback.y);
  return hit.damage + Math.ceil(impulse / 16);
}

export function canKnockDown(
  fighter: MutableFighterState,
  hit: HitData,
): boolean {
  return fighter.health > 0
    && fighter.grounded
    && fighter.knockdownCooldownFrames === 0
    && calculateImpactForce(hit) > fighter.impactArmour;
}

export function applyKnockdown(fighter: MutableFighterState): void {
  fighter.knockdownFrames = KNOCKDOWN_FRAMES;
  fighter.knockdownPhase = 'falling';
  fighter.knockdownCooldownFrames = KNOCKDOWN_COOLDOWN_FRAMES;
  fighter.action = null;
  fighter.guarding = false;
  fighter.crouching = false;
  fighter.hitstun = Math.max(fighter.hitstun, 18);
}

/** Adds the short, violent launch that sells an MK-style sweep off the feet. */
export function applyKnockdownLaunch(
  fighter: MutableFighterState,
  attackerFacing: -1 | 1,
  impactForce: number,
): void {
  const excess = Math.max(0, impactForce - fighter.impactArmour);
  const horizontal = Math.min(360, 170 + excess * 3);
  fighter.velocity.x = attackerFacing * Math.max(
    Math.abs(fighter.velocity.x),
    horizontal,
  );
  fighter.velocity.y = Math.max(fighter.velocity.y, Math.min(260, 170 + excess * 2));
  fighter.grounded = false;
}

export function advanceKnockdown(
  fighter: MutableFighterState,
  startedThisFrame: boolean,
): void {
  if (fighter.knockdownPhase === 'none' || startedThisFrame) return;
  if (fighter.knockdownPhase === 'falling') {
    fighter.knockdownFrames -= 1;
    if (
      fighter.grounded
      || fighter.knockdownFrames <= KNOCKDOWN_DOWN_FRAMES + KNOCKDOWN_GETUP_FRAMES
    ) {
      fighter.knockdownPhase = 'down';
      fighter.knockdownFrames = KNOCKDOWN_DOWN_FRAMES + KNOCKDOWN_GETUP_FRAMES;
      fighter.velocity.x = 0;
    }
    return;
  }
  fighter.knockdownFrames -= 1;
  if (
    fighter.knockdownPhase === 'down'
    && fighter.knockdownFrames <= KNOCKDOWN_GETUP_FRAMES
  ) {
    fighter.knockdownPhase = 'rising';
  }
  if (fighter.knockdownFrames <= 0) {
    fighter.knockdownFrames = 0;
    fighter.knockdownPhase = 'none';
    fighter.hitstun = 0;
  }
}

export function knockdownPoseAmount(
  fighter: Pick<MutableFighterState, 'knockdownFrames' | 'knockdownPhase'>,
): number {
  if (fighter.knockdownPhase === 'none') return 0;
  if (fighter.knockdownPhase !== 'rising') return 1;
  return Math.min(1, fighter.knockdownFrames / KNOCKDOWN_GETUP_FRAMES);
}
