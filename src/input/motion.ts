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
  | 'qcf2'
  | 'qcb2'
  | 'hcb'
  | 'hcf'
  | 'dp'
  | 'rdp'
  | 'dd'
  | 'ff'
  | 'bb'
  /** Hold Back, then Forward. */
  | 'chargeBackForward'
  /** Hold Down, then Up. */
  | 'chargeDownUp';

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

interface ChargeDefinition {
  /** Frames the charge direction must be held before release. */
  readonly holdFrames: number;
  /** Directions that count as holding the charge. */
  readonly release: readonly Direction[];
  /** How long after letting go the release still counts. */
  readonly releaseWindow: number;
  /** Which counter on the frame carries the charge. */
  readonly counter: 'backChargeFrames' | 'downChargeFrames';
}

/**
 * Charge inputs, kept separate from the step-sequence motions above.
 *
 * A charge is "a direction was held for a long time", which a fixed-length step
 * list cannot express — the buffer would have to retain the whole hold. The
 * per-frame counters on `InputFrame` carry it instead, so the check reads one
 * frame no matter how long the charge was.
 */
const CHARGES: Readonly<
  Record<'chargeBackForward' | 'chargeDownUp', ChargeDefinition>
> = {
  chargeBackForward: {
    holdFrames: 40,
    release: [3, 6, 9],
    releaseWindow: 10,
    counter: 'backChargeFrames',
  },
  chargeDownUp: {
    holdFrames: 40,
    release: [7, 8, 9],
    releaseWindow: 10,
    counter: 'downChargeFrames',
  },
};

const MOTIONS: Readonly<
  Record<Exclude<MotionId, 'none' | keyof typeof CHARGES>, MotionDefinition>
> = {
  qcf2: {
    steps: [DOWN, DOWN_FORWARD, FORWARD, DOWN, DOWN_FORWARD, FORWARD],
    slack: 6,
    window: 38,
  },
  qcb2: {
    steps: [DOWN, DOWN_BACK, BACK, DOWN, DOWN_BACK, BACK],
    slack: 6,
    window: 38,
  },
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
  if (motion === 'chargeBackForward' || motion === 'chargeDownUp') {
    return matchesCharge(buffer, CHARGES[motion], endingAgo);
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
 * The release direction is held now, and the charge was full just before it.
 *
 * Reading the counter from a frame inside the release window rather than from
 * the press frame matters: the moment the player rolls onto Forward the Back
 * counter is already zero, so the evidence of the charge only exists slightly
 * in the past.
 */
function matchesCharge(
  buffer: InputBuffer,
  definition: ChargeDefinition,
  endingAgo: number,
): boolean {
  if (!definition.release.includes(buffer.at(endingAgo).direction)) {
    return false;
  }
  const limit = endingAgo + definition.releaseWindow;
  for (let ago = endingAgo; ago <= limit; ago += 1) {
    if (buffer.at(ago)[definition.counter] >= definition.holdFrames) {
      return true;
    }
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
    // Charges first: a 40-frame hold is strictly more specific than any of the
    // rolling motions that can be read out of its release.
    'chargeBackForward',
    'chargeDownUp',
    'qcf2',
    'qcb2',
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
