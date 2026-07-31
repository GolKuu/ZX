import type { HitCandidate } from './collision.js';
import type { CombatEvent } from './events.js';
import { clampInteger } from './math.js';

export interface ResolveContext {
  /** Serial to give a counter or follow-up action, when one starts. */
  readonly nextSerial: number;
}

export interface ResolveOutcome {
  /** True when a new action was started and the serial was consumed. */
  readonly startedAction: boolean;
}

export function resolveHit(
  candidate: HitCandidate,
  frame: number,
  maximumVelocity: number,
  events: CombatEvent[],
  context?: ResolveContext,
): ResolveOutcome {
  const { attacker, defender, hitbox } = candidate;
  const hit = hitbox.hit;

  const countered = tryCounter(candidate, frame, events, context);
  if (countered) {
    return { startedAction: true };
  }
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
    return { startedAction: false };
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

  // Hit confirm: a cinematic follow-up starts here or not at all.
  const followUp = candidate.attackerMove?.onHitFollowUp;
  if (followUp !== undefined && context !== undefined && attacker.health > 0) {
    attacker.action = {
      moveId: followUp,
      frame: 0,
      serial: context.nextSerial,
      hitLedger: [],
    };
    events.push({
      type: 'moveStarted',
      frame,
      fighterId: attacker.id,
      moveId: followUp,
    });
    return { startedAction: true };
  }
  return { startedAction: false };
}

/**
 * The bait. The defender's own move declares the window; taking the swing
 * inside it converts the exchange instead of landing it.
 */
function tryCounter(
  candidate: HitCandidate,
  frame: number,
  events: CombatEvent[],
  context: ResolveContext | undefined,
): boolean {
  const { attacker, defender } = candidate;
  const counter = candidate.defenderMove?.counter;
  const action = defender.action;
  if (
    counter === undefined
    || action === null
    || context === undefined
    || action.frame < counter.frames.from
    || action.frame >= counter.frames.toExclusive
  ) {
    return false;
  }
  attacker.hitstop = Math.max(attacker.hitstop, counter.attackerHitstop);
  attacker.action = null;
  defender.action = {
    moveId: counter.into,
    frame: 0,
    serial: context.nextSerial,
    hitLedger: [],
  };
  defender.hitstun = 0;
  events.push({
    type: 'moveStarted',
    frame,
    fighterId: defender.id,
    moveId: counter.into,
  });
  return true;
}
