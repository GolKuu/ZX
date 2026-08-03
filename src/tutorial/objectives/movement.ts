/**
 * Movement objectives.
 *
 * Every one of these resolves direction through `semanticOf`, which mirrors on
 * the live facing. That is the whole reason Course 1 Lesson 1 can ask the
 * player to "walk Forward" after crossing up and still be asking for the same
 * thing — and why `tests/tutorial-input.test.mjs` runs each of them twice, once
 * per facing.
 */

import { horizontalOf } from '../../input/bindings.js';
import {
  hasSemanticComponent,
  semanticOf,
  type SemanticDirection,
} from '../semantics.js';
import { fighterOf } from './context.js';
import { Counter, Edge, FAILURE, type Detector } from './detector.js';
import type { ObjectiveFrame, StageZone } from './types.js';

/** Hold one semantic direction for a run of consecutive frames. */
export class HoldDirectionDetector extends Counter implements Detector {
  private held = 0;

  public constructor(
    private readonly direction: SemanticDirection,
    private readonly frames: number,
  ) {
    super(1);
  }

  public override observe(frame: ObjectiveFrame): void {
    const semantic = semanticOf(frame.screenDirection, frame.playerFacing);
    if (semantic === this.direction) {
      this.held += 1;
      if (this.held >= this.frames) this.succeed();
      return;
    }
    if (this.held > 0 && this.held < this.frames) {
      this.note(FAILURE.wrongDirection, {
        held: this.held,
        needed: this.frames,
      });
    }
    this.held = 0;
  }

  public override reset(): void {
    super.reset();
    this.held = 0;
  }
}

/** Stand inside a highlighted area, optionally while holding a direction. */
export class ReachZoneDetector extends Counter implements Detector {
  public constructor(
    private readonly zone: StageZone,
    private readonly requireDirection?: SemanticDirection,
  ) {
    super(1);
  }

  public override observe(frame: ObjectiveFrame): void {
    const player = fighterOf(frame.world, frame.playerId);
    if (player === undefined) return;
    const inside = Math.abs(player.position.x - this.zone.centerX)
      <= this.zone.halfWidth;
    if (!inside) return;
    if (this.zone.requireGrounded === true && !player.grounded) return;
    if (this.requireDirection !== undefined) {
      const semantic = semanticOf(frame.screenDirection, frame.playerFacing);
      if (semantic !== this.requireDirection) return;
    }
    this.succeed();
  }
}

/**
 * Cross the opponent.
 *
 * Proven by the *engine* flipping the player's facing, not by comparing x
 * positions ourselves — the engine owns the side-switch rule, and a lesson that
 * re-derived it could disagree with the match the player goes on to play.
 */
export class SwitchSidesDetector extends Counter implements Detector {
  private initialFacing: -1 | 1 | null = null;

  public constructor() {
    super(1);
  }

  public override observe(frame: ObjectiveFrame): void {
    const player = fighterOf(frame.world, frame.playerId);
    if (player === undefined) return;
    this.initialFacing ??= player.facing;
    if (player.facing !== this.initialFacing) this.succeed();
  }

  public override reset(): void {
    super.reset();
    this.initialFacing = null;
  }
}

/** Leave the ground with a given semantic direction held at take-off. */
export class JumpDetector extends Counter implements Detector {
  private readonly airborne = new Edge();

  public constructor(
    private readonly direction: SemanticDirection,
    count: number,
  ) {
    super(count);
  }

  public override observe(frame: ObjectiveFrame): void {
    const player = fighterOf(frame.world, frame.playerId);
    if (player === undefined) return;
    if (!this.airborne.rose(!player.grounded)) return;

    const semantic = semanticOf(frame.screenDirection, frame.playerFacing);
    const wanted = this.direction;
    const matches = wanted === 'up'
      ? semantic === 'up'
      : wanted === 'upForward'
        ? hasSemanticComponent(frame.screenDirection, frame.playerFacing, 'forward')
        : hasSemanticComponent(frame.screenDirection, frame.playerFacing, 'back');
    if (matches) {
      this.succeed();
    } else {
      this.note(FAILURE.wrongDirection, { got: semantic, wanted });
    }
  }

  public override reset(): void {
    super.reset();
    this.airborne.reset();
  }
}

/**
 * Start a dash in a given semantic direction.
 *
 * The engine exposes `dashFrames` but not the direction, so the direction is
 * read from the input buffer on the frame the dash begins. The buffer already
 * holds facing-relative directions, which is why this needs no mirroring.
 */
export class DashDetector extends Counter implements Detector {
  private readonly dashing = new Edge();

  public constructor(
    private readonly direction: 'forward' | 'back',
    count: number,
  ) {
    super(count);
  }

  public override observe(frame: ObjectiveFrame): void {
    const player = fighterOf(frame.world, frame.playerId);
    if (player === undefined) return;
    if (!this.dashing.rose(player.dashFrames > 0)) return;

    const wanted = this.direction === 'forward' ? 1 : -1;
    const actual = horizontalOf(frame.buffer.at(0).direction);
    if (actual === wanted || actual === 0) {
      // A neutral dash press goes forward; the sampler already resolved it.
      if (this.direction === 'forward' || actual === wanted) this.succeed();
    } else {
      this.note(FAILURE.wrongDirection, { wanted: this.direction });
    }
  }

  public override reset(): void {
    super.reset();
    this.dashing.reset();
  }
}
