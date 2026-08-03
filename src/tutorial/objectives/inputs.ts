/**
 * Input objectives: buttons, chords, motions and committed moves.
 *
 * The rule the brief states as "do not mark success until the runtime input
 * parser recognizes the actual command" is enforced structurally here:
 * `PerformMoveDetector` listens for the engine's `moveStarted` event, so a step
 * is only satisfied once the real command table produced the real move. The
 * button and motion detectors exist for teaching *stages* of an input, and are
 * never used alone to certify that a special came out.
 */

import { BUTTON_BIT, hasButton } from '../../input/bindings.js';
import { matchesMotion, type MotionId } from '../../input/motion.js';
import { slotFor, type PlayerButton } from '../buttons.js';
import { Counter, FAILURE, type Detector } from './detector.js';
import type { ObjectiveFrame } from './types.js';

/** A single attack button went down, with no other attack button on it. */
export class PressButtonDetector extends Counter implements Detector {
  public constructor(
    private readonly button: PlayerButton,
    count: number,
  ) {
    super(count);
  }

  public override observe(frame: ObjectiveFrame): void {
    const pressed = frame.buffer.at(0).pressed;
    if (pressed === 0) return;
    const bit = BUTTON_BIT[slotFor(this.button)];
    if ((pressed & bit) !== 0) {
      this.succeed();
    } else if (isAttackPress(pressed)) {
      this.note(FAILURE.wrongButton, { wanted: this.button });
    }
  }
}

/**
 * A chord: every named button down together, and nothing else.
 *
 * "Together" is a short window rather than one frame, matching the engine's own
 * `settleFrames` reasoning — no player hits two keys on the same 16 ms tick.
 */
export class PressChordDetector extends Counter implements Detector {
  private readonly mask: number;
  private cooldown = 0;

  public constructor(
    private readonly buttons: readonly PlayerButton[],
    count: number,
    private readonly windowFrames = 4,
  ) {
    super(count);
    this.mask = buttons.reduce(
      (total, button) => total | BUTTON_BIT[slotFor(button)],
      0,
    );
  }

  public override observe(frame: ObjectiveFrame): void {
    if (this.cooldown > 0) {
      this.cooldown -= 1;
      return;
    }
    let union = 0;
    for (let ago = 0; ago <= this.windowFrames; ago += 1) {
      union |= frame.buffer.at(ago).held & ATTACK_MASK;
    }
    if (union === 0) return;
    if (union === this.mask) {
      this.succeed();
      this.cooldown = this.windowFrames + 4;
    } else if (union !== 0 && (union & ~this.mask) !== 0) {
      this.note(FAILURE.wrongButton, {
        wanted: this.buttons.join('+'),
      });
    }
  }

  public override reset(): void {
    super.reset();
    this.cooldown = 0;
  }
}

const ATTACK_MASK = (['lp', 'hp', 'lk', 'hk'] as const).reduce(
  (mask, slot) => mask | BUTTON_BIT[slot],
  0,
);

/**
 * A motion completed at an attack press, read by the engine's own matcher.
 *
 * Using `matchesMotion` rather than a private copy is deliberate: the slack and
 * window numbers that make a quarter-circle feel right belong to one file, and
 * a Tutorial that judged them separately would eventually pass inputs the game
 * rejects, or reject inputs the game accepts.
 */
export class PerformMotionDetector extends Counter implements Detector {
  public constructor(
    private readonly motion: MotionId,
    count: number,
    private readonly button?: PlayerButton,
  ) {
    super(count);
  }

  public override observe(frame: ObjectiveFrame): void {
    const pressed = frame.buffer.at(0).pressed;
    if (pressed === 0) return;
    if (this.button !== undefined) {
      if (!hasButton(pressed, slotFor(this.button))) return;
    } else if (!isAttackPress(pressed)) {
      return;
    }
    if (matchesMotion(frame.buffer, this.motion, 0)) {
      this.succeed();
    } else {
      this.note(FAILURE.motionIncomplete, { motion: this.motion });
    }
  }
}

/** The engine actually started one of these moves for the player. */
export class PerformMoveDetector extends Counter implements Detector {
  private readonly wanted: ReadonlySet<string>;

  public constructor(moveIds: readonly string[], count: number) {
    super(count);
    this.wanted = new Set(moveIds);
  }

  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type !== 'moveStarted') continue;
      if (event.fighterId !== frame.playerId) continue;
      if (this.wanted.has(event.moveId)) this.succeed();
    }
  }
}

function isAttackPress(pressed: number): boolean {
  return (pressed & ATTACK_MASK) !== 0;
}
