import type { CombatEvent } from '../sim/events.js';
import type { MoveFrameData } from '../sim/frame-data.js';
import type {
  FighterInput,
  FighterSnapshot,
  WorldSnapshot,
} from '../sim/state.js';
import {
  approachInput,
  distanceBetween,
  findFighter,
  findOpponent,
  isRecovering,
  isThreatening,
} from './perception.js';
import { AI_DIFFICULTY_PROFILES } from './profiles.js';
import { DeterministicRandom } from './rng.js';
import { chooseMove } from './selection.js';
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
  AiMoveOption,
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

type DefenseChoice = 'guard' | 'retreat' | 'none';

export class CombatAiAgent {
  private readonly moves: ReadonlyMap<string, MoveFrameData>;
  private readonly telegraph = new TelegraphController();
  private readonly initialSeed: number;
  private random: DeterministicRandom;
  private history: WorldSnapshot[] = [];
  private comboQueue: string[] = [];
  private lastWorldFrame = -1;
  private decisionCooldown = 0;
  private defenseSerial: number | null = null;
  private defenseChoice: DefenseChoice = 'none';
  private punishSerial: number | null = null;

  public constructor(private readonly options: CombatAiOptions) {
    if (options.fighterId.length === 0) {
      throw new Error('AI fighterId cannot be empty');
    }
    this.moves = new Map(options.moves.map((move) => [move.id, move]));
    validateAiLoadout(options.loadout, this.moves);
    this.initialSeed = options.seed ?? hashSeed(options.fighterId, options.difficulty);
    this.random = new DeterministicRandom(this.initialSeed);
  }

  public decide(
    world: WorldSnapshot,
    combatEvents: readonly CombatEvent[] = [],
  ): AiDecision {
    if (world.frame <= this.lastWorldFrame) {
      throw new Error('CombatAiAgent must be advanced once per increasing world frame');
    }
    this.lastWorldFrame = world.frame;
    this.remember(world);

    const self = findFighter(world, this.options.fighterId);
    const opponent = this.currentOpponent(world, self);
    const events = this.processCombatEvents(world.frame, self, opponent, combatEvents);
    const pending = this.advanceTelegraph(world.frame, self, opponent, events);
    if (pending !== null) {
      return pending;
    }
    if (self.health === 0 || self.hitstop > 0 || self.hitstun > 0) {
      return decision({}, 'idle', this.telegraph.read(), events);
    }

    const combo = this.planCombo(world.frame, self, opponent, events);
    if (combo !== null) {
      return combo;
    }
    if (self.action !== null) {
      return decision({}, 'idle', null, events);
    }

    const observed = this.observedWorld();
    const observedSelf = findFighter(observed, self.id);
    const observedOpponent = this.opponentById(observed, opponent.id);
    const defense = this.planDefense(self, observedSelf, observedOpponent, events);
    if (defense !== null) {
      return defense;
    }
    const punish = this.planWhiffPunish(
      world.frame,
      self,
      observedSelf,
      observedOpponent,
      events,
    );
    if (punish !== null) {
      return punish;
    }
    return this.planNeutral(world.frame, self, observedOpponent, events);
  }

  public reset(seed = this.initialSeed): void {
    this.random = new DeterministicRandom(seed);
    this.telegraph.reset();
    this.history = [];
    this.comboQueue = [];
    this.lastWorldFrame = -1;
    this.decisionCooldown = 0;
    this.defenseSerial = null;
    this.defenseChoice = 'none';
    this.punishSerial = null;
  }

  private advanceTelegraph(
    frame: number,
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    events: AiEvent[],
  ): AiDecision | null {
    const request = this.telegraph.request();
    if (request === null) {
      return null;
    }
    if (self.hitstun > 0 || self.health === 0) {
      this.cancelTelegraph(frame, 'hit', events);
      this.comboQueue = [];
      return decision({}, 'idle', null, events);
    }
    if (request.intent === 'combo' && opponent.hitstun === 0) {
      this.cancelTelegraph(frame, 'targetRecovered', events);
      this.comboQueue = [];
      return decision({}, 'idle', null, events);
    }
    if (!this.sourceStateIsValid(self, request)) {
      this.cancelTelegraph(frame, 'stateChanged', events);
      return decision({}, 'idle', null, events);
    }

    const progress = this.telegraph.advance(frame, self.id, self.hitstop > 0);
    events.push(...progress.events);
    if (progress.committed === null) {
      return decision({}, request.intent, this.telegraph.read(), events);
    }
    if (progress.committed.consumeCombo) {
      this.comboQueue.shift();
    }
    return decision(
      { move: progress.committed.moveId },
      progress.committed.intent,
      null,
      events,
    );
  }

  private planCombo(
    frame: number,
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    events: AiEvent[],
  ): AiDecision | null {
    const moveId = this.comboQueue[0];
    if (moveId === undefined) {
      return null;
    }
    if (opponent.hitstun === 0) {
      this.comboQueue = [];
      return null;
    }
    const duration = this.comboTelegraphDuration(self, moveId);
    if (duration === null) {
      this.comboQueue = [];
      return null;
    }
    const move = this.moves.get(moveId);
    if (
      self.action === null
      && move !== undefined
      && opponent.hitstun <= duration + move.startup
    ) {
      this.comboQueue = [];
      return null;
    }
    return this.beginTelegraph(
      frame,
      self,
      moveId,
      'combo',
      this.cueFor(moveId),
      duration,
      true,
      events,
    );
  }

  private planDefense(
    self: FighterSnapshot,
    observedSelf: FighterSnapshot,
    opponent: FighterSnapshot,
    events: AiEvent[],
  ): AiDecision | null {
    const serial = opponent.action?.serial ?? null;
    const distance = distanceBetween(observedSelf, opponent);
    const profile = AI_DIFFICULTY_PROFILES[this.options.difficulty];
    const threatening = isThreatening(
      opponent,
      distance,
      this.moves,
      profile.threatMargin,
    );
    if (!threatening) {
      if (serial === null) {
        this.defenseSerial = null;
        this.defenseChoice = 'none';
      }
      return null;
    }
    if (serial !== this.defenseSerial) {
      this.defenseSerial = serial;
      this.defenseChoice =
        this.random.percent() < profile.defensePercent
          ? this.random.percent() < profile.guardPercent
            ? 'guard'
            : 'retreat'
          : 'none';
    }
    if (this.defenseChoice === 'guard') {
      return decision({ guard: true }, 'guard', null, events);
    }
    if (this.defenseChoice === 'retreat') {
      return decision(
        { movement: negateDirection(approachInput(self, opponent)) },
        'retreat',
        null,
        events,
      );
    }
    return null;
  }

  private planWhiffPunish(
    frame: number,
    self: FighterSnapshot,
    observedSelf: FighterSnapshot,
    opponent: FighterSnapshot,
    events: AiEvent[],
  ): AiDecision | null {
    const serial = opponent.action?.serial ?? null;
    if (serial === null || !isRecovering(opponent, this.moves)) {
      if (serial === null) {
        this.punishSerial = null;
      }
      return null;
    }
    if (serial === this.punishSerial) {
      return null;
    }
    this.punishSerial = serial;
    const profile = AI_DIFFICULTY_PROFILES[this.options.difficulty];
    if (this.random.percent() >= profile.whiffPunishPercent) {
      return null;
    }
    const option = chooseMove(
      this.options.loadout.whiffPunishes,
      distanceBetween(observedSelf, opponent),
      this.moves,
      this.random,
    );
    return option === null
      ? null
      : this.beginOptionTelegraph(
          frame,
          self,
          option,
          'whiffPunish',
          profile.punishTelegraphFrames,
          events,
        );
  }

  private planNeutral(
    frame: number,
    self: FighterSnapshot,
    opponent: FighterSnapshot,
    events: AiEvent[],
  ): AiDecision {
    const profile = AI_DIFFICULTY_PROFILES[this.options.difficulty];
    const distance = distanceBetween(self, opponent);
    if (distance > profile.preferredMaximumDistance) {
      return decision(
        { movement: approachInput(self, opponent) },
        'approach',
        null,
        events,
      );
    }
    if (distance < profile.preferredMinimumDistance) {
      return decision(
        { movement: negateDirection(approachInput(self, opponent)) },
        'retreat',
        null,
        events,
      );
    }
    if (this.decisionCooldown > 0) {
      this.decisionCooldown -= 1;
      return decision({}, 'idle', null, events);
    }
    this.decisionCooldown = profile.decisionInterval;
    if (
      this.random.percent() < profile.errorPercent
      || this.random.percent() >= profile.neutralAttackPercent
    ) {
      return decision({}, 'idle', null, events);
    }
    const option = chooseMove(
      this.options.loadout.neutral,
      distance,
      this.moves,
      this.random,
    );
    return option === null
      ? decision({}, 'idle', null, events)
      : this.beginOptionTelegraph(
          frame,
          self,
          option,
          'attack',
          profile.telegraphFrames,
          events,
        );
  }

  private beginOptionTelegraph(
    frame: number,
    self: FighterSnapshot,
    option: AiMoveOption,
    intent: 'attack' | 'whiffPunish',
    duration: number,
    events: AiEvent[],
  ): AiDecision {
    return this.beginTelegraph(
      frame,
      self,
      option.moveId,
      intent,
      option.cue,
      duration,
      false,
      events,
    );
  }

  private beginTelegraph(
    frame: number,
    self: FighterSnapshot,
    moveId: string,
    intent: TelegraphRequest['intent'],
    cue: string,
    durationFrames: number,
    consumeCombo: boolean,
    events: AiEvent[],
  ): AiDecision {
    const started = this.telegraph.start(frame, self.id, {
      moveId,
      intent,
      cue,
      durationFrames,
      consumeCombo,
      sourceActionSerial: self.action?.serial ?? null,
    });
    events.push(started);
    return decision({}, intent, this.telegraph.read(), events);
  }

  private processCombatEvents(
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
      this.cancelTelegraph(frame, 'hit', events);
      this.comboQueue = [];
      this.defenseSerial = null;
      this.defenseChoice = 'none';
      return events;
    }
    const landed = combatEvents.find(
      (event) =>
        event.type === 'hit'
        && event.attackerId === self.id
        && event.defenderId === opponent.id,
    );
    if (landed?.type === 'hit' && this.comboQueue.length === 0) {
      const route = this.options.loadout.combos.find(
        (candidate) => candidate.moves[0] === landed.moveId,
      );
      if (route !== undefined) {
        const depth = AI_DIFFICULTY_PROFILES[this.options.difficulty].comboDepth;
        this.comboQueue = route.moves.slice(1, depth + 1);
      }
    }
    return events;
  }

  private comboTelegraphDuration(
    self: FighterSnapshot,
    targetMoveId: string,
  ): number | null {
    const base =
      AI_DIFFICULTY_PROFILES[this.options.difficulty].comboTelegraphFrames;
    if (self.action === null) {
      return base;
    }
    const source = this.moves.get(self.action.moveId);
    const window = source?.cancels?.find((cancel) =>
      cancel.into.includes(targetMoveId),
    );
    if (window === undefined || self.action.frame >= window.frames.toExclusive) {
      return null;
    }
    const untilOpen = Math.max(0, window.frames.from - self.action.frame);
    const duration = Math.max(base, untilOpen);
    return self.action.frame + duration < window.frames.toExclusive
      ? duration
      : null;
  }

  private sourceStateIsValid(
    self: FighterSnapshot,
    request: TelegraphRequest,
  ): boolean {
    if (request.intent !== 'combo') {
      return self.action === null;
    }
    return (
      request.sourceActionSerial === null
      || self.action === null
      || self.action.serial === request.sourceActionSerial
    );
  }

  private cueFor(moveId: string): string {
    return (
      this.options.loadout.neutral.find((option) => option.moveId === moveId)?.cue
      ?? this.options.loadout.whiffPunishes.find(
        (option) => option.moveId === moveId,
      )?.cue
      ?? 'combo'
    );
  }

  private cancelTelegraph(
    frame: number,
    reason: 'hit' | 'targetRecovered' | 'stateChanged',
    events: AiEvent[],
  ): void {
    const cancelled = this.telegraph.cancel(frame, this.options.fighterId, reason);
    if (cancelled !== null) {
      events.push(cancelled);
    }
  }

  private remember(world: WorldSnapshot): void {
    this.history.push(world);
    const maximum =
      AI_DIFFICULTY_PROFILES[this.options.difficulty].reactionFrames + 1;
    if (this.history.length > maximum) {
      this.history.shift();
    }
  }

  private observedWorld(): WorldSnapshot {
    return this.history[0] ?? fail('AI observation history is empty');
  }

  private currentOpponent(
    world: WorldSnapshot,
    self: FighterSnapshot,
  ): FighterSnapshot {
    return this.options.opponentId === undefined
      ? findOpponent(world, self)
      : this.opponentById(world, this.options.opponentId);
  }

  private opponentById(world: WorldSnapshot, opponentId: string): FighterSnapshot {
    return findFighter(world, opponentId);
  }
}

function decision(
  input: FighterInput,
  intent: AiIntent,
  telegraph: AiDecision['telegraph'],
  events: readonly AiEvent[],
): AiDecision {
  return { input, intent, telegraph, events };
}

function negateDirection(direction: -1 | 1): -1 | 1 {
  return direction === 1 ? -1 : 1;
}

function hashSeed(fighterId: string, difficulty: AiDifficulty): number {
  let hash = 2_166_136_261;
  for (const character of `${fighterId}:${difficulty}`) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function fail(message: string): never {
  throw new Error(message);
}
