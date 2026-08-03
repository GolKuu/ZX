import type { HitCandidate } from './collision.js';
import type { CombatEvent } from './events.js';
import { clampInteger } from './math.js';
import { comboDamagePercent } from './combo-scaling.js';

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
  if (
    defender.guarding
    && attackerIsInFront
    && hit.block !== undefined
    && canGuardLevel(defender.crouching, candidate.attackerMove?.attackLevel)
    && candidate.attackerMove?.grapple === undefined
  ) {
    const perfect = (
      defender.resourceRules !== null
      && defender.guardFrames <= 3
      && hit.block.guardBreak !== true
    );
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
  const airScaling = readAirScaling(candidate);
  const isCounterHit = defender.action !== null;
  const baseDamage = armour === null
    ? hit.damage
    : Math.max(1, Math.ceil((hit.damage * armour.damagePercent) / 100));
  const rageDamagePercent = attacker.resource
    >= (attacker.resourceRules?.highRageThreshold ?? 101)
    ? attacker.resourceRules?.damagePercentAtHighRage ?? 100
    : 100;
  const damage = Math.max(
    1,
    Math.ceil(
      baseDamage
        * airScaling.damagePercent
        * rageDamagePercent
        * comboDamagePercent(defender.comboHitsTaken)
        / 1_000_000,
    ),
  );
  defender.health = Math.max(0, defender.health - damage);
  const lowHealthMultiplier =
    defender.health * 100 <= defender.maxHealth * 30 ? 125 : 100;
  addResource(
    defender,
    Math.floor(
      (
        damage
        * (defender.resourceRules?.damageTakenPercent ?? 0)
        * lowHealthMultiplier
      ) / 10_000,
    ),
  );
  if (isCounterHit) {
    addResource(attacker, attacker.resourceRules?.counterHitBonus ?? 0);
  }
  const authoredGain = candidate.attackerMove?.resourceGainOnHit ?? 0;
  addResource(
    attacker,
    attacker.statusId === 'lucky.house-advantage'
      ? authoredGain * 2
      : authoredGain,
  );
  if (armour !== null && defender.action !== null) {
    if (armour.status) defender.statusArmourHitsUsed += 1;
    else defender.action.armourHitsUsed += 1;
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
  defender.comboHitsTaken += 1;
  defender.action = null;
  defender.guarding = false;
  defender.hitstun = Math.max(
    defender.hitstun,
    Math.max(4, hit.hitstun - airScaling.hitstunDecay),
  );
  defender.hitstop = Math.max(defender.hitstop, hit.hitstop.defender);
  attacker.hitstop = Math.max(attacker.hitstop, hit.hitstop.attacker);

  const pushbackPercent = attacker.resource
    >= (attacker.resourceRules?.pressureThreshold ?? 101)
    ? attacker.resourceRules?.pushbackPercentAtPressure ?? 100
    : 100;
  defender.velocity.x = clampInteger(
    Math.ceil(hit.knockback.x * pushbackPercent / 100) * attacker.facing,
    -maximumVelocity,
    maximumVelocity,
  );
  defender.velocity.y = clampInteger(
    airScaling.forceDrop ? Math.min(-80, hit.knockback.y) : hit.knockback.y,
    -maximumVelocity,
    maximumVelocity,
  );
  if (defender.velocity.y !== 0) {
    defender.grounded = false;
  }

  const groundBounce = hit.groundBounce?.counterHitOnly === true && !isCounterHit
    ? undefined
    : hit.groundBounce;
  defender.bounce = {
    wallRemaining: airScaling.forceDrop ? 0 : hit.wallBounce?.count ?? 0,
    wallHorizontalSpeed: hit.wallBounce?.horizontalSpeed ?? 0,
    wallVerticalSpeed: hit.wallBounce?.verticalSpeed ?? 0,
    wallMinimumHitstun: hit.wallBounce?.minimumHitstun ?? 0,
    groundRemaining: airScaling.forceDrop ? 0 : groundBounce?.count ?? 0,
    groundVerticalSpeed: groundBounce?.verticalSpeed ?? 0,
    groundHorizontalNumerator: groundBounce?.horizontalScale.numerator ?? 1,
    groundHorizontalDenominator: groundBounce?.horizontalScale.denominator ?? 1,
    groundMinimumHitstun: groundBounce?.minimumHitstun ?? 0,
  };

  const grapple = candidate.attackerMove?.grapple;
  if (grapple !== undefined) {
    defender.hitstun = Math.max(defender.hitstun, grapple.pairedFrames);
    defender.velocity.x = 0;
    defender.velocity.y = 0;
    events.push({
      type: 'grapple',
      frame,
      attackerId: attacker.id,
      defenderId: defender.id,
      moveId: candidate.moveId,
      kind: grapple.kind,
      pairedFrames: grapple.pairedFrames,
    });
  }

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

function canGuardLevel(
  crouching: boolean,
  level: HitCandidate['attackerMove']['attackLevel'],
): boolean {
  if (level === 'throw' || level === 'unblockable') return false;
  if (level === 'low') return crouching;
  if (level === 'high') return !crouching;
  return true;
}

function readAirScaling(candidate: HitCandidate): {
  readonly damagePercent: number;
  readonly forceDrop: boolean;
  readonly hitstunDecay: number;
} {
  const rules = candidate.attackerMove?.airCombo;
  const defender = candidate.defender;
  if (rules === undefined || defender.grounded) {
    return { damagePercent: 100, forceDrop: false, hitstunDecay: 0 };
  }
  const repeated = defender.lastAirHitMoveId === candidate.moveId;
  defender.repeatedAirHitCount = repeated ? defender.repeatedAirHitCount + 1 : 0;
  defender.lastAirHitMoveId = candidate.moveId;
  defender.airJuggleHits += 1;
  const repeatScale = repeated
    ? Math.max(30, 100 - (
        (100 - rules.repeatedMoveDamagePercent)
        * defender.repeatedAirHitCount
      ))
    : 100;
  return {
    damagePercent: repeatScale,
    forceDrop: defender.airJuggleHits >= rules.juggleLimit,
    hitstunDecay: defender.airJuggleHits * rules.hitstunDecayPerHit,
  };
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
    || (counter.grappleOnly === true && candidate.attackerMove?.grapple === undefined)
    || (counter.strikeOnly === true && candidate.attackerMove?.grapple !== undefined)
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
  if (fighter.resourceMaximum > 0 && fighter.resource >= fighter.resourceMaximum) {
    fighter.resourceOverdrive = true;
    fighter.resourceDrainCounter = 0;
  }
}

function activeArmour(candidate: HitCandidate) {
  const action = candidate.defender.action;
  const armour = candidate.defenderMove?.armour;
  const statusArmour = candidate.defender.statusId !== null
    && candidate.defender.statusArmourHitsUsed
      < candidate.defender.statusArmourHitsMaximum
    ? {
        damagePercent: candidate.defender.statusArmourDamagePercent,
        status: true as const,
      }
    : null;
  if (
    candidate.attackerMove?.grapple !== undefined
    || action === null
  ) return null;
  if (statusArmour !== null) return statusArmour;
  if (
    armour === undefined
    || action.armourHitsUsed >= armour.hits
    || action.frame < armour.frames.from
    || action.frame >= armour.frames.toExclusive
  ) return null;
  return { ...armour, status: false as const };
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
