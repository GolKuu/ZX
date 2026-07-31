import type { MoveFrameData } from '../sim/frame-data.js';
import type { DeterministicRandom } from './rng.js';
import type { AiMoveOption } from './types.js';

export function chooseMove(
  options: readonly AiMoveOption[],
  distance: number,
  moves: ReadonlyMap<string, MoveFrameData>,
  random: DeterministicRandom,
  resource = 0,
): AiMoveOption | null {
  const viable = options.filter(
    (option) =>
      distance >= option.minimumDistance
      && distance <= option.maximumDistance
      && resource >= (option.minimumResource ?? 0)
      && moves.has(option.moveId),
  );
  const totalWeight = viable.reduce((total, option) => total + option.weight, 0);
  if (totalWeight === 0) {
    return null;
  }
  let roll = random.integer(totalWeight);
  for (const option of viable) {
    if (roll < option.weight) {
      return option;
    }
    roll -= option.weight;
  }
  return viable[viable.length - 1] ?? null;
}
