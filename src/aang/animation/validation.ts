import type { AangMove } from '../types';
import { getEffectAnimation } from './effects';
import { AANG_MOTIONS } from './motions';

export function validateAangAnimations(moves: readonly AangMove[]): void {
  const ids = new Set<string>();
  for (const move of moves) {
    if (ids.has(move.id)) {
      throw new Error(`Duplicate Aang move id: ${move.id}`);
    }
    ids.add(move.id);

    const motion = AANG_MOTIONS[move.id];
    if (motion === undefined) {
      throw new Error(`Aang move has no animation: ${move.id}`);
    }
    getEffectAnimation(motion.effect);
  }

  const orphaned = Object.keys(AANG_MOTIONS).filter((id) => !ids.has(id));
  if (orphaned.length > 0) {
    throw new Error(`Orphaned Aang animations: ${orphaned.join(', ')}`);
  }
}
