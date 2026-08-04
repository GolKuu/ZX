import type { CharacterId } from '../data/characterRoster.js';
import type { FrameRange, MoveFrameData } from '../sim/index.js';
import type { FighterMovementData } from '../sim/state.js';
import { nodeById } from './treeData.js';

export interface FighterProgressionModifier {
  readonly movement: FighterMovementData; readonly maxHealth: number;
  readonly recoveryReduction: number; readonly safetyFloor: number;
}

export function compileFighterModifier(characterId: CharacterId, nodeIds: readonly string[],
  movement: FighterMovementData, maxHealth: number): FighterProgressionModifier {
  const legal=nodeIds.map(nodeById).filter((node)=>node?.fighterId===characterId);
  const mobility=legal.filter((node)=>/flow|mobility|airspace|momentum|pressure|predator/.test(node!.branchId)).length;
  const speedScale=1+Math.min(6,mobility)*0.01;
  const recoveryReduction=Math.min(3,Math.floor(legal.length/6));
  return { movement:{forwardPerFrame:Math.round(movement.forwardPerFrame*speedScale),
    backwardPerFrame:Math.round(movement.backwardPerFrame*speedScale),jumpPerFrame:Math.round(movement.jumpPerFrame*speedScale)},
    maxHealth:Math.max(1,Math.round(maxHealth*(1-Math.min(2,mobility*.25)/100))),recoveryReduction,
    safetyFloor:characterId==='glitch'?15:characterId==='titan'?18:12 };
}

export function compileProgressionMoves(moves: readonly MoveFrameData[], characterId: CharacterId,
  nodeIds: readonly string[]): readonly MoveFrameData[] {
  const owned=nodeIds.map(nodeById).filter((node)=>node?.fighterId===characterId);
  const reduction=Math.min(3,Math.floor(owned.length/6)); if(reduction===0)return moves;
  const floor=characterId==='glitch'?15:characterId==='titan'?18:12;
  return moves.map((move)=>move.id.startsWith(`${characterId}.`) && !move.id.includes('grab.miss')
    ? shortenRecovery(move,Math.max(floor,move.recovery-reduction)):move);
}

/**
 * Shortens a move's recovery and pulls its authored windows back inside it.
 *
 * Recovery is the only thing progression tunes, but hurtbox and cancel windows
 * are authored in absolute frames against the move's *authored* duration, and
 * most of the roster runs a hurtbox right to its final frame. Cutting recovery
 * without moving those windows produces frame data the engine rejects: 45 moves
 * across MIM, Glitch and Vorgh trip `validateMoves`, which throws inside the
 * `CombatEngine` constructor and takes the whole canvas down with it. Training
 * mode grants every node, so it hit this on the first frame of every session.
 *
 * Only these two windows need it. A hitbox is bounded by the active frames,
 * which recovery cannot touch, and armour or counter windows past the new end
 * are simply never reached because the move is already over.
 */
function shortenRecovery(move: MoveFrameData, recovery: number): MoveFrameData {
  if(recovery===move.recovery)return move;
  const total=move.startup+move.active+recovery;
  return { ...move, recovery, hurtboxes:clampWindows(move.hurtboxes,total),
    cancels:clampWindows(move.cancels,total) };
}

/**
 * Clips every window's end to `total`, dropping any that begins at or after it.
 *
 * A window whose whole span was in the frames progression removed has nothing
 * left to describe, and the engine requires a non-empty half-open range. An
 * emptied hurtbox list is safe: `activeHurtboxes` falls back to the fighter's
 * default boxes whenever no authored window covers the current frame.
 */
function clampWindows<T extends { readonly frames: FrameRange }>(
  windows: readonly T[] | undefined, total: number): readonly T[] | undefined {
  if(windows===undefined)return undefined;
  return windows.filter((window)=>window.frames.from<total)
    .map((window)=>window.frames.toExclusive<=total?window
      :{...window,frames:{from:window.frames.from,toExclusive:total}});
}

export function progressionSafetyAudit(moves: readonly MoveFrameData[]): readonly string[] {
  const errors:string[]=[];
  for(const move of moves){if(move.recovery<0)errors.push(`${move.id}:negative-recovery`);
    if((move.armour?.hits??0)>1)errors.push(`${move.id}:armour-over-cap`);
    if((move.airCombo?.juggleLimit??0)>4)errors.push(`${move.id}:juggle-over-cap`);}
  return errors;
}
