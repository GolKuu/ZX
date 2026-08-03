import type { CombatEvent } from '../sim/events.js';
import type { MoveFrameData } from '../sim/frame-data.js';
import type { WorldSnapshot } from '../sim/state.js';
import { ActionController } from './action-controller.js';
import { createAiSeed, createDecision } from './decision.js';
import { DefensePlanner } from './defense-planner.js';
import { NeutralPlanner } from './neutral-planner.js';
import { findFighter, resolveOpponent } from './perception.js';
import { executePlan } from './plan-execution.js';
import { AI_DIFFICULTY_PROFILES } from './profiles.js';
import { ReactionHistory } from './reaction-history.js';
import { DeterministicRandom } from './rng.js';
import type {
  AiDecision,
  AiDifficulty,
  AiDifficultyProfile,
  AiLoadout,
  AiStrategy,
} from './types.js';
import { validateAiLoadout } from './validation.js';
import { applyAiStrategy } from './strategy.js';

export interface CombatAiOptions {
  readonly fighterId: string;
  readonly opponentId?: string;
  readonly difficulty: AiDifficulty;
  readonly moves: readonly MoveFrameData[];
  readonly loadout: AiLoadout;
  readonly strategy?: AiStrategy;
  readonly seed?: number;
}

export class CombatAiAgent {
  private readonly moves: ReadonlyMap<string, MoveFrameData>;
  private readonly actions: ActionController;
  private readonly defense = new DefensePlanner();
  private readonly neutral = new NeutralPlanner();
  private readonly history: ReactionHistory;
  private readonly profile: AiDifficultyProfile;
  private readonly initialSeed: number;
  private random: DeterministicRandom;
  private lastWorldFrame = -1;

  public constructor(private readonly options: CombatAiOptions) {
    if (options.fighterId.length === 0) {
      throw new Error('AI fighterId cannot be empty');
    }
    this.moves = new Map(options.moves.map((move) => [move.id, move]));
    validateAiLoadout(options.loadout, this.moves);
    this.profile = applyAiStrategy(
      AI_DIFFICULTY_PROFILES[options.difficulty],
      options.strategy,
    );
    this.history = new ReactionHistory(this.profile.reactionFrames);
    this.actions = new ActionController(this.moves, options.loadout);
    this.initialSeed =
      options.seed ?? createAiSeed(options.fighterId, options.difficulty);
    this.random = new DeterministicRandom(this.initialSeed);
  }

  public decide(
    world: WorldSnapshot,
    combatEvents: readonly CombatEvent[] = [],
  ): AiDecision {
    if (world.frame <= this.lastWorldFrame) {
      throw new Error('CombatAiAgent must advance once per increasing world frame');
    }
    this.lastWorldFrame = world.frame;
    this.history.remember(world);

    const self = findFighter(world, this.options.fighterId);
    const opponent = resolveOpponent(world, self, this.options.opponentId);
    const profile = this.profile;
    const signals = this.actions.processCombatEvents(
      world.frame,
      self,
      opponent,
      combatEvents,
      profile.comboDepth,
    );
    if (signals.interrupted) this.defense.reset();

    const pending = this.actions.advance(
      world.frame,
      self,
      opponent,
      signals.events,
    );
    if (pending !== null) return pending;
    if (self.health === 0 || self.hitstop > 0 || self.hitstun > 0) {
      return createDecision({}, 'idle', null, signals.events);
    }

    const combo = this.actions.planCombo(
      world.frame,
      self,
      opponent,
      profile.comboTelegraphFrames,
      signals.events,
    );
    if (combo !== null) return combo;
    if (self.action !== null) {
      return createDecision({}, 'idle', null, signals.events);
    }

    const observed = this.history.observed();
    const observedSelf = findFighter(observed, self.id);
    const observedOpponent = findFighter(observed, opponent.id);
    const defense = this.defense.defend(
      self,
      observedSelf,
      observedOpponent,
      profile,
      this.moves,
      this.random,
      this.options.loadout,
    );
    if (defense !== null) {
      return createDecision(defense.input, defense.intent, null, signals.events);
    }
    const punish = this.defense.punish(
      observedSelf,
      observedOpponent,
      profile,
      this.options.loadout,
      this.moves,
      this.random,
    );
    const plan = punish ?? this.neutral.plan(
      self,
      observedOpponent,
      profile,
      this.options.loadout,
      this.moves,
      this.random,
    );
    return executePlan(
      this.actions,
      world.frame,
      self,
      plan,
      signals.events,
    );
  }

  public reset(seed = this.initialSeed): void {
    this.random = new DeterministicRandom(seed);
    this.actions.reset();
    this.defense.reset();
    this.neutral.reset();
    this.history.reset();
    this.lastWorldFrame = -1;
  }

}
