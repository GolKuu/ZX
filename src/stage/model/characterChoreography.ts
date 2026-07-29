import { KADE_MOVES } from '@/src/data/combat-moves';
import type { CharacterId } from '@/src/data/characterRoster';
import { totalMoveFrames } from '@/src/sim';
import { asAttackPose } from './choreography';
import {
  BLADE_PHANTOM_CHOREOGRAPHY,
  VOID_WALKER_CHOREOGRAPHY,
  type Sequence,
} from './choreographySequences';
import type { RosterAttackPose } from './rosterPoseTools';

/**
 * Choreographed overrides, per character.
 *
 * Move ids are shared across the roster (`5H` is `5H` for everyone), so a
 * sequence has to be scoped to the character that owns the performance — the
 * blade string would look absurd on the character whose entire design pillar is
 * not moving.
 *
 * Anything not listed here falls through to the shared pose tables. That is the
 * intended end state, not a gap: choreography is expensive to author and is
 * spent on the moves a player sees most.
 */
export type ChoreographyTable = Readonly<Record<string, RosterAttackPose>>;

/** Real move lengths, so beat holds stay in true simulation frames. */
const MOVE_FRAMES = new Map(
  KADE_MOVES.map((move) => [move.id, totalMoveFrames(move)]),
);

function tableOf(sequences: readonly Sequence[]): ChoreographyTable {
  const table: Record<string, RosterAttackPose> = {};
  for (const sequence of sequences) {
    const frames = MOVE_FRAMES.get(sequence.moveId);
    if (frames === undefined) {
      // A sequence attached to a move that no longer exists would otherwise
      // fail silently as a frozen character.
      console.warn(
        `Choreography for unknown move "${sequence.moveId}" was skipped.`,
      );
      continue;
    }
    table[sequence.moveId] = asAttackPose(sequence, frames);
  }
  return table;
}

const BY_CHARACTER: Partial<Record<CharacterId, ChoreographyTable>> = {
  zoro: tableOf(BLADE_PHANTOM_CHOREOGRAPHY),
  'void-walker': tableOf(VOID_WALKER_CHOREOGRAPHY),
};

export function choreographyFor(
  characterId: CharacterId | undefined,
): ChoreographyTable | undefined {
  if (characterId === undefined) return undefined;
  return BY_CHARACTER[characterId];
}
