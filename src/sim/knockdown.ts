import type { HitData } from './frame-data.js';
import type { MutableFighterState } from './state.js';

export const KNOCKDOWN_FRAMES = 90;
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
  fighter.knockdownCooldownFrames = KNOCKDOWN_COOLDOWN_FRAMES;
  fighter.action = null;
  fighter.guarding = false;
  fighter.crouching = false;
  fighter.hitstun = Math.max(fighter.hitstun, KNOCKDOWN_FRAMES);
}
