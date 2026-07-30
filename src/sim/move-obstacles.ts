import {
  activeHitboxes,
  overlapPoint,
  toWorldBox,
} from './collision.js';
import type { MoveFrameData, MoveObstacleData } from './frame-data.js';
import type { WorldBox } from './events.js';
import type { MutableFighterState } from './state.js';

const BROKEN_LEDGER_PREFIX = 'move-obstacle:';

interface ActiveObstacle {
  readonly owner: MutableFighterState;
  readonly data: MoveObstacleData;
  readonly worldBox: WorldBox;
}

/**
 * Resolves short-lived authored barriers after movement integration. The
 * obstacle belongs to the active move, so interruption and recovery remove it
 * automatically without introducing a second entity lifecycle.
 */
export function resolveMoveObstacles(
  fighters: readonly MutableFighterState[],
  moves: ReadonlyMap<string, MoveFrameData>,
): void {
  const obstacles = collectActiveObstacles(fighters, moves);
  for (const obstacle of obstacles) {
    applyAttackContacts(obstacle, fighters, moves);
  }
  for (const obstacle of obstacles) {
    if (isBroken(obstacle)) continue;
    for (const fighter of fighters) {
      if (fighter.id !== obstacle.owner.id) {
        blockCrossing(fighter, obstacle.worldBox);
      }
    }
  }
}

function collectActiveObstacles(
  fighters: readonly MutableFighterState[],
  moves: ReadonlyMap<string, MoveFrameData>,
): ActiveObstacle[] {
  const result: ActiveObstacle[] = [];
  for (const owner of fighters) {
    const action = owner.action;
    const move = action === null ? undefined : moves.get(action.moveId);
    const data = move?.obstacle;
    if (
      action === null
      || move === undefined
      || data === undefined
      || action.frame < move.startup
      || action.frame >= move.startup + move.active
      || isBroken({ owner, data, worldBox: toWorldBox(owner, data.box) })
    ) {
      continue;
    }
    result.push({ owner, data, worldBox: toWorldBox(owner, data.box) });
  }
  return result;
}

function applyAttackContacts(
  obstacle: ActiveObstacle,
  fighters: readonly MutableFighterState[],
  moves: ReadonlyMap<string, MoveFrameData>,
): void {
  const ownerAction = obstacle.owner.action;
  if (ownerAction === null) return;

  let contacts = obstacleContacts(ownerAction.hitLedger);
  for (const attacker of fighters) {
    if (
      attacker.id === obstacle.owner.id
      || attacker.team === obstacle.owner.team
      || contacts >= obstacle.data.hitsToBreak
    ) {
      continue;
    }
    const action = attacker.action;
    const move = action === null ? undefined : moves.get(action.moveId);
    if (action === null || move === undefined) continue;

    const touched = activeHitboxes(attacker, move).some((hitbox) =>
      hitbox.boxes.some((box) =>
        overlapPoint(toWorldBox(attacker, box), obstacle.worldBox) !== null,
      ),
    );
    if (touched) {
      contacts += 1;
      ownerAction.hitLedger.push(`${BROKEN_LEDGER_PREFIX}${String(contacts)}`);
    }
  }
}

function blockCrossing(fighter: MutableFighterState, obstacle: WorldBox): void {
  const left = obstacle.center.x - obstacle.halfSize.x;
  const right = obstacle.center.x + obstacle.halfSize.x;
  const approachedFromLeft = fighter.previousPosition.x <= left;
  const approachedFromRight = fighter.previousPosition.x >= right;

  if (approachedFromLeft && fighter.position.x > left) {
    fighter.position.x = left;
    fighter.velocity.x = Math.min(0, fighter.velocity.x);
  } else if (approachedFromRight && fighter.position.x < right) {
    fighter.position.x = right;
    fighter.velocity.x = Math.max(0, fighter.velocity.x);
  }
}

function isBroken(obstacle: ActiveObstacle): boolean {
  const action = obstacle.owner.action;
  return action === null
    || obstacleContacts(action.hitLedger) >= obstacle.data.hitsToBreak;
}

function obstacleContacts(ledger: readonly string[]): number {
  return ledger.filter((entry) => entry.startsWith(BROKEN_LEDGER_PREFIX)).length;
}
