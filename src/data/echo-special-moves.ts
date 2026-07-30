import type { MoveFrameData } from '../sim/frame-data.js';

export const ECHO_SPECIAL_MOVE_IDS = {
  patternScan: 'echo.special.pattern-scan',
  behavioralMirror: 'echo.special.behavioral-mirror',
  predictionLock: 'echo.special.prediction-lock',
} as const;

/**
 * Echo's specials are presentation actions, not extra attacks. They create no
 * hitbox, spend no meter, and never alter the opponent or existing frame data.
 */
export const ECHO_SPECIAL_MOVES: readonly MoveFrameData[] = [
  visualMove(ECHO_SPECIAL_MOVE_IDS.patternScan, 8, 18, 12),
  visualMove(ECHO_SPECIAL_MOVE_IDS.behavioralMirror, 10, 22, 14),
  visualMove(ECHO_SPECIAL_MOVE_IDS.predictionLock, 9, 20, 13),
];

export function isEchoSpecialMove(moveId: string | undefined): boolean {
  return moveId !== undefined
    && Object.values(ECHO_SPECIAL_MOVE_IDS).includes(
      moveId as (typeof ECHO_SPECIAL_MOVE_IDS)[keyof typeof ECHO_SPECIAL_MOVE_IDS],
    );
}

function visualMove(
  id: string,
  startup: number,
  active: number,
  recovery: number,
): MoveFrameData {
  return {
    id,
    startup,
    active,
    recovery,
    hitboxes: [],
  };
}
