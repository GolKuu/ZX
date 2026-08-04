import type { AuthoredHitbox, MoveFrameData } from './frame-data.js';
import type { WorldBox } from './events.js';
import type { FixedBox, FixedVector } from './math.js';
import type { MutableFighterState } from './state.js';

export interface HitCandidate {
  readonly attacker: MutableFighterState;
  readonly defender: MutableFighterState;
  readonly moveId: string;
  readonly actionSerial: number;
  readonly hitbox: AuthoredHitbox;
  readonly impact: FixedVector;
  /** Carried so resolution can read counter and hit-confirm rules. */
  readonly attackerMove: MoveFrameData;
  readonly defenderMove: MoveFrameData | undefined;
}

export function toWorldBox(fighter: MutableFighterState, box: FixedBox): WorldBox {
  return {
    center: {
      x: fighter.position.x + box.offset.x * fighter.facing,
      y: fighter.position.y + box.offset.y,
    },
    halfSize: box.halfSize,
  };
}

export function activeHitboxes(
  fighter: MutableFighterState,
  move: MoveFrameData,
): readonly AuthoredHitbox[] {
  const frame = fighter.action?.frame;
  if (frame === undefined) {
    return [];
  }
  return move.hitboxes.filter(
    (hitbox) => frame >= hitbox.frames.from && frame < hitbox.frames.toExclusive,
  );
}

export function activeHurtboxes(
  fighter: MutableFighterState,
  move: MoveFrameData | undefined,
): readonly FixedBox[] {
  // Like Mortal Kombat, a grounded fighter cannot be hit during the brief
  // prone/get-up sequence. Airborne knockdowns remain juggleable.
  if (fighter.knockdownPhase === 'down' || fighter.knockdownPhase === 'rising') {
    return [];
  }
  const frame = fighter.action?.frame;
  if (frame === undefined || move?.hurtboxes === undefined) {
    return fighter.defaultHurtboxes;
  }
  const authored = move.hurtboxes.filter(
    (hurtbox) => frame >= hurtbox.frames.from && frame < hurtbox.frames.toExclusive,
  );
  return authored.length === 0
    ? fighter.defaultHurtboxes
    : authored.flatMap((hurtbox) => hurtbox.boxes);
}

export function overlapPoint(first: WorldBox, second: WorldBox): FixedVector | null {
  const left = Math.max(
    first.center.x - first.halfSize.x,
    second.center.x - second.halfSize.x,
  );
  const right = Math.min(
    first.center.x + first.halfSize.x,
    second.center.x + second.halfSize.x,
  );
  const bottom = Math.max(
    first.center.y - first.halfSize.y,
    second.center.y - second.halfSize.y,
  );
  const top = Math.min(
    first.center.y + first.halfSize.y,
    second.center.y + second.halfSize.y,
  );
  if (left > right || bottom > top) {
    return null;
  }
  return {
    x: Math.trunc((left + right) / 2),
    y: Math.trunc((bottom + top) / 2),
  };
}

export function findHit(
  attacker: MutableFighterState,
  defender: MutableFighterState,
  move: MoveFrameData,
  hitbox: AuthoredHitbox,
  defenderHurtboxes: readonly FixedBox[],
  defenderMove?: MoveFrameData,
): HitCandidate | null {
  const targetSize = move.grapple?.targetSize;
  if (
    (targetSize === 'grounded' && !defender.grounded)
    || (targetSize === 'airborne' && defender.grounded)
  ) {
    return null;
  }
  for (const localHitbox of hitbox.boxes) {
    const worldHitbox = toWorldBox(attacker, localHitbox);
    for (const localHurtbox of defenderHurtboxes) {
      const impact = overlapPoint(worldHitbox, toWorldBox(defender, localHurtbox));
      if (impact !== null) {
        return {
          attacker,
          defender,
          moveId: move.id,
          actionSerial: attacker.action?.serial ?? -1,
          hitbox,
          impact,
          attackerMove: move,
          defenderMove,
        };
      }
    }
  }
  return null;
}
