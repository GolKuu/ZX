import type { MoveFrameData } from '../sim/frame-data.js';
import type { AiLoadout, AiMoveOption } from './types.js';

export function validateAiLoadout(
  loadout: AiLoadout,
  moves: ReadonlyMap<string, MoveFrameData>,
): void {
  validateOptions(loadout.neutral, 'neutral', moves);
  validateOptions(loadout.whiffPunishes, 'whiffPunishes', moves);
  for (const [routeIndex, route] of loadout.combos.entries()) {
    if (route.moves.length < 2) {
      throw new Error(`combos[${routeIndex}] must contain at least two moves`);
    }
    route.moves.forEach((moveId) => assertMove(moveId, moves));
    for (let index = 0; index < route.moves.length - 1; index += 1) {
      const moveId = route.moves[index];
      const targetId = route.moves[index + 1];
      const move = moveId === undefined ? undefined : moves.get(moveId);
      const canCancel = move?.cancels?.some((cancel) =>
        targetId === undefined ? false : cancel.into.includes(targetId),
      );
      if (!canCancel) {
        throw new Error(`Combo route cannot cancel ${moveId} into ${targetId}`);
      }
    }
  }
}

function validateOptions(
  options: readonly AiMoveOption[],
  label: string,
  moves: ReadonlyMap<string, MoveFrameData>,
): void {
  if (options.length === 0) {
    throw new Error(`${label} must contain at least one move`);
  }
  options.forEach((option, index) => {
    assertMove(option.moveId, moves);
    if (
      !Number.isSafeInteger(option.minimumDistance)
      || option.minimumDistance < 0
      || !Number.isSafeInteger(option.maximumDistance)
      || option.maximumDistance < option.minimumDistance
    ) {
      throw new Error(`${label}[${index}] has an invalid distance range`);
    }
    if (!Number.isSafeInteger(option.weight) || option.weight <= 0) {
      throw new Error(`${label}[${index}].weight must be positive`);
    }
    if (option.cue.length === 0) {
      throw new Error(`${label}[${index}].cue cannot be empty`);
    }
  });
}

function assertMove(
  moveId: string,
  moves: ReadonlyMap<string, MoveFrameData>,
): void {
  if (!moves.has(moveId)) {
    throw new Error(`AI loadout references unknown move "${moveId}"`);
  }
}
