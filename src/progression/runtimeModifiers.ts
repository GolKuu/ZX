import type { CharacterId } from '../data/characterRoster.js';
import type { MoveFrameData } from '../sim/index.js';
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
    ? {...move,recovery:Math.max(floor,move.recovery-reduction)}:move);
}

export function progressionSafetyAudit(moves: readonly MoveFrameData[]): readonly string[] {
  const errors:string[]=[];
  for(const move of moves){if(move.recovery<0)errors.push(`${move.id}:negative-recovery`);
    if((move.armour?.hits??0)>1)errors.push(`${move.id}:armour-over-cap`);
    if((move.airCombo?.juggleLimit??0)>4)errors.push(`${move.id}:juggle-over-cap`);}
  return errors;
}
