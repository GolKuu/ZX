import type { CombatEvent } from '../sim/events.js';
import type { MoveFrameData } from '../sim/frame-data.js';
import type { FighterSnapshot, WorldSnapshot } from '../sim/state.js';
import { ComboPlanner } from './combo-planner.js';
import { DefensePlanner } from './defense-planner.js';
import { ObservationBuffer } from './observation.js';
import { findFighter, findOpponent } from './perception.js';
import type { TacticalPlan } from './planning.js';
import { AI_DIFFICULTY_PROFILES } from './profiles.js';
import { DeterministicRandom } from './rng.js';
import { TacticsPlanner } from './tactics-planner.js';
import {
  TelegraphController,
  type TelegraphRequest,
} from './telegraph.js';
import type {
  AiDecision,
  AiDifficulty,
  AiEvent,
  AiIntent,
  AiLoadout,
} from './types.js';
import { validateAiLoadout } from './validation.js';

export interface CombatAiOptions {
  readonly fighterId: string;
  readonly opponentId?: string;
  readonly difficulty: AiDifficulty;
  readonly moves: readonly MoveFrameData[];
  readonly loadout: AiLoadout;
  readonly seed?: number;
}

export class CombatAiAgent {
  private readonly moves: ReadonlyMap<string, MoveFrameData>;
  private readonly initialSeed: number;
  private readonly combo: ComboPlanner;
  private readonly defense = new DefensePlanner();
  private readonly tactics = new TacticsPlanner();
  private readonly observation: ObservationBuffer;
  private readonly telegraph = new TelegraphController();
  private random: DeterministicRandom;
  private lastWorldFrame = -1;

  public constructor(private readonly options: CombatAiOptions) {
    if (options.fighterId.length === 0) {
      throw new Error('AI fighterId cannot be empty');
    }
    this.moves = new Map(options.moves.map((move) => [move.id, move]));
    validateAiLoadout(options.loadout, this.moves);
    const profile = AI_DIFFICULTY_PROFILES[options.difficulty];
    this.combo = new ComboPlanner(this.moves, options.loadout, profile);
    this.observation = new ObservationBuffer(profile.reactionFrames);
    this.initialSeed = options.seed ?? hashSeed(options.fighterId, options.difficulty);
    this.random = new DeterministicRandom(this.initialSeed);
  }

  public decide(
    world: WorldSnapshot,
    combatEvents: readonly CombatEvent[] = [],
  ): AiDecision {
    this.assertNextFrame(world.frame);
    this.observation.push(world);
    const self = findFighter(world, this.options.fighterId);
    const opponent = this.currentOpponent(world, self);
    const events = this.processEvents(world.frame, self, opponent, combatEvents);

    const pending = this.progressTelegraph(world.frame, self, opponent, events);
    if (pending !== null) {
      return pending;
    }
    if (self.health === 0 || self.hitstop > 0 || self.hitstun > 0) {
      return makeDecision({}, 'idle', null, events);
    }

    const comboRequest = this.combo.plan(self, opponent);
    if (comboRequest !== null) {
      return this.startTelegraph(world.frame, self, comboRequest, events);
    }
    if (self.action !== null) {
      return makeDecision({}, 'idle', null, events);
    }

    const observed = this.observation.read();
    const observedSelf = findFighter(observed, self.id);
    const observedOpponent = findFighter(observed, opponent.id);
    const profile = AI_DIFFICULTY_PROFILES[this.options.difficulty];
    const defense = this.defense.plan(
      self,
      observedSelf,
      observedOpponent,
      this.moves,
      profile,
      this.random,
    );
    if (defense !== null) {
      return makeDecision(defense.input, defense.intent, null, events);
    }
    const punish = this.tactics.planPunish(
      self,
      observedSelf,
      observedOpponent,
      this.moves,
      this.options.loadout,
      profile,
      this.random,
    );
    if (punish !== null) {
      return this.applyPlan(world.frame, self, punish, events);
    }
    const neutral = this.tactics.planNeutral(
      self,
      observedOpponent,
      this.moves,
      this.options.loadout,
      profile,
      this.random,
    );
    return this.applyPlan(world.frame, self, neutral, events);
  }

  public reset(seed = this.initialSeed): void {
    this.random = new DeterministicRandom(seed);
    this.combo.clear();
    this.defense.reset();
    this.tactics.reset();
    this.observation.reset();
    this.telegraph.reset();
    this.lastWorldFrame = -1;
  }

  private progressTelegraph(
    frame: number,
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    events: AiEvent[],
  ): AiDecision | null {
    const request = this.telegraph.request();
    if (request === null) {
      return null;
    }
    const progress = this.telegraph.evaluate(frame, self.id, self, opponent);
    events.push(...progress.events);
    if (progress.cancelledReason !== undefined) {
      this.combo.clear();
      return makeDecision({}, 'idle', null, events);
    }
    if (progress.committed === null) {
      return makeDecision({}, request.intent, this.telegraph.read(), events);
    }
    if (progress.committed.consumeCombo) {
      this.combo.consume();
    }
    return makeDecision(
      { move: progress.committed.moveId },
      progress.committed.intent,
      null,
      events,
    );
  }

  private processEvents(
    frame: number,
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    combatEvents: readonly CombatEvent[],
  ): AiEvent[] {
    const events: AiEvent[] = [];
    const interrupted = combatEvents.some(
      (event) =>
        (event.type === 'hit' || event.type === 'block')
        && event.defenderId === self.id,
    );
    if (interrupted) {
      const cancelled = this.telegraph.cancel(frame, self.id, 'hit');
      if (cancelled !== null) {
        events.push(cancelled);
      }
      this.combo.clear();
      this.defense.reset();
      return events;
    }
    const landed = combatEvents.find(
      (event) =>
        event.type === 'hit'
        && event.attackerId === self.id
        && event.defenderId === opponent.id,
    );
    if (landed?.type === 'hit') {
      this.combo.queueFromHit(landed.moveId);
    }
    return events;
  }

  private applyPlan(
    frame: number,
    self: FighterSnapshot,
    plan: TacticalPlan,
    events: AiEvent[],
  ): AiDecision {
    return plan.kind === 'input'
      ? makeDecision(plan.input, plan.intent, null, events)
      : this.startTelegraph(frame, self, plan.request, events);
  }

  private startTelegraph(
    frame: number,
    self: FighterSnapshot,
    request: TelegraphRequest,
    events: AiEvent[],
  ): AiDecision {
    events.push(this.telegraph.start(frame, self.id, request));
    return makeDecision({}, request.intent, this.telegraph.read(), events);
  }

  private currentOpponent(
    world: WorldSnapshot,
    self: FighterSnapshot,
  ): FighterSnapshot {
    return this.options.opponentId === undefined
      ? findOpponent(world, self)
      : findFighter(world, this.options.opponentId);
  }

  private assertNextFrame(frame: number): void {
    if (frame <= this.lastWorldFrame) {
      throw new Error('CombatAiAgent must be advanced once per increasing world frame');
    }
    this.lastWorldFrame = frame;
  }
}

function makeDecision(
  input: AiDecision['input'],
  intent: AiIntent,
  telegraph: AiDecision['telegraph'],
  events: readonly AiEvent[],
): AiDecision {
  return { input, intent, telegraph, events };
}

function hashSeed(fighterId: string, difficulty: AiDifficulty): number {
  let hash = 2_166_136_261;
  for (const character of `${fighterId}:${difficulty}`) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}
