/**
 * Training Mode recording and playback, and the input-history display.
 *
 * Recording stores *physical* input — screen-space direction plus the raw
 * button mask — rather than the resolved `FighterInput`. Storing the resolved
 * input would record conclusions instead of causes, and a replay would then
 * reproduce the old command table rather than testing the current one.
 */

import type { ButtonMask, Direction } from './bindings.js';
import { BUTTON_BIT, hasButton } from './bindings.js';
import type { FighterInput } from '../sim/state.js';
import type { CommandContext, CommandRow } from './command.js';
import { DEFAULT_CONTEXT } from './command.js';
import { detectMotion, type MotionId } from './motion.js';
import type { InputProfile } from './profiles.js';
import { InputSampler, type RecordedInputFrame } from './sampler.js';
import {
  LUCKY_BUTTONS,
  LUCKY_BUTTON_SLOT,
  type LuckyButton,
} from './lucky/buttons.js';

export type { RecordedInputFrame } from './sampler.js';

export class InputRecorder {
  private readonly captured: RecordedInputFrame[] = [];
  private recording = false;

  public start(): void {
    this.captured.length = 0;
    this.recording = true;
  }

  public stop(): void {
    this.recording = false;
  }

  public get isRecording(): boolean {
    return this.recording;
  }

  public capture(direction: Direction, buttons: ButtonMask): void {
    if (this.recording) {
      this.captured.push({ direction, buttons });
    }
  }

  public get frames(): readonly RecordedInputFrame[] {
    return [...this.captured];
  }

  public clear(): void {
    this.captured.length = 0;
    this.recording = false;
  }
}

/**
 * Plays a recording back through the same sampler the keyboard uses.
 *
 * Past the end of the recording it emits neutral frames rather than looping or
 * freezing, so a playback that outlives its recording is visibly over instead
 * of quietly repeating the last input forever.
 */
export class ReplayInputSource {
  private readonly sampler: InputSampler;
  private cursor = 0;

  public constructor(
    private readonly frames: readonly RecordedInputFrame[],
    commands: readonly CommandRow[],
    profile?: InputProfile,
  ) {
    this.sampler = new InputSampler(commands, profile);
  }

  public sample(
    facing: -1 | 1,
    attacksLocked = false,
    context: CommandContext = DEFAULT_CONTEXT,
  ): FighterInput {
    const frame = this.frames[this.cursor] ?? NEUTRAL_RECORDED_FRAME;
    this.cursor += 1;
    return this.sampler.sample(
      frame.direction,
      frame.buttons,
      facing,
      attacksLocked,
      context,
    );
  }

  public get finished(): boolean {
    return this.cursor >= this.frames.length;
  }

  public reset(): void {
    this.cursor = 0;
    this.sampler.reset();
  }
}

const NEUTRAL_RECORDED_FRAME: RecordedInputFrame = { direction: 5, buttons: 0 };

/** One row of the on-screen input history. */
export interface InputHistoryEntry {
  /** Facing-relative direction, as a numpad digit. */
  readonly direction: Direction;
  /** Buttons that went down, in player notation. */
  readonly buttons: readonly LuckyButton[];
  /** Motion recognised at this press, or `'none'`. */
  readonly motion: MotionId;
  /** Frames this entry has been on screen. */
  readonly ageFrames: number;
}

/**
 * Collapse the raw buffer into the short list a player reads mid-match.
 *
 * Only frames where something changed produce a row: a held direction would
 * otherwise fill the whole display with sixty identical entries a second.
 */
export function readInputHistory(
  sampler: InputSampler,
  limit = 12,
): readonly InputHistoryEntry[] {
  const buffer = sampler.history;
  const entries: InputHistoryEntry[] = [];
  let previousDirection: Direction | null = null;

  for (let ago = 0; ago < buffer.length && entries.length < limit; ago += 1) {
    const frame = buffer.at(ago);
    const buttons = LUCKY_BUTTONS.filter(
      (button) => hasButton(frame.pressed, LUCKY_BUTTON_SLOT[button]),
    );
    const directionChanged = previousDirection !== null
      && frame.direction !== previousDirection;
    previousDirection = frame.direction;
    if (buttons.length === 0 && !directionChanged && ago !== 0) {
      continue;
    }
    if (buttons.length === 0 && frame.direction === 5 && ago !== 0) {
      continue;
    }
    entries.push({
      direction: frame.direction,
      buttons,
      motion: buttons.length === 0 ? 'none' : detectMotion(buffer, ago),
      ageFrames: ago,
    });
  }
  return entries;
}

/** Arrow glyphs for the history display, indexed by numpad direction. */
export const DIRECTION_GLYPH: Readonly<Record<Direction, string>> = {
  1: '↙',
  2: '↓',
  3: '↘',
  4: '←',
  5: '·',
  6: '→',
  7: '↖',
  8: '↑',
  9: '↗',
};

/** Button mask for a set of Lucky buttons — used by tests and by the recorder. */
export function luckyButtonMask(buttons: readonly LuckyButton[]): ButtonMask {
  return buttons.reduce(
    (mask, button) => mask | BUTTON_BIT[LUCKY_BUTTON_SLOT[button]],
    0,
  );
}
