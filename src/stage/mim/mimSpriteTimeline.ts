import { MIM_MOVES, MIM_MOVE_IDS } from '../../data/mim-moves.js';

export type MimAttackButton = 'lp' | 'hp' | 'lk' | 'hk';

export interface MimAnimationBeat {
  readonly amount: number;
  readonly button: MimAttackButton;
  readonly phase: 'approach' | 'strike' | 'return';
  readonly step: 1 | 2 | 3 | 4;
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

  if (frame < move.startup) {
    const step = quantizedStep(frame, move.startup);
    return { amount: step / 4, button, phase: 'approach', step };
  }
  if (frame < move.startup + move.active) {
    return { amount: 1, button, phase: 'strike', step: 4 };
  }

  const recoveryFrame = frame - move.startup - move.active;
  const step = quantizedStep(recoveryFrame, move.recovery);
  return { amount: (4 - step) / 4, button, phase: 'return', step };
}

function quantizedStep(frame: number, duration: number): 1 | 2 | 3 | 4 {
  const value = Math.floor((Math.max(0, frame) * 4) / Math.max(1, duration)) + 1;
  return Math.min(4, value) as 1 | 2 | 3 | 4;
}
