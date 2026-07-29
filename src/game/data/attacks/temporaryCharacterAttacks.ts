import type { CharacterAttackSet } from '../../combat/AttackDefinition';
import { makeAttack } from './attackFactory';

function createAttackSet(characterId: string): CharacterAttackSet {
  const light1 = makeAttack(characterId, 'light-1', {
    startup: 4, recovery: 8, damage: 5, action: 'LIGHT_ATTACK',
    category: 'light', cancelInto: ['light', 'special'],
  });
  const light2 = makeAttack(characterId, 'light-2', {
    startup: 5, recovery: 9, damage: 6, action: 'LIGHT_ATTACK',
    category: 'light', cancelInto: ['light', 'special'],
  });
  const light3 = makeAttack(characterId, 'light-3', {
    startup: 6, active: 4, recovery: 14, damage: 8, action: 'LIGHT_ATTACK',
    category: 'light', knockbackX: 300, knockdown: true,
  });
  const heavy1 = makeAttack(characterId, 'heavy-1', {
    startup: 9, active: 4, recovery: 18, damage: 12, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 88, cancelInto: ['special'],
  });
  const heavy2 = makeAttack(characterId, 'heavy-2', {
    startup: 13, active: 5, recovery: 23, damage: 16, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 104, knockbackX: 390, knockdown: true,
  });
  const low = makeAttack(characterId, 'low', {
    startup: 7, active: 4, recovery: 15, damage: 8, action: 'LIGHT_ATTACK',
    category: 'light', level: 'low', height: 28, knockbackX: 250,
  });
  const air = makeAttack(characterId, 'air', {
    startup: 6, active: 6, recovery: 15, damage: 9, action: 'LIGHT_ATTACK',
    category: 'light', level: 'air', height: 52, knockbackY: 220,
  });
  const special = makeAttack(characterId, 'special', {
    startup: 12, active: 6, recovery: 24, damage: 18, action: 'SPECIAL_ATTACK',
    category: 'special', reach: 125, knockbackX: 440, knockdown: true,
  });
  const grab = makeAttack(characterId, 'grab', {
    startup: 6, active: 2, recovery: 17, damage: 4, action: 'GRAB',
    category: 'throw', level: 'throw', reach: 54,
  });
  const forwardThrow = makeAttack(characterId, 'throw-forward', {
    startup: 8, active: 2, recovery: 24, damage: 14, action: 'GRAB',
    category: 'throw', level: 'throw', reach: 58, knockbackX: 470, knockdown: true,
  });
  const backThrow = makeAttack(characterId, 'throw-back', {
    startup: 9, active: 2, recovery: 26, damage: 14, action: 'GRAB',
    category: 'throw', level: 'throw', reach: 58, knockbackX: 390,
    knockdown: true, sideSwitch: true,
  });
  const superAttack = makeAttack(characterId, 'super', {
    startup: 10, active: 8, recovery: 32, damage: 28, action: 'SUPER_ATTACK',
    category: 'super', reach: 150, knockbackX: 560, knockbackY: 260,
    knockdown: true, energyCost: 100,
  });
  return {
    lightChain: [light1, light2, light3],
    heavy: [heavy1, heavy2],
    low,
    air,
    special,
    grab,
    forwardThrow,
    backThrow,
    superAttack,
  };
}

export const temporaryCharacterAttacks: Record<string, CharacterAttackSet> = {
  comet: createAttackSet('comet'),
  pulse: createAttackSet('pulse'),
};

export function getCharacterAttacks(characterId: string) {
  return temporaryCharacterAttacks[characterId] ?? temporaryCharacterAttacks.comet;
}
