/**
 * Combo objectives.
 *
 * The brief's rule — "do not call a sequence a true combo based only on visual
 * continuity" — is the whole design of this file. A combo stays true only while
 * the defender never reaches an actionable frame between hits. The moment the
 * engine says they could have acted, the chain is a *reset*, not a combo, even
 * though it looks identical on screen.
 */

import { fighterOf, isActionable } from './context.js';
import { Counter, FAILURE, type Detector } from './detector.js';
import type { ObjectiveFrame } from './types.js';

export type ChainVerdict =
  | 'none'
  | 'true'
  | 'dropped'
  | 'reset'
  | 'airRecoveryPossible'
  | 'invalidRoute';

/**
 * Follows the current chain of hits on the dummy.
 *
 * Shared by both combo detectors and by the HUD readout, so the label a player
 * reads and the verdict a lesson records can never disagree.
 */
export class ChainTracker {
  private hits: string[] = [];
  private brokenByRecovery = false;
  private wasActionable = true;

  public observe(frame: ObjectiveFrame): void {
    const dummy = fighterOf(frame.world, frame.dummyId);
    if (dummy === undefined) return;

    const free = isActionable(dummy);
    // An actionable frame *between* hits ends the combo. Reading it before the
    // hits of this frame are folded in keeps the first hit of a new chain from
    // being blamed on the gap that preceded it.
    if (free && this.hits.length > 0) this.brokenByRecovery = true;

    for (const event of frame.events) {
      if (event.type !== 'hit') continue;
      if (event.attackerId !== frame.playerId) continue;
      if (event.defenderId !== frame.dummyId) continue;
      if (this.brokenByRecovery) {
        this.hits = [event.moveId];
        this.brokenByRecovery = false;
      } else {
        this.hits.push(event.moveId);
      }
    }
    this.wasActionable = free;
  }

  public get route(): readonly string[] {
    return this.hits;
  }

  public get length(): number {
    return this.hits.length;
  }

  /** True while every hit so far has landed with no actionable gap. */
  public get isTrue(): boolean {
    return this.hits.length > 1 && !this.brokenByRecovery;
  }

  public get droppedAfterHits(): boolean {
    return this.brokenByRecovery && this.hits.length > 0;
  }

  public verdictFor(expected: readonly string[]): ChainVerdict {
    if (this.hits.length === 0) return 'none';
    const prefixMatches = this.hits.every(
      (moveId, index) => expected[index] === moveId,
    );
    if (!prefixMatches) return 'invalidRoute';
    if (this.hits.length < expected.length) {
      return this.brokenByRecovery ? 'dropped' : 'none';
    }
    return this.brokenByRecovery ? 'reset' : 'true';
  }

  public reset(): void {
    this.hits = [];
    this.brokenByRecovery = false;
    this.wasActionable = true;
  }
}

/** Complete an exact route, in order, optionally as a true combo. */
export class ComboRouteDetector extends Counter implements Detector {
  private readonly chain = new ChainTracker();

  public constructor(
    private readonly route: readonly string[],
    private readonly requireTrue: boolean,
  ) {
    super(1);
  }

  public override observe(frame: ObjectiveFrame): void {
    this.chain.observe(frame);
    const verdict = this.chain.verdictFor(this.route);
    if (verdict === 'true') {
      this.succeed();
      return;
    }
    if (verdict === 'invalidRoute') {
      this.note(FAILURE.comboDropped, { reason: 'route' });
      this.chain.reset();
      return;
    }
    if (verdict === 'dropped' || verdict === 'reset') {
      if (!this.requireTrue && verdict === 'reset') {
        this.succeed();
        return;
      }
      this.note(FAILURE.comboDropped, { hits: this.chain.length });
      this.chain.reset();
    }
  }

  public get verdict(): ChainVerdict {
    return this.chain.verdictFor(this.route);
  }

  public override reset(): void {
    super.reset();
    this.chain.reset();
  }
}

/** Land at least N hits in one chain. */
export class ComboHitsDetector extends Counter implements Detector {
  private readonly chain = new ChainTracker();

  public constructor(
    private readonly minimum: number,
    private readonly requireTrue: boolean,
  ) {
    super(minimum);
  }

  public override observe(frame: ObjectiveFrame): void {
    this.chain.observe(frame);
    const enough = this.chain.length >= this.minimum;
    if (enough && (!this.requireTrue || this.chain.isTrue)) {
      this.succeed(this.minimum);
      return;
    }
    if (this.chain.droppedAfterHits && this.chain.length > 0) {
      this.note(FAILURE.comboDropped, { hits: this.chain.length });
    }
  }

  public override reset(): void {
    super.reset();
    this.chain.reset();
  }
}
