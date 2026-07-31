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
    const perfect = defender.guardFrames <= 3 && hit.block.guardBreak !== true;
    const painGuard = (
      defender.guardMode === 'pain'
      && hit.block.guardBreak !== true
      && defender.resource >= (defender.resourceRules?.painGuardCost ?? 0)
    );
    const guardDamage = hit.block.guardDamage ?? 10;
    defender.guardHealth = Math.max(0, defender.guardHealth - guardDamage);
    if (defender.guardHealth === 0 || hit.block.guardBreak === true) {
      applyGuardBreak(defender);
      events.push({
        type: 'guardBreak',
        frame,
        attackerId: attacker.id,
        defenderId: defender.id,
        moveId: candidate.moveId,
      });
      return { startedAction: false };
    }
    const rawChip = hit.block.chipDamage ?? 0;
    const chipPercent = painGuard
      ? defender.resourceRules?.painGuardChipPercent ?? 100
      : 100;
    const chip = Math.ceil((rawChip * chipPercent) / 100);
    defender.health = Math.max(
      0,
      defender.health - chip,
    );
    if (painGuard) {
      defender.resource = Math.max(
        0,
        defender.resource - (defender.resourceRules?.painGuardCost ?? 0),
      );
      addResource(defender, rawChip - chip);
    } else if (perfect) {
      addResource(defender, defender.resourceRules?.perfectBlockGain ?? 0);
    }
    addResource(attacker, candidate.attackerMove?.resourceGainOnBlock ?? 0);
    defender.action = null;
    defender.hitstun = Math.max(
      defender.hitstun,
      perfect ? Math.max(1, hit.block.blockstun - 4) : hit.block.blockstun,
    );
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
      perfect,
      painGuard,
    });
    return { startedAction: false };
  }

  const armour = activeArmour(candidate);
  const damage = armour === null
    ? hit.damage
    : Math.max(1, Math.ceil((hit.damage * armour.damagePercent) / 100));
  defender.health = Math.max(0, defender.health - damage);
  addResource(
    defender,
    Math.floor(
      (damage * (defender.resourceRules?.damageTakenPercent ?? 0)) / 100,
    ),
  );
  addResource(attacker, candidate.attackerMove?.resourceGainOnHit ?? 0);
  if (armour !== null && defender.action !== null) {
    defender.action.armourHitsUsed += 1;
    defender.hitstop = Math.max(defender.hitstop, hit.hitstop.defender);
    attacker.hitstop = Math.max(attacker.hitstop, hit.hitstop.attacker);
    events.push({
      type: 'armourAbsorbed',
      frame,
      attackerId: attacker.id,
      defenderId: defender.id,
      moveId: candidate.moveId,
      damage,
    });
    return { startedAction: false };
  }
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
    damage,
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
      armourHitsUsed: 0,
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
    armourHitsUsed: 0,
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

function addResource(fighter: HitCandidate['defender'], amount: number): void {
  if (amount <= 0 || fighter.resourceLockFrames > 0) return;
  fighter.resource = Math.min(
    fighter.resourceMaximum,
    fighter.resource + amount,
  );
}

function activeArmour(candidate: HitCandidate) {
  const action = candidate.defender.action;
  const armour = candidate.defenderMove?.armour;
  if (
    action === null
    || armour === undefined
    || action.armourHitsUsed >= armour.hits
    || action.frame < armour.frames.from
    || action.frame >= armour.frames.toExclusive
  ) return null;
  return armour;
}

function applyGuardBreak(defender: HitCandidate['defender']): void {
  defender.guarding = false;
  defender.guardMode = 'normal';
  defender.guardHealth = 45;
  defender.hitstun = Math.max(defender.hitstun, 36);
  const rules = defender.resourceRules;
  defender.resource = Math.max(0, defender.resource - (rules?.guardBreakLoss ?? 0));
  defender.resourceLockFrames = Math.max(
    defender.resourceLockFrames,
    rules?.guardBreakLockFrames ?? 0,
  );
}
