import { rosterEnd } from './rosterEnd';
import { rosterMiddle } from './rosterMiddle';
import { rosterStart } from './rosterStart';
import type { CharacterDefinition, CharacterId } from './characterTypes';

export type {
  CharacterDefinition,
  CharacterId,
  CharacterStats,
  CharacterVisualModel,
  CombatStyle,
  Difficulty,
  UniqueResource,
} from './characterTypes';
export { CHARACTER_IDS } from './characterTypes';

export const circleFighters: readonly CharacterDefinition[] = [
  ...rosterStart,
  ...rosterMiddle,
  ...rosterEnd,
];

const charactersById = new Map(circleFighters.map((fighter) => [fighter.id, fighter]));

export function getCharacter(characterId: string): CharacterDefinition {
  return charactersById.get(characterId as CharacterId) ?? circleFighters[0];
}
