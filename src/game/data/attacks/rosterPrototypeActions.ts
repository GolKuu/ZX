import type { AttackDefinition } from '../../combat/AttackDefinition';
import type { CharacterDefinition } from '../characters/circleFighters';
import type { makeAttack } from './attackFactory';

type RosterHit = (
  slot: string,
  name: string,
  options: Omit<Parameters<typeof makeAttack>[2], 'name'>,
) => AttackDefinition;

export function createPrototypeActions(character: CharacterDefinition, hit: RosterHit) {
  const force = character.force;
  return {
    special: hit('special-neutral', `Импульс: ${force}`, {
      startup: 14, active: 7, recovery: 28, damage: 18, action: 'SPECIAL_ATTACK',
      category: 'special', reach: 120, motion: 'burst', visualShape: 'burst',
    }),
    forwardSpecial: hit('special-forward', `Порыв: ${force}`, {
      startup: 12, active: 8, recovery: 28, damage: 19, action: 'DIRECTIONAL_SPECIAL',
      category: 'special', reach: 138, motion: 'thrust', visualShape: 'projectile',
    }),
    retreatSpecial: hit('special-retreat', `Заслон: ${force}`, {
      startup: 10, active: 6, recovery: 24, damage: 15, action: 'RETREAT_SPECIAL',
      category: 'special', reach: 98, motion: 'burst', visualShape: 'arc',
    }),
    airSpecial: hit('special-air', `Сверху: ${force}`, {
      startup: 10, active: 8, recovery: 25, damage: 17, action: 'AIR_SPECIAL',
      category: 'special', level: 'air', reach: 105, motion: 'axe-kick',
      visualShape: 'burst', knockdown: true,
    }),
    enhancedSpecial: hit('enhanced-special', `Усиление: ${force}`, {
      startup: 9, active: 9, recovery: 27, damage: 27, action: 'SPECIAL_ATTACK',
      category: 'special', reach: 155, motion: 'burst', visualShape: 'burst',
      energyCost: 50, knockdown: true,
    }),
    grab: hit('grab', 'Захват', {
      startup: 6, active: 2, recovery: 16, damage: 4, action: 'GRAB',
      category: 'throw', level: 'throw', reach: 52, motion: 'throw',
    }),
    forwardThrow: hit('throw-forward', 'Бросок вперёд', {
      startup: 8, active: 2, recovery: 23, damage: 14, action: 'GRAB',
      category: 'throw', level: 'throw', reach: 56, motion: 'throw', knockdown: true,
    }),
    backThrow: hit('throw-back', 'Бросок назад', {
      startup: 8, active: 2, recovery: 24, damage: 14, action: 'GRAB',
      category: 'throw', level: 'throw', reach: 56, motion: 'throw',
      knockdown: true, sideSwitch: true,
    }),
    reversal: hit('momentum-reversal', 'Базовый возврат', {
      startup: 3, active: 5, recovery: 25, damage: 13, action: 'MOMENTUM_REVERSAL',
      category: 'heavy', reach: 96, motion: 'roundhouse-kick', visualShape: 'arc',
      knockdown: true, energyCost: 35,
    }),
    superAttack: hit('super', `Круг силы: ${force}`, {
      startup: 11, active: 10, recovery: 38, damage: 36, action: 'SUPER_ATTACK',
      category: 'super', reach: 175, height: 74, motion: 'burst',
      visualShape: 'burst', knockdown: true, energyCost: 100,
    }),
  };
}
