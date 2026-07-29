import type { HitCandidate } from './collision.js';
import type { CombatEvent } from './events.js';
import { clampInteger } from './math.js';

export function resolveHit(
  candidate: HitCandidate,
  frame: number,
  maximumVelocity: number,
  events: CombatEvent[],
): void {
  const { attacker, defender, hitbox } = candidate;
  const hit = hitbox.hit;
  const attackerIsInFront =
    (attacker.position.x - defender.position.x) * defender.facing >= 0;
  if (defender.guarding && attackerIsInFront && hit.block !== undefined) {
    defender.health = Math.max(
      0,
      defender.health - (hit.block.chipDamage ?? 0),
    );
    defender.action = null;
    defender.hitstun = Math.max(defender.hitstun, hit.block.blockstun);
    defender.hitstop = Math.max(defender.hitstop, hit.block.hitstop.defender);
    attacker.hitstop = Math.max(attacker.hitstop, hit.block.hitstop.attacker);
    defender.velocity.x = clampInteger(
      hit.block.knockback.x * attacker.facing,
      -maximumVelocity,
      maximumVelocity,
    );
    defender.velocity.y = clampInteger(
      hit.block.knockback.y,
      -maximumVelocity,
      maximumVelocity,
    );
    events.push({
      type: 'block',
      frame,
      attackerId: attacker.id,
      defenderId: defender.id,
      moveId: candidate.moveId,
      hitId: hitbox.hitId,
      position: candidate.impact,
    });
    return;
  }

  defender.health = Math.max(0, defender.health - hit.damage);
  defender.action = null;
  defender.guarding = false;
  defender.hitstun = Math.max(defender.hitstun, hit.hitstun);
  defender.hitstop = Math.max(defender.hitstop, hit.hitstop.defender);
  attacker.hitstop = Math.max(attacker.hitstop, hit.hitstop.attacker);

  defender.velocity.x = clampInteger(
    hit.knockback.x * attacker.facing,
    -maximumVelocity,
    maximumVelocity,
  );
  defender.velocity.y = clampInteger(
    hit.knockback.y,
    -maximumVelocity,
    maximumVelocity,
  );
  if (defender.velocity.y !== 0) {
    defender.grounded = false;
  }

  defender.bounce = {
    wallRemaining: hit.wallBounce?.count ?? 0,
    wallHorizontalSpeed: hit.wallBounce?.horizontalSpeed ?? 0,
    wallVerticalSpeed: hit.wallBounce?.verticalSpeed ?? 0,
    wallMinimumHitstun: hit.wallBounce?.minimumHitstun ?? 0,
    groundRemaining: hit.groundBounce?.count ?? 0,
    groundVerticalSpeed: hit.groundBounce?.verticalSpeed ?? 0,
    groundHorizontalNumerator: hit.groundBounce?.horizontalScale.numerator ?? 1,
    groundHorizontalDenominator: hit.groundBounce?.horizontalScale.denominator ?? 1,
    groundMinimumHitstun: hit.groundBounce?.minimumHitstun ?? 0,
  };

  events.push({
    type: 'hit',
    frame,
    attackerId: attacker.id,
    defenderId: defender.id,
    moveId: candidate.moveId,
    hitId: hitbox.hitId,
    damage: hit.damage,
    position: candidate.impact,
  });
}
