/**
 * Turns a `DummyScript` into one `FighterInput` per frame.
 *
 * Nothing here reaches into the simulation: the controller only *reads* the
 * public snapshot and *returns* the same input structure a keyboard produces.
 * That is what keeps the dummy an ordinary fighter rather than a scripted prop
 * with private rules.
 */

import type { FighterInput, FighterSnapshot, WorldSnapshot } from '../../sim/index.js';
import type { CombatEvent } from '../../sim/index.js';
import { InputSampler } from '../../input/sampler.js';
import type { CommandRow } from '../../input/command.js';
import type { InputProfile } from '../../input/profiles.js';
import type { DummyAction, DummyScript } from './types.js';

const NEUTRAL: FighterInput = { movement: 0 };

export class DummyController {
  private actions: readonly DummyAction[] = [];
  private index = 0;
  private framesLeft = 0;
  private cycle = 0;
  private hasBeenHit = false;
  private replay: InputSampler | null = null;
  private replayCursor = 0;

  public constructor(
    private readonly script: DummyScript,
    private readonly dummyId: string,
    private readonly commands: readonly CommandRow[],
    private readonly profile?: InputProfile,
  ) {
    this.reset();
  }

  public reset(): void {
    this.cycle = 0;
    this.hasBeenHit = false;
    this.actions = this.branchFor(0);
    this.index = 0;
    this.framesLeft = frameCountOf(this.actions[0]);
    this.replay = null;
    this.replayCursor = 0;
  }

  /** Remember that the dummy has been hit, for `guardAfterFirstHit`. */
  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'hit' && event.defenderId === this.dummyId) {
        this.hasBeenHit = true;
      }
    }
  }

  public sample(world: WorldSnapshot): FighterInput {
    const self = world.fighters.find((entry) => entry.id === this.dummyId);
    if (self === undefined) return NEUTRAL;

    const action = this.actions[this.index];
    if (action === undefined) return NEUTRAL;

    const input = this.inputFor(action, self);
    this.advance();
    return input;
  }

  private advance(): void {
    this.framesLeft -= 1;
    if (this.framesLeft > 0) return;
    this.index += 1;
    if (this.index < this.actions.length) {
      this.framesLeft = frameCountOf(this.actions[this.index]);
      return;
    }
    if (this.script.loop !== true) {
      this.index = this.actions.length;
      return;
    }
    this.cycle += 1;
    this.actions = this.branchFor(this.cycle);
    this.index = 0;
    this.framesLeft = frameCountOf(this.actions[0]);
    this.replayCursor = 0;
  }

  /**
   * Seeded branch choice.
   *
   * A plain LCG rather than `Math.random`, so a lesson that mixes highs and
   * lows shows the *same* mix every attempt. The brief forbids randomness that
   * can invalidate an objective, and a reproducible pool is how variety and
   * fairness coexist.
   */
  private branchFor(cycle: number): readonly DummyAction[] {
    const pool = this.script.pool;
    if (pool === undefined || pool.length === 0) return this.script.actions;
    const seed = this.script.seed ?? 1;
    const value = (seed * 1_103_515_245 + cycle * 12_345 + 1) >>> 0;
    return pool[value % pool.length] ?? this.script.actions;
  }

  private inputFor(
    action: DummyAction,
    self: FighterSnapshot,
  ): FighterInput {
    switch (action.kind) {
      case 'idle':
        return NEUTRAL;
      case 'walk':
        return { movement: action.direction === 'forward' ? 1 : -1 };
      case 'crouch':
        return { movement: 0, crouching: true };
      case 'jump':
        return {
          movement: action.direction === 'forward'
            ? 1
            : action.direction === 'back' ? -1 : 0,
          jump: true,
        };
      case 'attack':
        // Only request the move on the first frame of the action; repeating it
        // every frame would restart the move the instant it became cancellable.
        return this.framesLeft === frameCountOf(action)
          ? { movement: 0, move: action.moveId }
          : NEUTRAL;
      case 'blockHigh':
        return { movement: 0, guard: true, crouching: false };
      case 'blockLow':
        return { movement: 0, guard: true, crouching: true };
      case 'guardAfterFirstHit':
        return this.hasBeenHit
          ? { movement: 0, guard: true }
          : NEUTRAL;
      case 'reversal':
        return isActionable(self)
          ? { movement: 0, move: action.moveId }
          : { movement: 0, guard: true };
      case 'recorded':
        return this.sampleReplay(action, self);
    }
  }

  private sampleReplay(
    action: Extract<DummyAction, { kind: 'recorded' }>,
    self: FighterSnapshot,
  ): FighterInput {
    this.replay ??= new InputSampler(this.commands, this.profile);
    const frame = action.frames[this.replayCursor];
    this.replayCursor += 1;
    if (frame === undefined) return NEUTRAL;
    return this.replay.sample(frame.direction, frame.buttons, self.facing);
  }
}

/** The first frame on which a fighter may act again. */
function isActionable(self: FighterSnapshot): boolean {
  return self.hitstun === 0
    && self.hitstop === 0
    && self.guardFrames === 0
    && self.action === null
    && self.grounded;
}

function frameCountOf(action: DummyAction | undefined): number {
  if (action === undefined) return 1;
  return action.kind === 'recorded'
    ? Math.max(1, action.frames.length)
    : Math.max(1, action.frames);
}
