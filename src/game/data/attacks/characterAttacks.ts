import type { CharacterAttackSet } from '../../combat/AttackDefinition';
import { circleFighters, type CharacterId } from '../characters/circleFighters';
import { createGraniteAttacks } from './graniteAttacks';
import { createRosterBaseAttacks } from './rosterBaseAttacks';
import { createShiraAttacks } from './shiraAttacks';

export const characterAttacks = Object.fromEntries(
  circleFighters.map((character) => [
    character.id,
    character.id === 'granite'
      ? createGraniteAttacks()
      : character.id === 'shira'
        ? createShiraAttacks()
        : createRosterBaseAttacks(character),
  ]),
) as Record<CharacterId, CharacterAttackSet>;

export function getCharacterAttacks(characterId: string) {
  return characterAttacks[characterId as CharacterId] ?? characterAttacks.granite;
}

export function listCharacterAttacks(characterId: string) {
  const set = getCharacterAttacks(characterId);
  return [
    ...set.lightChain, ...set.heavy, set.low, set.lowHeavy, set.air, set.airHeavy,
    set.forwardLight, set.retreatLight, set.dashLight,
    set.forwardHeavy, set.retreatHeavy, set.dashHeavy,
    set.special, set.forwardSpecial, set.retreatSpecial, set.airSpecial,
    set.enhancedSpecial, set.grab, set.forwardThrow, set.backThrow,
    set.reversal, set.superAttack,
  ];
}

export function findCharacterAttack(characterId: string, attackId: string) {
  return listCharacterAttacks(characterId).find((attack) => attack.id === attackId) ?? null;
}
