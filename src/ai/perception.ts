import { movePhaseAt, type MoveFrameData } from '../sim/frame-data.js';
import type { FighterSnapshot, WorldSnapshot } from '../sim/state.js';

export function findFighter(
  world: WorldSnapshot,
  fighterId: string,
): FighterSnapshot {
  const fighter = world.fighters.find((candidate) => candidate.id === fighterId);
  if (fighter === undefined) {
    throw new Error(`AI fighter "${fighterId}" is missing from the world`);
  }
  return fighter;
}

export function findOpponent(
  world: WorldSnapshot,
  fighter: FighterSnapshot,
): FighterSnapshot {
  const opponent = world.fighters.find(
    (candidate) => candidate.id !== fighter.id && candidate.team !== fighter.team,
  );
  if (opponent === undefined) {
    throw new Error(`AI fighter "${fighter.id}" has no opponent`);
  }
  return opponent;
}

export function resolveOpponent(
  world: WorldSnapshot,
  fighter: FighterSnapshot,
  opponentId?: string,
): FighterSnapshot {
  return opponentId === undefined
    ? findOpponent(world, fighter)
    : findFighter(world, opponentId);
}

export function distanceBetween(
  first: FighterSnapshot,
  second: FighterSnapshot,
): number {
  return Math.abs(first.position.x - second.position.x);
}

export function approachInput(
  fighter: FighterSnapshot,
  opponent: FighterSnapshot,
): -1 | 1 {
  const worldDirection = opponent.position.x >= fighter.position.x ? 1 : -1;
  return worldDirection === fighter.facing ? 1 : -1;
}

export function moveReach(move: MoveFrameData): number {
  let reach = 0;
  for (const hitbox of move.hitboxes) {
    for (const box of hitbox.boxes) {
      reach = Math.max(reach, Math.abs(box.offset.x) + box.halfSize.x);
    }
  }
  return reach;
}

export function isThreatening(
  opponent: FighterSnapshot,
  distance: number,
  moves: ReadonlyMap<string, MoveFrameData>,
  margin: number,
): boolean {
  if (opponent.action === null) {
    return false;
  }
  const move = moves.get(opponent.action.moveId);
  if (move === undefined) {
    return false;
  }
  const phase = movePhaseAt(move, opponent.action.frame);
  return (
    (phase === 'startup' || phase === 'active')
    && distance <= moveReach(move) + margin
  );
}

export function isRecovering(
  opponent: FighterSnapshot,
  moves: ReadonlyMap<string, MoveFrameData>,
): boolean {
  if (opponent.action === null) {
    return false;
  }
  const move = moves.get(opponent.action.moveId);
  return move !== undefined && movePhaseAt(move, opponent.action.frame) === 'recovery';
}
