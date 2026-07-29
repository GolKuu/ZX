/**
 * Motion recognition.
 *
 * A motion is an ordered sequence of direction predicates matched backwards from
 * a given frame. Steps may be separated by up to `slack` frames of unrelated
 * input, which is what makes a quarter-circle feel forgiving without letting an
 * unrelated walk-forward register as one.
 */

import type { Direction } from './bindings.js';
import type { InputBuffer } from './buffer.js';

export type MotionId =
  | 'none'
  | 'qcf'
  | 'qcb'
  | 'hcb'
  | 'hcf'
  | 'dp'
  | 'rdp'
  | 'dd'
  | 'ff'
  | 'bb';

/** Direction sets, facing-relative. */
const DOWN: readonly Direction[] = [1, 2, 3];
const FORWARD: readonly Direction[] = [3, 6, 9];
const BACK: readonly Direction[] = [1, 4, 7];
const DOWN_FORWARD: readonly Direction[] = [3];
const DOWN_BACK: readonly Direction[] = [1];
const NEUTRAL_OR_UP: readonly Direction[] = [5, 7, 8, 9];

interface MotionDefinition {
  /** Ordered oldest → newest. */
  readonly steps: readonly (readonly Direction[])[];
  /** Frames of unrelated input tolerated between consecutive steps. */
  readonly slack: number;
  /** Total frames the whole motion may span. */
  readonly window: number;
}

const MOTIONS: Readonly<Record<Exclude<MotionId, 'none'>, MotionDefinition>> = {
  qcf: { steps: [DOWN, DOWN_FORWARD, FORWARD], slack: 6, window: 20 },
  qcb: { steps: [DOWN, DOWN_BACK, BACK], slack: 6, window: 20 },
  hcf: {
    steps: [BACK, DOWN_BACK, DOWN, DOWN_FORWARD, FORWARD],
    slack: 7,
    window: 32,
  },
  hcb: {
    steps: [FORWARD, DOWN_FORWARD, DOWN, DOWN_BACK, BACK],
    slack: 7,
    window: 32,
  },
  dp: { steps: [FORWARD, DOWN, DOWN_FORWARD], slack: 6, window: 20 },
  rdp: { steps: [BACK, DOWN, DOWN_BACK], slack: 6, window: 20 },
  dd: { steps: [DOWN, NEUTRAL_OR_UP, DOWN], slack: 5, window: 22 },
  ff: { steps: [FORWARD, NEUTRAL_OR_UP, FORWARD], slack: 4, window: 16 },
  bb: { steps: [BACK, NEUTRAL_OR_UP, BACK], slack: 4, window: 16 },
};

/**
 * Whether `motion` completed at or shortly before `endingAgo` frames back.
 *
 * `endingAgo` is normally the frame the attack button went down, so the motion
 * must have finished by then — pressing the button first and rolling the stick
 * afterwards does not count.
 */
export function matchesMotion(
  buffer: InputBuffer,
  motion: MotionId,
  endingAgo = 0,
): boolean {
  if (motion === 'none') {
    return true;
  }
  const definition = MOTIONS[motion];
  const steps = definition.steps;
  const lastIndex = steps.length - 1;

  // Walk backwards through the buffer, satisfying steps newest → oldest.
  let stepIndex = lastIndex;
  let ago = endingAgo;
  let slackUsed = 0;
  const limit = endingAgo + definition.window;

  while (ago <= limit && ago < buffer.length) {
    const step = steps[stepIndex];
    if (step === undefined) {
      break;
    }
    const direction = buffer.at(ago).direction;

    if (step.includes(direction)) {
      stepIndex -= 1;
      slackUsed = 0;
      if (stepIndex < 0) {
        return true;
      }
    } else if (stepIndex < lastIndex) {
      // Mid-motion: tolerate a little noise, but not an unbounded gap.
      slackUsed += 1;
      if (slackUsed > definition.slack) {
        return false;
      }
    }
    ago += 1;
  }

  return false;
}

/**
 * Highest-priority motion completing at `endingAgo`, longest first so a
 * half-circle is never mistaken for the quarter-circle inside it.
 */
export function detectMotion(
  buffer: InputBuffer,
  endingAgo = 0,
  candidates: readonly MotionId[] = [
    'hcb',
    'hcf',
    'dp',
    'rdp',
    'qcf',
    'qcb',
    'dd',
    'ff',
    'bb',
  ],
): MotionId {
  for (const candidate of candidates) {
    if (candidate !== 'none' && matchesMotion(buffer, candidate, endingAgo)) {
      return candidate;
    }
  }
  return 'none';
}
