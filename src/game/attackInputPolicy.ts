import type { CombatEvent } from '../sim/events.js';
import type { MoveFrameData } from '../sim/frame-data.js';
import type { FighterSnapshot, WorldSnapshot } from '../sim/state.js';

export class AttackInputPolicy {
  private readonly contactedActions = new Map<string, number>();

  public constructor(private readonly moves: readonly MoveFrameData[]) {}

  public isLocked(fighter: FighterSnapshot): boolean {
    return isAttackInputLocked(
      fighter,
      this.moves,
      this.contactedActions.get(fighter.id),
    );
  }

  public accept(world: WorldSnapshot, events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'hit' || event.type === 'block') {
        const attacker = world.fighters.find(
          (fighter) => fighter.id === event.attackerId,
        );
        if (attacker?.action !== null && attacker?.action !== undefined) {
          this.contactedActions.set(attacker.id, attacker.action.serial);
        }
      } else if (event.type === 'moveEnded') {
        this.contactedActions.delete(event.fighterId);
      }
    }
  }

  public reset(): void {
    this.contactedActions.clear();
  }
}

/**
 * Neutral fighters may attack. Active animations and stun lock attack input,
 * except for an authored cancel window after the current move made contact.
 */
export function isAttackInputLocked(
  fighter: FighterSnapshot,
  moves: readonly MoveFrameData[],
  contactedActionSerial: number | undefined,
): boolean {
  if (fighter.health === 0 || fighter.hitstop > 0 || fighter.hitstun > 0) {
    return true;
  }

  const action = fighter.action;
  if (action === null) {
    return false;
  }
  if (contactedActionSerial !== action.serial) {
    return true;
  }

  const move = moves.find((entry) => entry.id === action.moveId);
  const cancelOpen = move?.cancels?.some(
    (cancel) =>
      action.frame >= cancel.frames.from
      && action.frame < cancel.frames.toExclusive,
  );
  return cancelOpen !== true;
}
