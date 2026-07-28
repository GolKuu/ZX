import { balanceConfig, TICKS_PER_SECOND } from '../config/balanceConfig';
import type { FighterSnapshot, PlayerId, SimulationSnapshot } from './types';

export function createFighter(id: PlayerId, x: number): FighterSnapshot {
  return {
    id,
    x,
    y: balanceConfig.groundY,
    velocityX: 0,
    velocityY: 0,
    facing: id === 'player1' ? 1 : -1,
    health: balanceConfig.maxHealth,
    mode: 'idle',
    modeTicksRemaining: 0,
    attackCooldownTicks: 0,
    dashTicksRemaining: 0,
    dashDirection: id === 'player1' ? 1 : -1,
    lastMoveTapAction: null,
    lastMoveTapTick: -1_000,
    grounded: true,
  };
}

export function createInitialState(): SimulationSnapshot {
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
      player1: createFighter('player1', 250),
      player2: createFighter('player2', 710),
    },
  };
}
