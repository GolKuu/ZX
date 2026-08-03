/**
 * Combat objectives: hits, whiffs, blocks, throws, punishes and reversals.
 *
 * All of these read the engine's event stream. A `block` event already carries
 * `perfect` and `painGuard`, a `grapple` event carries its `kind`, and armour
 * announces itself with `armourAbsorbed` — so the Tutorial never has to guess
 * from an animation what the simulation already stated.
 */

import { attackLevelOf, fighterOf, isActionable, isRecovering } from './context.js';
import { Counter, Edge, FAILURE, type Detector, type DetectorDeps } from './detector.js';
import type { ObjectiveFrame } from './types.js';

/** Land a hit on the dummy, optionally with a specific move. */
export class HitTargetDetector extends Counter implements Detector {
  private readonly wanted: ReadonlySet<string> | null;

  public constructor(moveIds: readonly string[] | undefined, count: number) {
    super(count);
    this.wanted = moveIds === undefined ? null : new Set(moveIds);
  }

  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type === 'block'
        && event.attackerId === frame.playerId
        && this.matches(event.moveId)) {
        this.note(FAILURE.blockedNotHit);
        continue;
      }
      if (event.type !== 'hit') continue;
      if (event.attackerId !== frame.playerId) continue;
      if (event.defenderId !== frame.dummyId) continue;
      if (this.matches(event.moveId)) this.succeed();
    }
  }

  private matches(moveId: string): boolean {
    return this.wanted === null || this.wanted.has(moveId);
  }
}

/**
 * Deliberately miss — the move ran its full length and touched nothing.
 *
 * Tracked as "started, then ended with no contact in between" rather than by
 * measuring distance, because whiffing is a fact about the hitbox, not about
 * how far apart the fighters looked.
 */
export class WhiffMoveDetector extends Counter implements Detector {
  private readonly wanted: ReadonlySet<string>;
  private pending: string | null = null;
  private touched = false;

  public constructor(moveIds: readonly string[], count: number) {
    super(count);
    this.wanted = new Set(moveIds);
  }

  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type === 'moveStarted'
        && event.fighterId === frame.playerId
        && this.wanted.has(event.moveId)) {
        this.pending = event.moveId;
        this.touched = false;
      }
      const contact = (event.type === 'hit' || event.type === 'block')
        && event.attackerId === frame.playerId;
      if (contact && event.moveId === this.pending) this.touched = true;
      if (event.type === 'moveEnded'
        && event.fighterId === frame.playerId
        && event.moveId === this.pending) {
        if (this.touched) this.note(FAILURE.hitNotWhiffed);
        else this.succeed();
        this.pending = null;
      }
    }
  }

  public override reset(): void {
    super.reset();
    this.pending = null;
    this.touched = false;
  }
}

/** Block incoming attacks, optionally of one level or with perfect timing. */
export class BlockAttackDetector extends Counter implements Detector {
  public constructor(
    private readonly deps: DetectorDeps,
    count: number,
    private readonly level?: 'high' | 'mid' | 'low',
    private readonly requirePerfect = false,
    private readonly requirePainGuard = false,
  ) {
    super(count);
  }

  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type === 'hit' && event.defenderId === frame.playerId) {
        // Being hit by the attack we were meant to block is the teachable
        // moment, so it is reported rather than silently ignored.
        this.note(FAILURE.wrongLevel, {
          level: attackLevelOf(event.moveId, this.deps.lookup) ?? 'mid',
        });
        continue;
      }
      if (event.type !== 'block') continue;
      if (event.defenderId !== frame.playerId) continue;
      if (this.level !== undefined
        && attackLevelOf(event.moveId, this.deps.lookup) !== this.level) {
        continue;
      }
      if (this.requirePerfect && !event.perfect) {
        this.note(FAILURE.tooEarly);
        continue;
      }
      if (this.requirePainGuard && !event.painGuard) {
        this.note(FAILURE.notEnoughResource);
        continue;
      }
      this.succeed();
    }
  }
}

/** Have your guard broken — Course 3 Lesson 5 teaches this by experiencing it. */
export class GuardBreakDetector extends Counter implements Detector {
  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type === 'guardBreak' && event.defenderId === frame.playerId) {
        this.succeed();
      }
    }
  }
}

/** Land a throw, optionally only certain grapple kinds. */
export class LandThrowDetector extends Counter implements Detector {
  private readonly kinds: ReadonlySet<string> | null;

  public constructor(kinds: readonly string[] | undefined, count: number) {
    super(count);
    this.kinds = kinds === undefined ? null : new Set(kinds);
  }

  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type !== 'grapple') continue;
      if (event.attackerId !== frame.playerId) continue;
      if (this.kinds !== null && !this.kinds.has(event.kind)) continue;
      this.succeed();
    }
  }
}

/** Escape a throw. The engine reports the tech as a grapple of kind `escape`. */
export class EscapeThrowDetector extends Counter implements Detector {
  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type !== 'grapple') continue;
      if (event.kind !== 'escape') continue;
      if (event.attackerId === frame.playerId
        || event.defenderId === frame.playerId) {
        this.succeed();
      }
    }
  }
}

/** Absorb a hit with armour rather than blocking it. */
export class ArmourDetector extends Counter implements Detector {
  public override observe(frame: ObjectiveFrame): void {
    for (const event of frame.events) {
      if (event.type === 'armourAbsorbed'
        && event.defenderId === frame.playerId) {
        this.succeed();
      }
    }
  }
}

/**
 * Punish: hit the dummy while it is in the recovery of its own move.
 *
 * The phase comes from the real frame data via `isRecovering`, so "punishable"
 * means the same thing in the lesson and in a match.
 */
export class PunishDetector extends Counter implements Detector {
  public constructor(private readonly deps: DetectorDeps, count: number) {
    super(count);
  }

  public override observe(frame: ObjectiveFrame): void {
    const dummy = fighterOf(frame.world, frame.dummyId);
    if (dummy === undefined) return;
    const recovering = isRecovering(dummy, this.deps.lookup);
    for (const event of frame.events) {
      if (event.type !== 'hit') continue;
      if (event.attackerId !== frame.playerId) continue;
      if (recovering) this.succeed();
      else this.note(FAILURE.notRecovering);
    }
  }
}

/** Anti-air: hit the dummy while it is off the ground and you are not. */
export class AntiAirDetector extends Counter implements Detector {
  public override observe(frame: ObjectiveFrame): void {
    const dummy = fighterOf(frame.world, frame.dummyId);
    const player = fighterOf(frame.world, frame.playerId);
    if (dummy === undefined || player === undefined) return;
    for (const event of frame.events) {
      if (event.type !== 'hit') continue;
      if (event.attackerId !== frame.playerId) continue;
      if (!dummy.grounded && player.grounded) this.succeed();
      else this.note(FAILURE.notAirborne);
    }
  }
}

/**
 * Reversal: act on the first actionable frame after stun or knockdown.
 *
 * The window opens when the engine says the player may act again. Pressing
 * earlier cannot start a move at all, so the detector reports *that* as the
 * block-stun mistake rather than letting the attempt silently do nothing.
 */
export class ReversalDetector extends Counter implements Detector {
  private readonly actionable = new Edge();
  private sinceActionable: number | null = null;
  private readonly wanted: ReadonlySet<string> | null;

  public constructor(
    moveIds: readonly string[] | undefined,
    private readonly windowFrames: number,
  ) {
    super(1);
    this.wanted = moveIds === undefined ? null : new Set(moveIds);
  }

  public override observe(frame: ObjectiveFrame): void {
    const player = fighterOf(frame.world, frame.playerId);
    if (player === undefined) return;
    const free = isActionable(player);
    if (this.actionable.rose(free)) this.sinceActionable = 0;
    else if (this.sinceActionable !== null) this.sinceActionable += 1;

    const stunned = player.hitstun > 0 || player.guardFrames > 0;
    for (const event of frame.events) {
      if (event.type !== 'moveStarted') continue;
      if (event.fighterId !== frame.playerId) continue;
      if (this.wanted !== null && !this.wanted.has(event.moveId)) continue;
      if (this.sinceActionable === null) {
        this.note(FAILURE.tooEarlyBlockstun);
      } else if (this.sinceActionable <= this.windowFrames) {
        this.succeed();
      } else {
        this.note(FAILURE.tooLate, { frames: this.sinceActionable });
      }
    }
    // Pressing during stun never produces a `moveStarted`; catch the intent so
    // the feedback can name the real mistake.
    if (stunned && frame.buffer.at(0).pressed !== 0) {
      this.note(FAILURE.tooEarlyBlockstun);
    }
  }

  public override reset(): void {
    super.reset();
    this.actionable.reset();
    this.sinceActionable = null;
  }
}
