import type { CharacterId } from './characterRoster';

/**
 * Optional rigged model URL per active character.
 *
 * An absent entry keeps the hand-authored primitive fighter. New models can be
 * added without changing selection or combat code.
 */
export const CHARACTER_MODELS: Partial<Record<CharacterId, string>> = {};

export function modelUrlFor(characterId: CharacterId): string | null {
  return CHARACTER_MODELS[characterId] ?? null;
}
