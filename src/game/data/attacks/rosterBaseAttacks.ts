import type { CharacterAttackSet } from '../../combat/AttackDefinition';
import type { CharacterDefinition, CombatStyle } from '../characters/circleFighters';
import { makeAttack } from './attackFactory';
import { createRosterActions } from './rosterActions';

const tuning: Record<CombatStyle, { startup: number; damage: number; reach: number }> = {
  heavy: { startup: 2, damage: 2, reach: 6 },
  balanced: { startup: 0, damage: 0, reach: 0 },
  rushdown: { startup: -1, damage: -1, reach: -5 },
  zoning: { startup: 1, damage: 0, reach: 15 },
};

export function createRosterBaseAttacks(character: CharacterDefinition): CharacterAttackSet {
  const adjust = tuning[character.combatStyle];
  const names = character.basicAttackNames;
  type Options = Omit<Parameters<typeof makeAttack>[2], 'name'>;
  const hit = (slot: string, name: string, options: Options) => makeAttack(
    character.id,
    slot,
    {
      ...options,
      name,
      startup: Math.max(3, options.startup + adjust.startup),
      damage: Math.max(3, options.damage + adjust.damage),
      reach: (options.reach ?? 74) + adjust.reach,
    },
  );
  const light1 = hit('light-1', names[0], {
    startup: 5, recovery: 8, damage: 6, action: 'LIGHT_ATTACK',
    category: 'light', reach: 64, motion: 'punch', visualShape: 'line',
    cancelInto: ['light', 'special'],
  });
  const light2 = hit('light-2', names[1], {
    startup: 6, recovery: 9, damage: 7, action: 'LIGHT_ATTACK',
    category: 'light', reach: 72, motion: 'front-kick', visualShape: 'arc',
    cancelInto: ['light', 'special'],
  });
  const light3 = hit('light-3', names[2], {
    startup: 8, active: 4, recovery: 14, damage: 10, action: 'LIGHT_ATTACK',
    category: 'light', reach: 82, motion: 'roundhouse-kick', visualShape: 'arc',
    knockbackX: 310, isFinisher: true,
  });
  const heavy1 = hit('heavy-1', names[3], {
    startup: 12, active: 5, recovery: 23, damage: 15, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 90, motion: 'slam', visualShape: 'burst',
    cancelInto: ['heavy', 'special'],
  });
  const heavy2 = hit('heavy-2', `${names[3]}: дуга`, {
    startup: 14, active: 5, recovery: 26, damage: 18, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 100, motion: 'axe-kick', visualShape: 'arc',
    cancelInto: ['heavy', 'special'],
  });
  const heavy3 = hit('heavy-3', `${names[3]}: финал`, {
    startup: 17, active: 6, recovery: 32, damage: 23, action: 'HEAVY_ATTACK',
    category: 'heavy', reach: 112, motion: 'slam', visualShape: 'burst',
    knockbackX: 490, knockdown: true, isFinisher: true,
  });

  return {
    lightChain: [light1, light2, light3],
    heavy: [heavy1, heavy2, heavy3],
    low: hit('low-light', names[4], {
      startup: 7, active: 4, recovery: 13, damage: 8, action: 'LIGHT_ATTACK',
      category: 'light', level: 'low', height: 26, reach: 76,
      motion: 'sweep-kick', visualShape: 'ground',
    }),
    lowHeavy: hit('low-heavy', `${names[4]}: размах`, {
      startup: 13, active: 5, recovery: 25, damage: 16, action: 'HEAVY_ATTACK',
      category: 'heavy', level: 'low', height: 30, reach: 94,
      motion: 'sweep-kick', visualShape: 'ground', knockdown: true,
    }),
    air: hit('air-light', names[5], {
      startup: 6, active: 6, recovery: 14, damage: 8, action: 'AIR_LIGHT',
      category: 'light', level: 'air', height: 48, reach: 70,
      motion: 'front-kick', visualShape: 'line',
    }),
    airHeavy: hit('air-heavy', `${names[5]}: метеор`, {
      startup: 11, active: 7, recovery: 23, damage: 16, action: 'AIR_HEAVY',
      category: 'heavy', level: 'air', height: 64, reach: 86,
      motion: 'axe-kick', visualShape: 'arc', knockdown: true, knockbackY: 290,
    }),
    forwardLight: hit('light-forward', `Вперёд: ${names[0]}`, {
      startup: 7, recovery: 12, damage: 9, action: 'DIRECTIONAL_LIGHT',
      category: 'light', reach: 88, motion: 'thrust', visualShape: 'line',
    }),
    retreatLight: hit('light-retreat', `Отход: ${names[0]}`, {
      startup: 6, recovery: 11, damage: 7, action: 'RETREAT_LIGHT',
      category: 'light', reach: 68, motion: 'front-kick', visualShape: 'line',
    }),
    dashLight: hit('light-dash', `Рывок: ${names[1]}`, {
      startup: 5, active: 5, recovery: 18, damage: 11, action: 'DASH_LIGHT',
      category: 'light', reach: 102, motion: 'front-kick', visualShape: 'line',
    }),
    forwardHeavy: hit('heavy-forward', `Вперёд: ${names[3]}`, {
      startup: 15, active: 6, recovery: 29, damage: 20, action: 'DIRECTIONAL_HEAVY',
      category: 'heavy', reach: 118, motion: 'slam', visualShape: 'burst', knockdown: true,
    }),
    retreatHeavy: hit('heavy-retreat', `Ответ: ${names[3]}`, {
      startup: 12, active: 5, recovery: 24, damage: 16, action: 'RETREAT_HEAVY',
      category: 'heavy', reach: 88, motion: 'roundhouse-kick', visualShape: 'arc',
    }),
    dashHeavy: hit('heavy-dash', `Таран: ${names[3]}`, {
      startup: 9, active: 7, recovery: 29, damage: 21, action: 'DASH_HEAVY',
      category: 'heavy', reach: 128, motion: 'slam', visualShape: 'burst', knockdown: true,
    }),
    ...createRosterActions(character, hit),
  };
}
