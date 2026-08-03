/**
 * Fixed-capacity input history, sampled once per simulation frame.
 *
 * The buffer is the only place raw input lives. Motion recognition and command
 * matching both read it and never mutate it, so a replay that feeds the same
 * frames produces the same reads.
 */

import type { ButtonMask, Direction } from './bindings.js';
import { BUTTON_BIT, type Button } from './bindings.js';

/** Frames of history retained. Longer than any authored motion needs. */
export const BUFFER_CAPACITY = 40;

/** How long a pressed button stays eligible to start a move. */
export const INPUT_LEEWAY_FRAMES = 7;

export interface InputFrame {
  /** Facing-relative direction for this frame. */
  readonly direction: Direction;
  /** Buttons held this frame. */
  readonly held: ButtonMask;
  /** Buttons that went down on this frame specifically. */
  readonly pressed: ButtonMask;
  /** Consecutive frames Back has been held, including this one. */
  readonly backChargeFrames: number;
  /** Consecutive frames Down has been held, including this one. */
  readonly downChargeFrames: number;
}

const NEUTRAL_FRAME: InputFrame = {
  direction: 5,
  held: 0,
  pressed: 0,
  backChargeFrames: 0,
  downChargeFrames: 0,
};

export class InputBuffer {
  private readonly frames: InputFrame[] = [];
  private previousHeld = 0;
  private backCharge = 0;
  private downCharge = 0;

  /**
   * Append one frame. Call exactly once per simulation tick — the buffer counts
   * entries, not milliseconds.
   */
  public push(direction: Direction, held: ButtonMask): void {
    const pressed = held & ~this.previousHeld;
    this.previousHeld = held;
    // Charge is counted, not remembered: a 40-frame hold would otherwise need a
    // 40-frame history window, and the buffer would have to grow for every
    // character to serve one character's charge moves.
    this.backCharge = isBackDirection(direction) ? this.backCharge + 1 : 0;
    this.downCharge = isDownDirection(direction) ? this.downCharge + 1 : 0;
    this.frames.push({
      direction,
      held,
      pressed,
      backChargeFrames: this.backCharge,
      downChargeFrames: this.downCharge,
    });
    if (this.frames.length > BUFFER_CAPACITY) {
      this.frames.shift();
    }
  }

  public clear(): void {
    this.frames.length = 0;
    this.previousHeld = 0;
    this.backCharge = 0;
    this.downCharge = 0;
  }

  public get length(): number {
    return this.frames.length;
  }

  /** `0` is the newest frame. Out-of-range reads return neutral. */
  public at(agoFrames: number): InputFrame {
    const index = this.frames.length - 1 - agoFrames;
    if (index < 0 || index >= this.frames.length) {
      return NEUTRAL_FRAME;
    }
    return this.frames[index] ?? NEUTRAL_FRAME;
  }

  public get current(): InputFrame {
    return this.at(0);
  }

  /**
   * Frames since `button` last went down, or `null` if it has not been pressed
   * within the retained history.
   */
  public framesSincePress(button: Button): number | null {
    const bit = BUTTON_BIT[button];
    for (let ago = 0; ago < this.frames.length; ago += 1) {
      if ((this.at(ago).pressed & bit) !== 0) {
        return ago;
      }
    }
    return null;
  }

  /** Whether `button` went down within the leeway window. */
  public wasPressedRecently(
    button: Button,
    withinFrames = INPUT_LEEWAY_FRAMES,
  ): boolean {
    const ago = this.framesSincePress(button);
    return ago !== null && ago < withinFrames;
  }

  public isHeld(button: Button): boolean {
    return (this.current.held & BUTTON_BIT[button]) !== 0;
  }

  /** Snapshot for replays and desync reports. */
  public toArray(): readonly InputFrame[] {
    return [...this.frames];
  }
}

function isBackDirection(direction: Direction): boolean {
  return direction === 1 || direction === 4 || direction === 7;
}

function isDownDirection(direction: Direction): boolean {
  return direction === 1 || direction === 2 || direction === 3;
}
