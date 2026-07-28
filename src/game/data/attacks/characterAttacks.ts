import type { CharacterAttackSet } from '../../combat/AttackDefinition';
import { createGraniteAttacks } from './graniteAttacks';
import { createShiraAttacks } from './shiraAttacks';

export const characterAttacks: Record<string, CharacterAttackSet> = {
  granite: createGraniteAttacks(),
  shira: createShiraAttacks(),
};

export function getCharacterAttacks(characterId: string) {
  return characterAttacks[characterId] ?? characterAttacks.granite;
}
