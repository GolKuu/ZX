import type { CharacterAttackSet } from '../../combat/AttackDefinition';
import { makeAttack } from './attackFactory';
import { signatureSpecial } from './signatureSpecials';

const id = 'shira';
type NamedAttackOptions = Omit<Parameters<typeof makeAttack>[2], 'name'>;
const hit = (slot: string, name: string, options: NamedAttackOptions) =>
  makeAttack(id, slot, { ...options, name });

export function createShiraAttacks(): CharacterAttackSet {
  const light1 = hit('light-1', 'Щёлк', {
    startup: 3, recovery: 6, damage: 4, action: 'LIGHT_ATTACK',
    category: 'light', reach: 55, cancelInto: ['light', 'special'],
  });
  const light2 = hit('light-2', 'Ножничный сайд-кик', {
    startup: 4, recovery: 7, damage: 5, action: 'LIGHT_ATTACK',
    category: 'light', reach: 61, cancelInto: ['light', 'special'],
    motion: 'roundhouse-kick', visualShape: 'arc',
  });
  const light3 = hit('light-3', 'Срез ленты', {
    startup: 5, active: 4, recovery: 10, damage: 7, action: 'LIGHT_ATTACK',
    category: 'light', reach: 66, knockbackX: 270, isFinisher: true,
  });
  const heavy1 = hit('heavy-1', 'Дуга гильотины', {
    startup: 8, active: 4, recovery: 16, damage: 11, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 72, cancelInto: ['heavy', 'special'],
  });
  const heavy2 = hit('heavy-2', 'Двойной срез', {
    startup: 9, active: 5, recovery: 18, damage: 13, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 76, cancelInto: ['heavy', 'special'],
  });
  const heavy3 = hit('heavy-3', 'Последний шов', {
    startup: 11, active: 5, recovery: 23, damage: 17, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 82, knockbackX: 430, knockdown: true,
    isFinisher: true, hitStop: 7,
  });
  return {
    lightChain: [light1, light2, light3],
    heavy: [heavy1, heavy2, heavy3],
    low: hit('low-light', 'Подрез нити', {
      startup: 5, active: 4, recovery: 10, damage: 6, action: 'LIGHT_ATTACK',
      category: 'light', level: 'low', height: 24, reach: 64, knockbackX: 220,
      motion: 'sweep-kick', visualShape: 'ground',
    }),
    lowHeavy: hit('low-heavy', 'Раскрытые лезвия', {
      startup: 9, active: 5, recovery: 18, damage: 12, action: 'HEAVY_ATTACK',
      category: 'heavy', level: 'low', height: 28, reach: 78,
      knockbackX: 340, knockdown: true,
    }),
    air: hit('air-light', 'Воздушный штрих', {
      startup: 4, active: 6, recovery: 10, damage: 6, action: 'AIR_LIGHT',
      category: 'light', level: 'air', height: 46, reach: 58, knockbackY: 140,
    }),
    airHeavy: hit('air-heavy', 'Падающие ножницы', {
      startup: 8, active: 7, recovery: 18, damage: 13, action: 'AIR_HEAVY',
      category: 'heavy', level: 'air', height: 62, reach: 76,
      knockbackY: 280, knockdown: true,
      motion: 'axe-kick', visualShape: 'arc',
    }),
    ...createShiraContext(),
  };
}

function createShiraContext() {
  return {
    forwardLight: hit('light-forward', 'Укол остриём', {
      startup: 4, active: 4, recovery: 9, damage: 6, action: 'DIRECTIONAL_LIGHT',
      category: 'light', reach: 73, knockbackX: 260, cancelInto: ['special'],
    }),
    retreatLight: hit('light-retreat', 'Обратный щелчок', {
      startup: 3, active: 3, recovery: 8, damage: 5, action: 'RETREAT_LIGHT',
      category: 'light', reach: 56, knockbackX: 210,
    }),
    dashLight: hit('light-dash', 'Стежок на ходу', {
      startup: 3, active: 5, recovery: 15, damage: 9, action: 'DASH_LIGHT',
      category: 'light', reach: 84, knockbackX: 330,
      motion: 'front-kick', visualShape: 'line',
    }),
    forwardHeavy: hit('heavy-forward', 'Длинный крой', {
      startup: 10, active: 5, recovery: 20, damage: 15, action: 'DIRECTIONAL_HEAVY',
      category: 'heavy', reach: 88, knockbackX: 390, knockdown: true,
    }),
    retreatHeavy: hit('heavy-retreat', 'Распарыватель', {
      startup: 8, active: 4, recovery: 17, damage: 12, action: 'RETREAT_HEAVY',
      category: 'heavy', reach: 72, knockbackX: 330,
    }),
    dashHeavy: hit('heavy-dash', 'Скользящий разрез', {
      startup: 6, active: 6, recovery: 25, damage: 16, action: 'DASH_HEAVY',
      category: 'heavy', reach: 96, knockbackX: 460, knockdown: true,
      movementSpeed: 310,
    }),
    ...createShiraPowers(),
  };
}

function createShiraPowers() {
  const { name, ...signature } = signatureSpecial(id);
  return {
    special: hit('special-neutral', name, {
      ...signature, action: 'SPECIAL_ATTACK', category: 'special',
    }),
    forwardSpecial: hit('special-forward', 'Ножничный рывок', {
      startup: 5, active: 8, recovery: 24, damage: 17, action: 'DIRECTIONAL_SPECIAL',
      category: 'special', reach: 104, knockbackX: 450, knockdown: true,
    }),
    retreatSpecial: hit('special-retreat', 'Обратный стежок', {
      startup: 6, active: 6, recovery: 17, damage: 13, action: 'RETREAT_SPECIAL',
      category: 'special', reach: 78, knockbackX: 320,
    }),
    airSpecial: hit('special-air', 'Раскрой в падении', {
      startup: 6, active: 8, recovery: 18, damage: 15, action: 'AIR_SPECIAL',
      category: 'special', level: 'air', reach: 84, height: 60,
      knockbackY: 290, knockdown: true,
    }),
    enhancedSpecial: hit('enhanced-special', 'Идеальная кромка', {
      startup: 4, active: 12, recovery: 20, damage: 25, action: 'SPECIAL_ATTACK',
      category: 'special', reach: 116, knockbackX: 520, knockdown: true, hitStop: 9,
    }),
    grab: hit('grab', 'Зажим', {
      startup: 5, active: 2, recovery: 14, damage: 3, action: 'GRAB',
      category: 'throw', level: 'throw', reach: 52,
    }),
    forwardThrow: hit('throw-forward', 'Отрезанный путь', {
      startup: 7, active: 2, recovery: 20, damage: 12, action: 'GRAB',
      category: 'throw', level: 'throw', reach: 55, knockbackX: 430, knockdown: true,
    }),
    backThrow: hit('throw-back', 'Перекройка', {
      startup: 7, active: 2, recovery: 21, damage: 12, action: 'GRAB',
      category: 'throw', level: 'throw', reach: 55, knockbackX: 370,
      knockdown: true, sideSwitch: true,
    }),
    reversal: hit('momentum-reversal', 'Резкий возврат', {
      startup: 3, active: 5, recovery: 22, damage: 12, action: 'MOMENTUM_REVERSAL',
      category: 'heavy', reach: 82, knockbackX: 430, knockdown: true, energyCost: 35,
    }),
    superAttack: hit('super', 'Нулевая линия', {
      startup: 8, active: 13, recovery: 34, damage: 34, action: 'SUPER_ATTACK',
      category: 'super', reach: 158, height: 70, knockbackX: 590,
      knockbackY: 250, knockdown: true, energyCost: 100, hitStop: 12,
    }),
  };
}
