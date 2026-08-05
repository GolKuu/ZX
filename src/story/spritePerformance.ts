import type { CharacterId } from '../data/characterRoster.js';
import type { StoryLine } from './dialogue.js';

/**
 * Selects an authored pose from the same 4x4 atlas used by combat.
 * Cutscenes therefore cast the real roster art while the film decides which
 * performance frame best matches the current line.
 */
const EXPRESSION_FRAME: Readonly<Record<StoryLine['expression'], number>> = {
  normal: 0,
  determined: 8,
  injured: 7,
  frightened: 5,
  angry: 10,
  unstable: 14,
  influenced: 15,
  liberated: 13,
  other: 4,
  fifth: 6,
};

const SIGNATURE_FRAME: Readonly<Record<CharacterId, number>> = {
  glitch: 14,
  mim: 13,
  lucky: 14,
  titan: 13,
  vorgh: 14,
};

const ANTICIPATION_FRAME: Readonly<Record<CharacterId, number>> = {
  glitch: 8,
  mim: 4,
  lucky: 5,
  titan: 8,
  vorgh: 10,
};

const SETTLE_FRAME: Readonly<Record<CharacterId, number>> = {
  glitch: 4,
  mim: 8,
  lucky: 4,
  titan: 4,
  vorgh: 7,
};

export interface StorySpritePerformance {
  readonly frame: number;
  readonly column: number;
  readonly row: number;
  /** Four authored drawings: hold, anticipation, action, follow-through. */
  readonly sequence: readonly [number, number, number, number];
}

export function storySpritePerformance(
  characterId: CharacterId,
  expression: StoryLine['expression'],
  speaking: boolean,
): StorySpritePerformance {
  const frame = speaking && (expression === 'angry' || expression === 'liberated')
    ? SIGNATURE_FRAME[characterId]
    : EXPRESSION_FRAME[expression];
  const sequence: StorySpritePerformance['sequence'] = speaking
    ? [frame, ANTICIPATION_FRAME[characterId], SIGNATURE_FRAME[characterId], SETTLE_FRAME[characterId]]
    : [frame, frame, SETTLE_FRAME[characterId], frame];
  return {
    frame,
    column: frame % 4,
    row: Math.floor(frame / 4),
    sequence,
  };
}
