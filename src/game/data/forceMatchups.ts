import { getCharacter } from './characters/circleFighters';

export const FORCE_ORDER = [
  'Камень',
  'Пистолет',
  'Молния',
  'Демон',
  'Дракон',
  'Вода',
  'Воздух',
  'Бумага',
  'Губка',
  'Волк',
  'Дерево',
  'Человек',
  'Змея',
  'Ножницы',
  'Огонь',
] as const;

export type ForceName = (typeof FORCE_ORDER)[number];
export type MatchupRelation = 'ADVANTAGE' | 'DISADVANTAGE' | 'NEUTRAL';

export const ADVANTAGE_BONUSES = {
  damageMultiplier: 1.04,
  energyGainMultiplier: 1.05,
  blockDamageMultiplier: 1.05,
} as const;

const NEUTRAL_BONUSES = {
  damageMultiplier: 1,
  energyGainMultiplier: 1,
  blockDamageMultiplier: 1,
} as const;

export function forceDistance(playerIndex: number, opponentIndex: number) {
  return (opponentIndex - playerIndex + FORCE_ORDER.length) % FORCE_ORDER.length;
}

export function forceMatchup(playerIndex: number, opponentIndex: number): MatchupRelation {
  const distance = forceDistance(playerIndex, opponentIndex);
  if (distance === 0) return 'NEUTRAL';
  return distance <= 7 ? 'ADVANTAGE' : 'DISADVANTAGE';
}

export function characterMatchup(playerCharacterId: string, opponentCharacterId: string) {
  const player = getCharacter(playerCharacterId);
  const opponent = getCharacter(opponentCharacterId);
  return {
    player,
    opponent,
    distance: forceDistance(player.forceIndex, opponent.forceIndex),
    relation: forceMatchup(player.forceIndex, opponent.forceIndex),
  };
}

export function matchupBonuses(playerCharacterId: string, opponentCharacterId: string) {
  return characterMatchup(playerCharacterId, opponentCharacterId).relation === 'ADVANTAGE'
    ? ADVANTAGE_BONUSES
    : NEUTRAL_BONUSES;
}
