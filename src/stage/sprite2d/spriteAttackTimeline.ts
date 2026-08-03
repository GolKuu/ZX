export type SpriteAttackPhase = 'approach' | 'strike' | 'return';
export type SpriteAttackStep = 1 | 2 | 3 | 4;

export interface SpriteAttackTiming {
  readonly active: number;
  readonly recovery: number;
  readonly startup: number;
}

export interface SpriteAttackBeat {
  /**
   * How much of the attack pose remains on screen.
   *
   * Approach: 0.25, 0.5, 0.75, 1.
   * Strike: 1 (the clean whole-body attack drawing replaces the rig).
   * Return: 0.75, 0.5, 0.25, 0.
   */
  readonly amount: number;
  readonly phase: SpriteAttackPhase;
  readonly step: SpriteAttackStep;
}

/**
 * Turn simulation frames into a deliberately small fighting-game frame set.
 *
 * Move timing is untouched. A long startup or recovery holds each drawing for
 * several 60 Hz ticks, while a short move still advances through the same four
 * readable poses.
 */
export function spriteAttackBeat(
  frame: number,
  timing: SpriteAttackTiming,
): SpriteAttackBeat {
  if (frame < timing.startup) {
    const step = quantizedStep(frame, timing.startup);
    return { amount: step / 4, phase: 'approach', step };
  }

  if (frame < timing.startup + timing.active) {
    return { amount: 1, phase: 'strike', step: 4 };
  }

  const recoveryFrame = frame - timing.startup - timing.active;
  const step = quantizedStep(recoveryFrame, timing.recovery);
  return { amount: (4 - step) / 4, phase: 'return', step };
}

/** Zero-based drawing index: four approach, impact, four return. */
export function spriteAttackFrame(
  frame: number,
  timing: SpriteAttackTiming,
): number {
  const beat = spriteAttackBeat(frame, timing);
  if (beat.phase === 'approach') return beat.step - 1;
  if (beat.phase === 'strike') return 4;
  return 4 + beat.step;
}

function quantizedStep(
  frame: number,
  duration: number,
): SpriteAttackStep {
  const safeFrame = Math.max(0, frame);
  const safeDuration = Math.max(1, duration);
  const value = Math.floor((safeFrame * 4) / safeDuration) + 1;
  return Math.min(4, value) as SpriteAttackStep;
}
