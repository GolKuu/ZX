import { AI_TUNING, type AiDifficulty } from '../ai/AiDifficulty';
import { FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import type { InputFrame, PlayerId, SimulationSnapshot } from '../core/types';
import type { CharacterId } from '../data/characters/characterTypes';
import { BalanceAiController } from './BalanceAiController';
import { BalanceMetricTracker } from './BalanceMetricTracker';
import type { BalanceReplay } from './BalanceTypes';
import { deriveSeed } from './SeededRandom';

type MatchOptions = {
  seed: number;
  pairIndex: number;
  matchIndex: number;
  difficulty: AiDifficulty;
  player1Character: CharacterId;
  player2Character: CharacterId;
  maxMatchTicks: number;
};

export function runBalanceMatch(options: MatchOptions): BalanceReplay {
  const modifier = AI_TUNING[options.difficulty].fighterModifier;
  const simulation = new CombatSimulation(
    {
      player1: options.player1Character,
      player2: options.player2Character,
    },
    {
      fighterModifiers: modifier
        ? { player1: modifier, player2: modifier }
        : undefined,
    },
  );
  const controllers = {
    player1: new BalanceAiController(
      actorSeed(options, 'player1'),
      options.difficulty,
    ),
    player2: new BalanceAiController(
      actorSeed(options, 'player2'),
      options.difficulty,
    ),
  };
  const tracker = new BalanceMetricTracker();
  let totalTicks = 0;
  let durationTicks = 0;

  while (!stateView(simulation).matchWinner && totalTicks < options.maxMatchTicks) {
    skipNonInteractiveDelay(simulation);
    const beforeState = stateView(simulation);
    const before = tracker.capture(beforeState);
    const input: InputFrame = {
      player1: controllers.player1.frame('player1', beforeState),
      player2: controllers.player2.frame('player2', beforeState),
    };
    if (beforeState.roundPhase === 'ACTIVE') durationTicks += 1;
    simulation.step(input, FIXED_STEP_SECONDS);
    tracker.observe(before, stateView(simulation));
    totalTicks += 1;
  }

  const forcedTiebreak = !stateView(simulation).matchWinner;
  if (forcedTiebreak) applyTiebreak(simulation, tracker, options.seed);
  const finalState = stateView(simulation);
  const winner = finalState.matchWinner;
  if (!winner) throw new Error('Balance match ended without a winner');

  return {
    version: 1,
    seed: options.seed >>> 0,
    pairIndex: options.pairIndex,
    matchIndex: options.matchIndex,
    difficulty: options.difficulty,
    player1Character: options.player1Character,
    player2Character: options.player2Character,
    winner,
    durationTicks,
    totalTicks,
    forcedTiebreak,
    checksum: checksum(finalState, tracker, options.seed),
    metrics: tracker.metrics,
  };
}

export function replayBalanceMatch(replay: BalanceReplay) {
  return runBalanceMatch({
    seed: replay.seed,
    pairIndex: replay.pairIndex,
    matchIndex: replay.matchIndex,
    difficulty: replay.difficulty,
    player1Character: replay.player1Character,
    player2Character: replay.player2Character,
    maxMatchTicks: Math.max(replay.totalTicks, 1),
  });
}

function actorSeed(options: MatchOptions, playerId: PlayerId) {
  const character = playerId === 'player1'
    ? options.player1Character
    : options.player2Character;
  const mirrorSlot = options.player1Character === options.player2Character ? playerId : 'actor';
  return deriveSeed(options.seed, character, mirrorSlot);
}

function skipNonInteractiveDelay(simulation: CombatSimulation) {
  simulation.updateState((state) => {
    if (state.roundPhase === 'COUNTDOWN') {
      state.phaseTicksRemaining = 0;
      state.roundPhase = 'ACTIVE';
    } else if (state.roundPhase === 'ROUND_OVER') {
      state.phaseTicksRemaining = 0;
    }
  });
}

function applyTiebreak(
  simulation: CombatSimulation,
  tracker: BalanceMetricTracker,
  seed: number,
) {
  const firstScore = tracker.metrics.player1.damage;
  const secondScore = tracker.metrics.player2.damage;
  const winner: PlayerId = firstScore === secondScore
    ? (seed & 1) === 0 ? 'player1' : 'player2'
    : firstScore > secondScore ? 'player1' : 'player2';
  simulation.updateState((state) => {
    state.matchWinner = winner;
    state.roundWinner = winner;
    state.roundPhase = 'MATCH_OVER';
    state.wins[winner] = 2;
  });
}

function stateView(simulation: CombatSimulation) {
  let current: SimulationSnapshot | null = null;
  simulation.updateState((state) => {
    current = state;
  });
  if (!current) throw new Error('Simulation state is unavailable');
  return current;
}

function checksum(
  state: SimulationSnapshot,
  tracker: BalanceMetricTracker,
  seed: number,
) {
  return deriveSeed(
    seed,
    state.matchWinner ?? 'draw',
    state.wins.player1,
    state.wins.player2,
    state.fighters.player1.health,
    state.fighters.player2.health,
    tracker.metrics.player1.damage,
    tracker.metrics.player2.damage,
  ).toString(16).padStart(8, '0');
}
