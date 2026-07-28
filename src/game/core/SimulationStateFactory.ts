import { balanceConfig, TICKS_PER_SECOND } from '../config/balanceConfig';
import type { FighterSnapshot, PlayerId, SimulationSnapshot } from './types';

export function createFighter(
  id: PlayerId,
  x: number,
  characterId = id === 'player1' ? 'comet' : 'pulse',
): FighterSnapshot {
  return {
    id,
    characterId,
    x,
    y: balanceConfig.groundY,
    velocityX: 0,
    velocityY: 0,
    facing: id === 'player1' ? 1 : -1,
    health: balanceConfig.maxHealth,
    maxHealth: balanceConfig.maxHealth,
    energy: 0,
    maxEnergy: balanceConfig.maxEnergy,
    blockMeter: balanceConfig.maxBlockMeter,
    maxBlockMeter: balanceConfig.maxBlockMeter,
    guard: null,
    defense: {
      segments: balanceConfig.maxDefenseSegments,
      maxSegments: balanceConfig.maxDefenseSegments,
      comboEscapeCooldownTicks: 0,
      feedback: 'none',
      feedbackTicksRemaining: 0,
      effect: 'none',
      effectTicksRemaining: 0,
    },
    mode: 'idle',
    modeTicksRemaining: 0,
    attack: null,
    dashTicksRemaining: 0,
    dashDirection: id === 'player1' ? 1 : -1,
    lastMoveTapAction: null,
    lastMoveTapTick: -1_000,
    grounded: true,
  };
}

export function createInitialState(
  characters: Record<PlayerId, string> = { player1: 'comet', player2: 'pulse' },
): SimulationSnapshot {
  return {
    tick: 0,
    paused: false,
    roundNumber: 1,
    roundPhase: 'COUNTDOWN',
    phaseTicksRemaining: balanceConfig.countdownTicks,
    roundWinner: null,
    matchWinner: null,
    wins: { player1: 0, player2: 0 },
    roundTicksRemaining: balanceConfig.roundSeconds * TICKS_PER_SECOND,
    fighters: {
      player1: createFighter('player1', 250, characters.player1),
      player2: createFighter('player2', 710, characters.player2),
    },
    combos: {
      player1: createCombo(),
      player2: createCombo(),
    },
  };
}

function createCombo() {
  return {
    hits: 0,
    damage: 0,
    targetId: null,
    remainingTicks: 0,
    escapeWindowStartsInTicks: null,
    escapeWindowTicksRemaining: 0,
    breakWindowTicksRemaining: 0,
    breakAllowed: false,
  };
}
