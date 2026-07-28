import { balanceConfig, TICKS_PER_SECOND } from '../config/balanceConfig';
import type { FighterSnapshot, PlayerId, SimulationSnapshot } from './types';
import { getCharacter } from '../data/characters/circleFighters';

export type FighterModifier = {
  maxHealthMultiplier?: number;
  startingEnergy?: number;
};

export function createFighter(
  id: PlayerId,
  x: number,
  characterId = id === 'player1' ? 'granite' : 'shira',
  modifier: FighterModifier = {},
): FighterSnapshot {
  const character = getCharacter(characterId);
  const isGranite = character.id === 'granite';
  const resource = character.uniqueResource;
  const maxHealth = Math.round(
    character.stats.maxHealth * (modifier.maxHealthMultiplier ?? 1),
  );
  return {
    id,
    characterId,
    x,
    y: balanceConfig.groundY,
    velocityX: 0,
    velocityY: 0,
    facing: id === 'player1' ? 1 : -1,
    health: maxHealth,
    maxHealth,
    energy: Math.min(balanceConfig.maxEnergy, modifier.startingEnergy ?? 0),
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
    passiveValue: isGranite ? 100 : resource.initialValue,
    maxPassiveValue: isGranite ? 100 : resource.maximumValue,
    armorPlates: isGranite ? 3 : 0,
    maxArmorPlates: isGranite ? 3 : 0,
    vulnerableTicksRemaining: 0,
    landedTicksRemaining: 0,
  };
}

export function createInitialState(
  characters: Record<PlayerId, string> = { player1: 'granite', player2: 'shira' },
  modifiers: Partial<Record<PlayerId, FighterModifier>> = {},
): SimulationSnapshot {
  return {
    tick: 0,
    hitStopTicks: 0,
    paused: false,
    roundNumber: 1,
    roundPhase: 'COUNTDOWN',
    phaseTicksRemaining: balanceConfig.countdownTicks,
    roundWinner: null,
    matchWinner: null,
    wins: { player1: 0, player2: 0 },
    roundTicksRemaining: balanceConfig.roundSeconds * TICKS_PER_SECOND,
    fighters: {
      player1: createFighter('player1', 250, characters.player1, modifiers.player1),
      player2: createFighter('player2', 710, characters.player2, modifiers.player2),
    },
    combos: {
      player1: createCombo(),
      player2: createCombo(),
    },
    traps: [
      { id: 'ribbon-left', x: 130, active: true, cuttable: true },
      { id: 'stone-center', x: 480, active: true, cuttable: false },
      { id: 'ribbon-right', x: 830, active: true, cuttable: true },
    ],
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
