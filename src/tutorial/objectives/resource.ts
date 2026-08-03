/**
 * Resource, wall and survival objectives.
 *
 * Resources are read from the fighter snapshot rather than from a lesson's own
 * bookkeeping, so Luck, Rage and the Glitch defence gauge are all covered by
 * the same three detectors — a future fighter with a new meter needs no new
 * code here.
 */

import { fighterOf } from './context.js';
import { Counter, FAILURE, type Detector } from './detector.js';
import type { ObjectiveFrame } from './types.js';

/** Build a character resource up to a threshold. */
export class ReachResourceDetector extends Counter implements Detector {
  public constructor(private readonly minimum: number) {
    super(minimum);
  }

  public override observe(frame: ObjectiveFrame): void {
    const player = fighterOf(frame.world, frame.playerId);
    if (player === undefined) return;
    if (player.resource >= this.minimum) this.succeed(this.minimum);
  }
}

/**
 * Spend a resource.
 *
 * Measured as a *drop* between frames, which catches the exact spend frame the
 * brief asks Lucky's and Vorgh's lessons to show. Passive drain is excluded by
 * requiring the drop to clear the whole threshold in one frame — drain moves a
 * point at a time, a move's cost lands at once.
 */
export class SpendResourceDetector extends Counter implements Detector {
  private previous: number | null = null;

  public constructor(private readonly minimum: number) {
    super(1);
  }

  public override observe(frame: ObjectiveFrame): void {
    const player = fighterOf(frame.world, frame.playerId);
    if (player === undefined) return;
    const current = player.resource;
    if (this.previous !== null) {
      const spent = this.previous - current;
      if (spent >= this.minimum) this.succeed();
    }
    this.previous = current;
  }

  public override reset(): void {
    super.reset();
    this.previous = null;
  }
}

/** Put an energy plane into the world — Mim's whole game plan starts here. */
export class SpawnWallDetector extends Counter implements Detector {
  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type === 'wallSpawned' && event.ownerId === frame.playerId) {
        this.succeed();
      }
    }
  }
}

/** Use a plane: contact, jump, exit or run. Phases come from the engine. */
export class WallInteractionDetector extends Counter implements Detector {
  private readonly wanted: ReadonlySet<string>;

  public constructor(phases: readonly string[], count: number) {
    super(count);
    this.wanted = new Set(phases);
  }

  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type !== 'wallRun') continue;
      if (event.fighterId !== frame.playerId) continue;
      if (this.wanted.has(event.phase)) this.succeed();
    }
  }
}

/** Stay in the fight for a stretch without being hit more than N times. */
export class SurviveDetector extends Counter implements Detector {
  private elapsed = 0;
  private hitsTaken = 0;

  public constructor(
    private readonly frames: number,
    private readonly maxHitsTaken: number,
  ) {
    super(frames);
  }

  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type === 'hit' && event.defenderId === frame.playerId) {
        this.hitsTaken += 1;
        if (this.hitsTaken > this.maxHitsTaken) {
          this.fail(FAILURE.tookDamage, { hits: this.hitsTaken });
          return;
        }
      }
    }
    this.elapsed += 1;
    this.succeed(this.elapsed >= this.frames ? this.frames : 0);
  }

  public override reset(): void {
    super.reset();
    this.elapsed = 0;
    this.hitsTaken = 0;
  }
}

/** Get through a stretch untouched. */
export class NoDamageDetector extends Counter implements Detector {
  private elapsed = 0;

  public constructor(private readonly frames: number) {
    super(frames);
  }

  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type === 'hit' && event.defenderId === frame.playerId) {
        this.fail(FAILURE.tookDamage, { hits: 1 });
        return;
      }
    }
    this.elapsed += 1;
    if (this.elapsed >= this.frames) this.succeed(this.frames);
  }

  public override reset(): void {
    super.reset();
    this.elapsed = 0;
  }
}

/**
 * Objectives satisfied outside combat — a progression purchase, a Training
 * Mode toggle. The runner pushes these in through `report`, because no amount
 * of watching the simulation can observe a menu.
 */
export class ExternalActionDetector extends Counter implements Detector {
  private seen = false;

  public constructor(
    private readonly action: string,
    private readonly detail?: string,
  ) {
    super(1);
  }

  public override observe(): void {
    if (this.seen) this.succeed();
  }

  public report(action: string, detail?: string): void {
    if (action !== this.action) return;
    if (this.detail !== undefined && this.detail !== detail) {
      this.note(FAILURE.wrongButton, { wanted: this.detail });
      return;
    }
    this.seen = true;
    this.succeed();
  }

  public override reset(): void {
    super.reset();
    this.seen = false;
  }
}
