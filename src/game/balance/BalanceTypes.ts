import type { AiDifficulty } from '../ai/AiDifficulty';
import type { CharacterId } from '../data/characters/characterTypes';
import type { MatchupRelation } from '../data/forceMatchups';

export type FighterMetrics = {
  damage: number;
  maxComboLength: number;
  autoCombos: number;
  blocks: number;
  perfectBlocks: number;
  comboEscapes: number;
  comboBreaks: number;
  momentumReversals: number;
  specialMoves: number;
};

export type BalanceReplay = {
  version: 1;
  seed: number;
  pairIndex: number;
  matchIndex: number;
  difficulty: AiDifficulty;
  player1Character: CharacterId;
  player2Character: CharacterId;
  winner: 'player1' | 'player2';
  durationTicks: number;
  totalTicks: number;
  forcedTiebreak: boolean;
  checksum: string;
  metrics: Record<'player1' | 'player2', FighterMetrics>;
};

export type PairSummary = {
  characterA: CharacterId;
  characterB: CharacterId;
  relationA: MatchupRelation;
  matches: number;
  sideOneMatches: number;
  sideTwoMatches: number;
  winsA: number;
  winsB: number;
  trackedWinRate: number;
  advantageCharacter: CharacterId | null;
  advantageWinRate: number | null;
  averageDurationSeconds: number;
  metricsA: FighterMetricAverages;
  metricsB: FighterMetricAverages;
};

export type FighterMetricAverages = {
  averageDamage: number;
  averageComboLength: number;
  maxComboLength: number;
  autoCombosPerMatch: number;
  blocksPerMatch: number;
  perfectBlocksPerMatch: number;
  comboEscapesPerMatch: number;
  comboBreaksPerMatch: number;
  momentumReversalsPerMatch: number;
  specialMovesPerMatch: number;
};

export type CharacterSummary = {
  character: CharacterId;
  matches: number;
  wins: number;
  winRate: number;
  metrics: FighterMetricAverages;
};

export type BalanceViolation = {
  scope: 'pair' | 'character';
  id: string;
  target: string;
  actual: number;
  message: string;
};

export type BalanceReport = {
  schemaVersion: 1;
  generatedAt: string;
  baseSeed: number;
  difficulty: AiDifficulty;
  matchesPerPair: number;
  totalMatches: number;
  sideSwitching: true;
  fixedSeeds: true;
  characterIds: CharacterId[];
  targets: {
    neutral: [48, 52];
    advantage: [52, 57];
    pairFloor: [40, 60];
    character: [47, 53];
  };
  pairs: PairSummary[];
  characters: CharacterSummary[];
  violations: BalanceViolation[];
};

export type BalanceSimulatorConfig = {
  matchesPerPair: number;
  baseSeed: number;
  difficulty: AiDifficulty;
  characterIds: CharacterId[];
  allowIncompleteRun?: boolean;
  maxMatchTicks?: number;
};

export type BalanceRunHooks = {
  onReplay?: (replay: BalanceReplay) => void;
  onPairComplete?: (completed: number, total: number, pair: PairSummary) => void;
};
