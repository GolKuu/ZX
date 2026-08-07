import type { CharacterId } from '../data/characterRoster.js';
import { sequenceTechniquesFor } from '../data/sequenceTechniques.js';
import type { CommandContext, CommandRow } from './command.js';

export function withSequenceCommands(
  characterId: CharacterId,
  baseRows: readonly CommandRow[],
): readonly CommandRow[] {
  const sequenceRows = sequenceTechniquesFor(characterId).map((technique) => {
    const source = baseRows.find((row) => row.moveId === technique.baseMoveId);
    if (source === undefined) {
      throw new Error(`Sequence technique "${technique.moveId}" has no base command`);
    }
    const available = (context: CommandContext): boolean => {
      const progressionReady = context.activeProgressionNodes === undefined
        || context.activeProgressionNodes.has(technique.unlockNodeId);
      return progressionReady && (source.available?.(context) ?? true);
    };
    const commit = technique.sequence[1];
    return {
      moveId: technique.moveId,
      motion: 'none' as const,
      button: commit,
      stance: 'any' as const,
      attackSequence: technique.sequence,
      sequenceWindowFrames: 22,
      sequenceMinGapFrames: 3,
      displayName: technique.name,
      description: technique.description,
      unlockNodeId: technique.unlockNodeId,
      available,
    } satisfies CommandRow;
  });
  return [...sequenceRows, ...baseRows];
}
