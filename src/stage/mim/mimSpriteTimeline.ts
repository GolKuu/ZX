import { MIM_MOVES, MIM_MOVE_IDS } from '../../data/mim-moves.js';
import {
  spriteAttackBeat,
  type SpriteAttackPhase,
  type SpriteAttackStep,
} from '../sprite2d/spriteAttackTimeline.js';

export type MimAttackButton = 'lp' | 'hp' | 'lk' | 'hk';

export interface MimAnimationBeat {
  readonly amount: number;
  readonly button: MimAttackButton;
  readonly phase: SpriteAttackPhase;
  readonly step: SpriteAttackStep;
}

const BUTTONS: Readonly<Record<string, MimAttackButton>> = {
  [MIM_MOVE_IDS.snap]: 'lp',
  [MIM_MOVE_IDS.cursor]: 'hp',
  [MIM_MOVE_IDS.banana]: 'lk',
  [MIM_MOVE_IDS.chair]: 'hk',
};

const MOVES = new Map(MIM_MOVES.map((move) => [move.id, move]));

export function mimAnimationBeat(
  moveId: string,
  frame: number,
): MimAnimationBeat | null {
  const move = MOVES.get(moveId);
  const button = BUTTONS[moveId];
  if (move === undefined || button === undefined) return null;
  return { ...spriteAttackBeat(frame, move), button };
}
