/**
 * The detector contract and the counter every simple objective is built on.
 *
 * A detector sees one frame at a time and never rewinds, which is what lets the
 * same code run live, inside a replay and inside a headless test.
 */

import type { TextKey } from '../i18n/keys.js';
import type { MoveLookup } from './context.js';
import type {
  ObjectiveFrame,
  ObjectiveProgress,
  ObjectiveStatus,
} from './types.js';

export interface Detector {
  observe(frame: ObjectiveFrame): void;
  readonly progress: ObjectiveProgress;
  reset(): void;
}

export interface DetectorDeps {
  readonly lookup: MoveLookup;
}

/**
 * Counts successes towards a target and remembers the last thing that went
 * wrong, so feedback can say *why* rather than "try again".
 */
export class Counter implements Detector {
  private value = 0;
  private status: ObjectiveStatus = 'pending';
  private failureKey: TextKey | undefined;
  private failureValues: Readonly<Record<string, number | string>> | undefined;

  public constructor(private readonly target: number) {}

  /**
   * Takes the frame so subclasses can widen it to a used parameter. The bare
   * counter ignores it and is driven through `succeed` instead.
   */
  public observe(frame?: ObjectiveFrame): void {
    void frame;
  }

  public succeed(times = 1): void {
    if (this.status === 'failed') return;
    this.value = Math.min(this.target, this.value + times);
    if (this.value >= this.target) {
      this.status = 'satisfied';
    }
  }

  /** A recoverable mistake: note it, keep the step running. */
  public note(
    key: TextKey,
    values?: Readonly<Record<string, number | string>>,
  ): void {
    this.failureKey = key;
    this.failureValues = values;
  }

  /** An unrecoverable mistake: the step must reset. */
  public fail(
    key: TextKey,
    values?: Readonly<Record<string, number | string>>,
  ): void {
    this.note(key, values);
    this.status = 'failed';
  }

  public get progress(): ObjectiveProgress {
    return {
      status: this.status,
      count: this.value,
      target: this.target,
      ...(this.failureKey === undefined ? {} : { failureKey: this.failureKey }),
      ...(this.failureValues === undefined
        ? {}
        : { failureValues: this.failureValues }),
    };
  }

  public reset(): void {
    this.value = 0;
    this.status = 'pending';
    this.failureKey = undefined;
    this.failureValues = undefined;
  }
}

/** Tracks a boolean going false → true, so an edge is never counted twice. */
export class Edge {
  private previous = false;

  public rose(current: boolean): boolean {
    const rose = current && !this.previous;
    this.previous = current;
    return rose;
  }

  public fell(current: boolean): boolean {
    const fell = !current && this.previous;
    this.previous = current;
    return fell;
  }

  public reset(value = false): void {
    this.previous = value;
  }
}

/** Feedback keys shared by several detectors. */
export const FAILURE = {
  wrongDirection: 'tutorial.feedback.wrong-direction',
  wrongButton: 'tutorial.feedback.wrong-button',
  motionIncomplete: 'tutorial.feedback.motion-incomplete',
  outOfRange: 'tutorial.feedback.out-of-range',
  tooEarlyBlockstun: 'tutorial.feedback.too-early-blockstun',
  tooEarly: 'tutorial.feedback.too-early',
  tooLate: 'tutorial.feedback.too-late',
  comboDropped: 'tutorial.feedback.combo-dropped',
  wrongLevel: 'tutorial.feedback.wrong-level',
  blockedNotHit: 'tutorial.feedback.blocked-not-hit',
  hitNotWhiffed: 'tutorial.feedback.hit-not-whiffed',
  notRecovering: 'tutorial.feedback.not-recovering',
  notAirborne: 'tutorial.feedback.not-airborne',
  tookDamage: 'tutorial.feedback.took-damage',
  notEnoughResource: 'tutorial.feedback.not-enough-resource',
  timedOut: 'tutorial.feedback.timed-out',
} as const satisfies Readonly<Record<string, TextKey>>;
