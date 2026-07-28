import { describe, expect, it } from 'vitest';
import { circleFighters } from '../data/characters/circleFighters';
import {
  ADVANTAGE_BONUSES,
  FORCE_ORDER,
  characterMatchup,
  forceDistance,
  forceMatchup,
  matchupBonuses,
} from '../data/forceMatchups';

describe('15-force circular matchups', () => {
  it('keeps the fixed force and character order', () => {
    expect(FORCE_ORDER).toEqual([
      'Камень', 'Пистолет', 'Молния', 'Демон', 'Дракон',
      'Вода', 'Воздух', 'Бумага', 'Губка', 'Волк',
      'Дерево', 'Человек', 'Змея', 'Ножницы', 'Огонь',
    ]);
    expect(circleFighters).toHaveLength(15);
    circleFighters.forEach((fighter, index) => {
      expect(fighter.forceIndex).toBe(index);
      expect(fighter.force).toBe(FORCE_ORDER[index]);
    });
  });

  it('is mathematically symmetric in both directions', () => {
    circleFighters.forEach((player) => {
      circleFighters.forEach((opponent) => {
        const forward = forceDistance(player.forceIndex, opponent.forceIndex);
        const backward = forceDistance(opponent.forceIndex, player.forceIndex);
        expect((forward + backward) % FORCE_ORDER.length).toBe(0);
        if (player.id === opponent.id) {
          expect(forceMatchup(player.forceIndex, opponent.forceIndex)).toBe('NEUTRAL');
        } else {
          const relations = [
            forceMatchup(player.forceIndex, opponent.forceIndex),
            forceMatchup(opponent.forceIndex, player.forceIndex),
          ];
          expect(relations.sort()).toEqual(['ADVANTAGE', 'DISADVANTAGE']);
        }
      });
    });
  });

  it('gives every force exactly seven advantages and seven disadvantages', () => {
    circleFighters.forEach((player) => {
      const relations = circleFighters.map((opponent) =>
        characterMatchup(player.id, opponent.id).relation
      );
      expect(relations.filter((relation) => relation === 'ADVANTAGE')).toHaveLength(7);
      expect(relations.filter((relation) => relation === 'DISADVANTAGE')).toHaveLength(7);
      expect(relations.filter((relation) => relation === 'NEUTRAL')).toHaveLength(1);
    });
  });

  it('never creates mutual advantage', () => {
    circleFighters.forEach((first) => {
      circleFighters.forEach((second) => {
        const firstWins = characterMatchup(first.id, second.id).relation === 'ADVANTAGE';
        const secondWins = characterMatchup(second.id, first.id).relation === 'ADVANTAGE';
        expect(firstWins && secondWins).toBe(false);
      });
    });
  });

  it('never gives advantage against the same force', () => {
    circleFighters.forEach((fighter) => {
      expect(characterMatchup(fighter.id, fighter.id).relation).toBe('NEUTRAL');
      expect(matchupBonuses(fighter.id, fighter.id)).toEqual({
        damageMultiplier: 1,
        energyGainMultiplier: 1,
        blockDamageMultiplier: 1,
      });
    });
  });

  it('applies bonuses only to the advantaged side', () => {
    expect(matchupBonuses('granite', 'caliber')).toBe(ADVANTAGE_BONUSES);
    expect(matchupBonuses('caliber', 'granite')).toEqual({
      damageMultiplier: 1,
      energyGainMultiplier: 1,
      blockDamageMultiplier: 1,
    });
  });
});
