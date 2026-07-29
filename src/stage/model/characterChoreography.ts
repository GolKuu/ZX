import type { CharacterId } from '@/src/data/characterRoster';
import { asAttackPose } from './choreography';
import {
  BLADE_PHANTOM_CHOREOGRAPHY,
  VOID_WALKER_CHOREOGRAPHY,
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

function tableOf(
  sequences: readonly { moveId: string }[],
): ChoreographyTable {
  const table: Record<string, RosterAttackPose> = {};
  for (const sequence of sequences) {
    // `asAttackPose` needs the full sequence type; the narrowed parameter above
    // only exists to keep the map generic.
    table[sequence.moveId] = asAttackPose(
      sequence as Parameters<typeof asAttackPose>[0],
    );
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
