import { activeHitboxes, overlapPoint, toWorldBox } from '../collision.js';
import type { CombatEvent, WorldBox } from '../events.js';
import type { MoveFrameData } from '../frame-data.js';
import { clampInteger } from '../math.js';
import type { MutableFighterState } from '../state.js';
import type { WallField } from './field.js';
import type { WallEntity } from './types.js';

export function wallBox(wall: WallEntity): WorldBox {
  return { center: { ...wall.center }, halfSize: wall.halfSize };
}

function isSolid(wall: WallEntity): boolean {
  return wall.state === 'solid';
}

/** A plane never blocks the fighter who summoned it — MIM is never self-trapped. */
function affects(wall: WallEntity, fighter: MutableFighterState): boolean {
  return wall.ownerId !== fighter.id && isSolid(wall);
}

/**
 * Opponent swings that land on a plane spend it.
 *
 * Wall-piercing moves (supers, ultimates, throws) ignore planes entirely: they
 * neither break them nor are stopped by them, which is what keeps a wall from
 * being an answer to everything.
 */
export function applyWallAttackContacts(
  field: WallField,
  fighters: readonly MutableFighterState[],
  moves: ReadonlyMap<string, MoveFrameData>,
  frame: number,
  events: CombatEvent[],
): void {
  for (const attacker of fighters) {
    const action = attacker.action;
    const move = action === null ? undefined : moves.get(action.moveId);
    if (action === null || move === undefined || move.wallPiercing === true) {
      continue;
    }
    for (const hitbox of activeHitboxes(attacker, move)) {
      for (const wall of field.entities) {
        if (wall.ownerId === attacker.id || !isSolid(wall)) continue;
        const key = `${String(action.serial)}:${hitbox.hitId}`;
        if (wall.contactLedger.includes(key)) continue;
        const touched = hitbox.boxes.some(
          (box) => overlapPoint(toWorldBox(attacker, box), wallBox(wall)) !== null,
        );
        if (!touched) continue;
        wall.contactLedger.push(key);
        wall.integrity -= move.wallDamage ?? 1;
        events.push({
          type: 'wallContact',
          frame,
          wallId: wall.id,
          ownerId: wall.ownerId,
          attackerId: attacker.id,
          integrity: Math.max(0, wall.integrity),
          position: { ...wall.center },
        });
        if (wall.integrity <= 0) {
          field.shatter(wall);
          events.push({
            type: 'wallShattered',
            frame,
            wallId: wall.id,
            ownerId: wall.ownerId,
            kind: wall.kind,
            position: { ...wall.center },
          });
        }
      }
    }
  }
}

/** A driven plane is an attack: it damages, carries, and spends itself. */
export function applyMovingWallHits(
  field: WallField,
  fighters: readonly MutableFighterState[],
  frame: number,
  maximumVelocity: number,
  events: CombatEvent[],
): void {
  for (const wall of field.entities) {
    if (wall.pushSpeed === 0 || !isSolid(wall) || wall.pushDamage === 0) continue;
    for (const fighter of fighters) {
      if (fighter.team === wall.team || fighter.health === 0) continue;
      const key = `push:${fighter.id}`;
      if (wall.contactLedger.includes(key)) continue;
      const touched = fighter.defaultHurtboxes.some(
        (box) => overlapPoint(toWorldBox(fighter, box), wallBox(wall)) !== null,
      );
      if (!touched) continue;
      wall.contactLedger.push(key);
      fighter.health = Math.max(0, fighter.health - wall.pushDamage);
      fighter.action = null;
      fighter.guarding = false;
      fighter.hitstun = Math.max(fighter.hitstun, wall.pushHitstun);
      fighter.hitstop = Math.max(fighter.hitstop, 8);
      fighter.velocity.x = clampInteger(
        wall.pushSpeed * wall.facing * 3,
        -maximumVelocity,
        maximumVelocity,
      );
      events.push({
        type: 'hit',
        frame,
        attackerId: wall.ownerId,
        defenderId: fighter.id,
        moveId: `wall:${wall.kind}`,
        hitId: 'wallPush',
        damage: wall.pushDamage,
        position: { ...wall.center },
      });
      wall.integrity -= 1;
      if (wall.integrity <= 0) field.shatter(wall);
    }
  }
}

/** Horizontal blocking plus platform landing, after movement integration. */
export function resolveWallCollisions(
  field: WallField,
  fighters: readonly MutableFighterState[],
): void {
  for (const wall of field.entities) {
    for (const fighter of fighters) {
      if (!affects(wall, fighter)) continue;
      if (wall.platform) landOnPlatform(fighter, wall);
      blockCrossing(fighter, wall);
    }
  }
}

function blockCrossing(fighter: MutableFighterState, wall: WallEntity): void {
  const top = wall.center.y + wall.halfSize.y;
  const bottom = wall.center.y - wall.halfSize.y;
  // Nothing to bump into if the fighter is entirely above or below the plane.
  if (fighter.position.y >= top || fighter.position.y + FIGHTER_HEIGHT <= bottom) {
    return;
  }
  const left = wall.center.x - wall.halfSize.x;
  const right = wall.center.x + wall.halfSize.x;
  if (fighter.previousPosition.x <= left && fighter.position.x > left) {
    fighter.position.x = left;
    fighter.velocity.x = Math.min(0, fighter.velocity.x);
  } else if (fighter.previousPosition.x >= right && fighter.position.x < right) {
    fighter.position.x = right;
    fighter.velocity.x = Math.max(0, fighter.velocity.x);
  }
}

function landOnPlatform(fighter: MutableFighterState, wall: WallEntity): void {
  const top = wall.center.y + wall.halfSize.y;
  const left = wall.center.x - wall.halfSize.x;
  const right = wall.center.x + wall.halfSize.x;
  if (
    fighter.velocity.y > 0
    || fighter.position.x < left
    || fighter.position.x > right
    || fighter.previousPosition.y < top
    || fighter.position.y > top
  ) {
    return;
  }
  fighter.position.y = top;
  fighter.velocity.y = 0;
  fighter.grounded = true;
}

/** Crown height in fixed units; matches the sprite target height. */
const FIGHTER_HEIGHT = 2_620;
