import type { MoveFrameData } from '@/src/sim/frame-data';
import type { FighterSnapshot } from '@/src/sim/state';

/**
 * Neutral fighters may attack. Active animations and stun lock attack input,
 * except for an authored cancel window after the current move made contact.
 */
export function isAttackInputLocked(
  fighter: FighterSnapshot,
  moves: readonly MoveFrameData[],
  contactedActionSerial: number | undefined,
): boolean {
  if (fighter.health === 0 || fighter.hitstop > 0 || fighter.hitstun > 0) {
    return true;
  }

  const action = fighter.action;
  if (action === null) {
    return false;
  }
  if (contactedActionSerial !== action.serial) {
    return true;
  }

  const move = moves.find((entry) => entry.id === action.moveId);
  const cancelOpen = move?.cancels?.some(
    (cancel) =>
      action.frame >= cancel.frames.from
      && action.frame < cancel.frames.toExclusive,
  );
  return cancelOpen !== true;
}
