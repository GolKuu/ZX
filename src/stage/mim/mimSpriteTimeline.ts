import { moveKindFor } from '../../data/move-kind.js';
import { MIM_MOVES, MIM_MOVE_IDS } from '../../data/mim-moves.js';
import { MIM_SUPER_MOVES } from '../../data/mim-super-moves.js';
import { TAUNT_MOVES } from '../../data/taunt-move.js';
import {
  spriteAttackBeat,
  type SpriteAttackPhase,
  type SpriteAttackStep,
} from '../sprite2d/spriteAttackTimeline.js';

export type MimAttackButton = 'lp' | 'hp' | 'lk' | 'hk';

/** Everything MIM can be doing that has authored frames behind it. */
export type MimActionKind = MimAttackButton | 'super' | 'ultimate' | 'taunt';

export interface MimAnimationBeat {
  readonly amount: number;
  /**
   * The sliced attack panel to swap in at the strike, or `null` when the sheet
   * has no drawing for this action and the jointed rig has to carry it.
   */
  readonly button: MimAttackButton | null;
  readonly kind: MimActionKind;
  readonly phase: SpriteAttackPhase;
  readonly step: SpriteAttackStep;
}

const BUTTONS: Readonly<Record<string, MimAttackButton>> = {
  [MIM_MOVE_IDS.snap]: 'lp',
  [MIM_MOVE_IDS.cursor]: 'hp',
  [MIM_MOVE_IDS.banana]: 'lk',
  [MIM_MOVE_IDS.chair]: 'hk',
};

/**
 * The supers and the taunt are here for one reason: without their frame data
 * this returned `null` for them, and MIM stood in neutral idle through her own
 * ALT+F4.
 */
const MOVES = new Map(
  [...MIM_MOVES, ...MIM_SUPER_MOVES, ...TAUNT_MOVES].map(
    (move) => [move.id, move],
  ),
);

export function mimAnimationBeat(
  moveId: string,
  frame: number,
): MimAnimationBeat | null {
  const move = MOVES.get(moveId);
  if (move === undefined) return null;
  const button = BUTTONS[moveId] ?? null;
  const kind = button ?? kindOf(moveId);
  if (kind === null) return null;
  return { ...spriteAttackBeat(frame, move), button, kind };
}

function kindOf(moveId: string): MimActionKind | null {
  const kind = moveKindFor(moveId);
  return kind === 'normal' ? null : kind;
}
