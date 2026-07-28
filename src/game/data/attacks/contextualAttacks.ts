import { makeAttack } from './attackFactory';

export function createContextualAttacks(characterId: string) {
  return {
    forwardLight: makeAttack(characterId, 'light-forward', {
      startup: 6, active: 4, recovery: 12, damage: 7, action: 'DIRECTIONAL_LIGHT',
      category: 'light', reach: 96, knockbackX: 280, cancelInto: ['special'],
    }),
    retreatLight: makeAttack(characterId, 'light-retreat', {
      startup: 5, active: 3, recovery: 10, damage: 5, action: 'RETREAT_LIGHT',
      category: 'light', reach: 72, knockbackX: 230,
    }),
    dashLight: makeAttack(characterId, 'light-dash', {
      startup: 4, active: 5, recovery: 14, damage: 9, action: 'DASH_LIGHT',
      category: 'light', reach: 108, knockbackX: 330,
    }),
    airHeavy: makeAttack(characterId, 'heavy-air', {
      startup: 10, active: 6, recovery: 20, damage: 14, action: 'AIR_HEAVY',
      category: 'heavy', level: 'air', height: 64, knockbackY: 280, knockdown: true,
    }),
    forwardHeavy: makeAttack(characterId, 'heavy-forward', {
      startup: 11, active: 5, recovery: 21, damage: 15, action: 'DIRECTIONAL_HEAVY',
      category: 'heavy', reach: 118, knockbackX: 420, knockdown: true,
    }),
    retreatHeavy: makeAttack(characterId, 'heavy-retreat', {
      startup: 10, active: 4, recovery: 18, damage: 12, action: 'RETREAT_HEAVY',
      category: 'heavy', reach: 90, knockbackX: 350,
    }),
    dashHeavy: makeAttack(characterId, 'heavy-dash', {
      startup: 8, active: 6, recovery: 24, damage: 18, action: 'DASH_HEAVY',
      category: 'heavy', reach: 128, knockbackX: 490, knockdown: true,
    }),
    forwardSpecial: makeAttack(characterId, 'special-forward', {
      startup: 10, active: 7, recovery: 24, damage: 19, action: 'DIRECTIONAL_SPECIAL',
      category: 'special', reach: 145, knockbackX: 470, knockdown: true,
    }),
    retreatSpecial: makeAttack(characterId, 'special-retreat', {
      startup: 9, active: 6, recovery: 20, damage: 15, action: 'RETREAT_SPECIAL',
      category: 'special', reach: 105, knockbackX: 360,
    }),
    airSpecial: makeAttack(characterId, 'special-air', {
      startup: 9, active: 8, recovery: 22, damage: 17, action: 'AIR_SPECIAL',
      category: 'special', level: 'air', reach: 120, knockbackY: 300, knockdown: true,
    }),
    reversal: makeAttack(characterId, 'reversal', {
      startup: 3, active: 5, recovery: 26, damage: 13, action: 'MOMENTUM_REVERSAL',
      category: 'heavy', reach: 105, knockbackX: 460, knockdown: true,
      energyCost: 35,
    }),
  };
}
