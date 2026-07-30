import type { CombatInputs, MutableFighterState } from './state.js';

/**
 * Grounded fighters turn on the exact frame an attack is requested. Simulation
 * hitboxes use `fighter.facing`, so merely turning the rendered character would
 * make the pose look correct while the attack still hit behind the fighter.
 *
 * Guarding and ordinary movement keep their authored facing. That preserves
 * cross-up play: holding guard while an opponent is behind you must not
 * automatically turn into a successful block.
 */
export function faceAttackingFightersTowardOpponents(
  fighters: readonly MutableFighterState[],
  inputs: CombatInputs,
): void {
  for (const fighter of fighters) {
    if (
      inputs[fighter.id]?.move === undefined
      || !fighter.grounded
      || fighter.health === 0
      || fighter.hitstop > 0
      || fighter.hitstun > 0
      || fighter.action !== null
    ) {
      continue;
    }
    faceTowardNearestOpponent(fighter, fighters);
  }
}

/**
 * Airborne fighters turn as soon as they pass over an opponent. Updating the
 * simulation facing (rather than only the model) also mirrors their hitboxes.
 */
export function faceAirborneFightersTowardOpponents(
  fighters: readonly MutableFighterState[],
): void {
  for (const fighter of fighters) {
    if (
      fighter.grounded
      || fighter.health === 0
      || fighter.hitstop > 0
      || fighter.hitstun > 0
    ) {
      continue;
    }

    faceTowardNearestOpponent(fighter, fighters);
  }
}

function faceTowardNearestOpponent(
  fighter: MutableFighterState,
  fighters: readonly MutableFighterState[],
): void {
  const opponent = nearestLivingOpponent(fighter, fighters);
  if (opponent === undefined || opponent.position.x === fighter.position.x) {
    return;
  }
  fighter.facing = opponent.position.x > fighter.position.x ? 1 : -1;
}

function nearestLivingOpponent(
  fighter: MutableFighterState,
  fighters: readonly MutableFighterState[],
): MutableFighterState | undefined {
  return fighters
    .filter((candidate) => (
      candidate.id !== fighter.id
      && candidate.team !== fighter.team
      && candidate.health > 0
    ))
    .sort((first, second) => (
      Math.abs(first.position.x - fighter.position.x)
      - Math.abs(second.position.x - fighter.position.x)
      || compareIds(first.id, second.id)
    ))[0];
}

function compareIds(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0;
}
