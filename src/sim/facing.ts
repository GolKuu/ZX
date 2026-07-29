import type { MutableFighterState } from './state.js';

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

    const opponent = nearestLivingOpponent(fighter, fighters);
    if (opponent === undefined || opponent.position.x === fighter.position.x) {
      continue;
    }
    fighter.facing = opponent.position.x > fighter.position.x ? 1 : -1;
  }
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
