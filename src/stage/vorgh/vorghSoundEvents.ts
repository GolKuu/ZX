import { VORGH_MOVE_SPECS } from '../../data/vorgh/index.js';

export type VorghSoundKind = 'claw' | 'impact' | 'roar' | 'dash' | 'super';

export const VORGH_SOUND_EVENTS: Readonly<Record<string, VorghSoundKind>> =
  Object.fromEntries(
    VORGH_MOVE_SPECS.map(({ move }) => [move.id, soundFor(move.id)]),
  );

function soundFor(moveId: string): VorghSoundKind {
  if (moveId.includes('super') || moveId.includes('ultimate')) return 'super';
  if (moveId.includes('roar') || moveId.includes('unchained')) return 'roar';
  if (moveId.includes('dash') || moveId.includes('leap')) return 'dash';
  if (moveId.includes('ram') || moveId.includes('breaker')) return 'impact';
  return 'claw';
}
