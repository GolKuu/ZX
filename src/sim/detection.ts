import {
  activeHitboxes,
  activeHurtboxes,
  findHit,
  type HitCandidate,
} from './collision.js';
import type { MoveFrameData } from './frame-data.js';
import type { MutableFighterState } from './state.js';

export function collectHitCandidates(
  fighters: readonly MutableFighterState[],
  moves: ReadonlyMap<string, MoveFrameData>,
  friendlyFire: boolean,
): HitCandidate[] {
  const candidates: HitCandidate[] = [];
  const contacts = new Set<string>();
  for (const attacker of fighters) {
    const action = attacker.action;
    const move = action === null ? undefined : moves.get(action.moveId);
    if (attacker.health === 0 || action === null || move === undefined) {
      continue;
    }
    for (const hitbox of activeHitboxes(attacker, move)) {
      for (const defender of fighters) {
        if (!canHit(attacker, defender, friendlyFire)) {
          continue;
        }
        const ledgerKey = contactKey(hitbox.hitId, defender.id);
        if (action.hitLedger.includes(ledgerKey)) {
          continue;
        }
        const defenderMove =
          defender.action === null ? undefined : moves.get(defender.action.moveId);
        const candidate = findHit(
          attacker,
          defender,
          move,
          hitbox,
          activeHurtboxes(defender, defenderMove),
        );
        if (candidate !== null) {
          const contact = JSON.stringify([
            attacker.id,
            action.serial,
            hitbox.hitId,
            defender.id,
          ]);
          if (contacts.has(contact)) {
            continue;
          }
          contacts.add(contact);
          candidates.push(candidate);
        }
      }
    }
  }
  return candidates;
}

export function contactKey(hitId: string, defenderId: string): string {
  return JSON.stringify([hitId, defenderId]);
}

function canHit(
  attacker: MutableFighterState,
  defender: MutableFighterState,
  friendlyFire: boolean,
): boolean {
  return (
    attacker.id !== defender.id
    && defender.health > 0
    && (friendlyFire || attacker.team !== defender.team)
  );
}
