import { CHARACTER_IDS, type CharacterId } from '../data/characters/characterTypes';
import { BalanceAggregator, PairAggregator } from './BalanceAggregator';
import { runBalanceMatch } from './BalanceMatchRunner';
import { BALANCE_TARGETS, evaluateBalance } from './BalanceTargets';
import type {
  BalanceReport,
  BalanceRunHooks,
  BalanceSimulatorConfig,
} from './BalanceTypes';
import { deriveSeed } from './SeededRandom';

export const DEFAULT_BALANCE_CONFIG: BalanceSimulatorConfig = {
  matchesPerPair: 500,
  baseSeed: 0xc1ac2026,
  difficulty: 'HARD',
  characterIds: [...CHARACTER_IDS],
  maxMatchTicks: 60 * 90 * 5,
};

export function runBalanceSimulator(
  input: Partial<BalanceSimulatorConfig> = {},
  hooks: BalanceRunHooks = {},
): BalanceReport {
  const config = { ...DEFAULT_BALANCE_CONFIG, ...input };
  validateConfig(config);
  const pairs = createPairs(config.characterIds);
  const global = new BalanceAggregator();
  const pairSummaries = pairs.map(([characterA, characterB], pairIndex) => {
    const pair = new PairAggregator(characterA, characterB);
    for (let matchIndex = 0; matchIndex < config.matchesPerPair; matchIndex += 1) {
      const swapped = characterA !== characterB && matchIndex % 2 === 1;
      const seed = deriveSeed(
        config.baseSeed,
        characterA,
        characterB,
        Math.floor(matchIndex / 2),
      );
      const replay = runBalanceMatch({
        seed,
        pairIndex,
        matchIndex,
        difficulty: config.difficulty,
        player1Character: swapped ? characterB : characterA,
        player2Character: swapped ? characterA : characterB,
        maxMatchTicks: config.maxMatchTicks ?? DEFAULT_BALANCE_CONFIG.maxMatchTicks!,
      });
      pair.add(replay);
      global.addCharacterResults(replay);
      hooks.onReplay?.(replay);
    }
    const summary = pair.summary();
    hooks.onPairComplete?.(pairIndex + 1, pairs.length, summary);
    return summary;
  });
  const characters = global.characterSummaries();
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    baseSeed: config.baseSeed >>> 0,
    difficulty: config.difficulty,
    matchesPerPair: config.matchesPerPair,
    totalMatches: pairs.length * config.matchesPerPair,
    sideSwitching: true,
    fixedSeeds: true,
    characterIds: [...config.characterIds],
    targets: BALANCE_TARGETS,
    pairs: pairSummaries,
    characters,
    violations: evaluateBalance(pairSummaries, characters),
  };
}

export function createPairs(characterIds: CharacterId[]) {
  const pairs: Array<[CharacterId, CharacterId]> = [];
  characterIds.forEach((first, firstIndex) => {
    characterIds.slice(firstIndex).forEach((second) => pairs.push([first, second]));
  });
  return pairs;
}

function validateConfig(config: BalanceSimulatorConfig) {
  if (!Number.isInteger(config.matchesPerPair) || config.matchesPerPair < 1) {
    throw new Error('matchesPerPair must be a positive integer');
  }
  if (config.matchesPerPair < 500 && !config.allowIncompleteRun) {
    throw new Error('A publishable balance run requires at least 500 matches per pair');
  }
  if (config.characterIds.length < 1) throw new Error('At least one character is required');
  if (new Set(config.characterIds).size !== config.characterIds.length) {
    throw new Error('Character list contains duplicates');
  }
}
