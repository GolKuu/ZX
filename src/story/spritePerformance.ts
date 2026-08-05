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

export interface StorySpritePerformance {
  readonly frame: number;
  readonly column: number;
  readonly row: number;
}

export function storySpritePerformance(
  characterId: CharacterId,
  expression: StoryLine['expression'],
  speaking: boolean,
): StorySpritePerformance {
  const frame = speaking && (expression === 'angry' || expression === 'liberated')
    ? SIGNATURE_FRAME[characterId]
    : EXPRESSION_FRAME[expression];
  return { frame, column: frame % 4, row: Math.floor(frame / 4) };
}
