import type {
  BalanceViolation,
  CharacterSummary,
  PairSummary,
} from './BalanceTypes';

export const BALANCE_TARGETS = {
  neutral: [48, 52] as [number, number],
  advantage: [52, 57] as [number, number],
  pairFloor: [40, 60] as [number, number],
  character: [47, 53] as [number, number],
};

export function evaluateBalance(
  pairs: PairSummary[],
  characters: CharacterSummary[],
) {
  const violations: BalanceViolation[] = [];
  pairs.forEach((pair) => {
    const id = `${pair.characterA}-vs-${pair.characterB}`;
    if (pair.relationA === 'NEUTRAL') {
      addOutside(violations, 'pair', id, BALANCE_TARGETS.neutral,
        pair.trackedWinRate, 'Нейтральный матч вне 48–52%.');
    } else if (pair.advantageWinRate !== null) {
      addOutside(violations, 'pair', id, BALANCE_TARGETS.advantage,
        pair.advantageWinRate, 'Матч с преимуществом вне 52–57%.');
    }
    addOutside(violations, 'pair', id, BALANCE_TARGETS.pairFloor,
      pair.trackedWinRate, 'Пара стабильно выходит за пределы 60–40%.');
  });
  characters.forEach((character) => {
    addOutside(
      violations,
      'character',
      character.character,
      BALANCE_TARGETS.character,
      character.winRate,
      'Общий win rate персонажа вне 47–53%.',
    );
  });
  return violations;
}

function addOutside(
  violations: BalanceViolation[],
  scope: BalanceViolation['scope'],
  id: string,
  target: [number, number],
  actual: number,
  message: string,
) {
  if (actual >= target[0] && actual <= target[1]) return;
  violations.push({
    scope,
    id,
    target: `${target[0]}–${target[1]}%`,
    actual,
    message,
  });
}
