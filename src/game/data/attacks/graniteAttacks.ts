import type { CharacterAttackSet } from '../../combat/AttackDefinition';
import { makeAttack } from './attackFactory';

const id = 'granite';
type NamedAttackOptions = Omit<Parameters<typeof makeAttack>[2], 'name'>;
const hit = (slot: string, name: string, options: NamedAttackOptions) =>
  makeAttack(id, slot, { ...options, name });

export function createGraniteAttacks(): CharacterAttackSet {
  const light1 = hit('light-1', 'Скол', {
    startup: 6, recovery: 10, damage: 7, action: 'LIGHT_ATTACK',
    category: 'light', reach: 70, cancelInto: ['light', 'special'],
  });
  const light2 = hit('light-2', 'Каменное плечо', {
    startup: 7, recovery: 12, damage: 8, action: 'LIGHT_ATTACK',
    category: 'light', reach: 78, cancelInto: ['light', 'special'],
  });
  const light3 = hit('light-3', 'Клин', {
    startup: 9, active: 4, recovery: 17, damage: 11, action: 'LIGHT_ATTACK',
    category: 'light', reach: 88, knockbackX: 330, knockdown: true, isFinisher: true,
  });
  const heavy1 = hit('heavy-1', 'Монолитный кулак', {
    startup: 13, active: 5, recovery: 27, damage: 17, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 92, hitStop: 7, cancelInto: ['heavy', 'special'], armor: true,
  });
  const heavy2 = hit('heavy-2', 'Обвальный крюк', {
    startup: 16, active: 6, recovery: 31, damage: 20, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 104, hitStop: 8, cancelInto: ['heavy', 'special'], armor: true,
  });
  const heavy3 = hit('heavy-3', 'Молот карьера', {
    startup: 20, active: 7, recovery: 38, damage: 27, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 116, knockbackX: 520, knockdown: true,
    isFinisher: true, hitStop: 10, armor: true,
  });
  return {
    lightChain: [light1, light2, light3],
    heavy: [heavy1, heavy2, heavy3],
    low: hit('low-light', 'Сланцевый подсек', {
      startup: 9, active: 4, recovery: 17, damage: 9, action: 'LIGHT_ATTACK',
      category: 'light', level: 'low', height: 26, reach: 82, knockbackX: 260,
    }),
    lowHeavy: hit('low-heavy', 'Разлом снизу', {
      startup: 15, active: 6, recovery: 29, damage: 18, action: 'HEAVY_ATTACK',
      category: 'heavy', level: 'low', height: 30, reach: 105,
      knockbackX: 380, knockdown: true, hitStop: 8,
    }),
    air: hit('air-light', 'Падающий осколок', {
      startup: 7, active: 6, recovery: 17, damage: 9, action: 'AIR_LIGHT',
      category: 'light', level: 'air', height: 48, reach: 72, knockbackY: 170,
    }),
    airHeavy: hit('air-heavy', 'Пятка-метеор', {
      startup: 13, active: 7, recovery: 27, damage: 18, action: 'AIR_HEAVY',
      category: 'heavy', level: 'air', height: 68, reach: 94,
      knockbackY: 320, knockdown: true, hitStop: 8,
    }),
    ...createGraniteContext(),
  };
}

function createGraniteContext() {
  return {
    forwardLight: hit('light-forward', 'Таран плечом', {
      startup: 8, active: 5, recovery: 16, damage: 10, action: 'DIRECTIONAL_LIGHT',
      category: 'light', reach: 98, knockbackX: 320, cancelInto: ['special'],
    }),
    retreatLight: hit('light-retreat', 'Крошка назад', {
      startup: 7, recovery: 14, damage: 8, action: 'RETREAT_LIGHT',
      category: 'light', reach: 76, knockbackX: 240,
    }),
    dashLight: hit('light-dash', 'Гранёный таран', {
      startup: 6, active: 6, recovery: 22, damage: 13, action: 'DASH_LIGHT',
      category: 'light', reach: 112, knockbackX: 390,
    }),
    forwardHeavy: hit('heavy-forward', 'Каменная балка', {
      startup: 17, active: 6, recovery: 34, damage: 22, action: 'DIRECTIONAL_HEAVY',
      category: 'heavy', reach: 126, knockbackX: 470, knockdown: true, hitStop: 9,
    }),
    retreatHeavy: hit('heavy-retreat', 'Контрплита', {
      startup: 14, active: 5, recovery: 29, damage: 18, action: 'RETREAT_HEAVY',
      category: 'heavy', reach: 92, knockbackX: 400, armor: true,
    }),
    dashHeavy: hit('heavy-dash', 'Каменный рывок', {
      startup: 10, active: 8, recovery: 34, damage: 23, action: 'DASH_HEAVY',
      category: 'heavy', reach: 138, knockbackX: 540, knockdown: true,
      movementSpeed: 260, hitStop: 9, armor: true,
    }),
    ...createGranitePowers(),
  };
}

function createGranitePowers() {
  return {
    special: hit('special-neutral', 'Эхо земли', {
      startup: 18, active: 8, recovery: 34, damage: 22, action: 'SPECIAL_ATTACK',
      category: 'special', level: 'low', reach: 142, height: 32,
      knockbackX: 430, knockdown: true, hitStop: 9,
    }),
    forwardSpecial: hit('special-forward', 'Живой валун', {
      startup: 13, active: 9, recovery: 32, damage: 21, action: 'DIRECTIONAL_SPECIAL',
      category: 'special', reach: 152, knockbackX: 520, knockdown: true, armor: true,
    }),
    retreatSpecial: hit('special-retreat', 'Курганная стойка', {
      startup: 9, active: 5, recovery: 24, damage: 15, action: 'RETREAT_SPECIAL',
      category: 'special', reach: 104, knockbackX: 410, armor: true,
    }),
    airSpecial: hit('special-air', 'Метеоритная посадка', {
      startup: 12, active: 9, recovery: 30, damage: 20, action: 'AIR_SPECIAL',
      category: 'special', level: 'air', reach: 116, height: 70,
      knockbackY: 350, knockdown: true,
    }),
    enhancedSpecial: hit('enhanced-special', 'Живой разлом', {
      startup: 12, active: 10, recovery: 30, damage: 31, action: 'SPECIAL_ATTACK',
      category: 'special', reach: 176, height: 40, knockbackX: 570,
      knockdown: true, hitStop: 11,
    }),
    grab: hit('grab', 'Хват коренной породы', {
      startup: 7, active: 2, recovery: 19, damage: 4, action: 'GRAB',
      category: 'throw', level: 'throw', reach: 55,
    }),
    forwardThrow: hit('throw-forward', 'Сброс породы', {
      startup: 9, active: 2, recovery: 27, damage: 16, action: 'GRAB',
      category: 'throw', level: 'throw', reach: 58, knockbackX: 480, knockdown: true,
    }),
    backThrow: hit('throw-back', 'Переворот пласта', {
      startup: 10, active: 2, recovery: 29, damage: 17, action: 'GRAB',
      category: 'throw', level: 'throw', reach: 58, knockbackX: 410,
      knockdown: true, sideSwitch: true,
    }),
    reversal: hit('momentum-reversal', 'Ответ материка', {
      startup: 3, active: 6, recovery: 29, damage: 15, action: 'MOMENTUM_REVERSAL',
      category: 'heavy', reach: 110, knockbackX: 470, knockdown: true,
      energyCost: 35, armor: true,
    }),
    superAttack: hit('super', 'Гора помнит', {
      startup: 12, active: 11, recovery: 42, damage: 39, action: 'SUPER_ATTACK',
      category: 'super', reach: 190, height: 78, knockbackX: 620,
      knockbackY: 300, knockdown: true, energyCost: 100, hitStop: 14,
    }),
  };
}
