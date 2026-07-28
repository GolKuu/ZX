import {
  closeSync,
  mkdirSync,
  openSync,
  writeFileSync,
  writeSync,
} from 'node:fs';
import { resolve } from 'node:path';
import {
  balanceReportJson,
  characterSummaryCsv,
  pairSummaryCsv,
} from '../src/game/balance/BalanceExport';
import {
  DEFAULT_BALANCE_CONFIG,
  runBalanceSimulator,
} from '../src/game/balance/BalanceSimulator';
import type { AiDifficulty } from '../src/game/ai/AiDifficulty';
import {
  CHARACTER_IDS,
  type CharacterId,
} from '../src/game/data/characters/characterTypes';

const options = parseArguments(process.argv.slice(2));
const outputDirectory = resolve(options.output);
mkdirSync(outputDirectory, { recursive: true });
const replayPath = resolve(outputDirectory, 'replays.jsonl');
const replayFile = openSync(replayPath, 'w');

try {
  const report = runBalanceSimulator(
    {
      matchesPerPair: options.matches,
      baseSeed: options.seed,
      difficulty: options.difficulty,
      characterIds: options.characters,
      allowIncompleteRun: options.allowSmallRun,
    },
    {
      onReplay: (replay) => {
        writeSync(replayFile, `${JSON.stringify(replay)}\n`);
      },
      onPairComplete: (completed, total, pair) => {
        process.stdout.write(
          `[balance] ${completed}/${total} ${pair.characterA} vs ${pair.characterB}\n`,
        );
      },
    },
  );
  writeFileSync(
    resolve(outputDirectory, 'balance-report.json'),
    balanceReportJson(report),
  );
  writeFileSync(
    resolve(outputDirectory, 'pair-summary.csv'),
    pairSummaryCsv(report),
  );
  writeFileSync(
    resolve(outputDirectory, 'character-summary.csv'),
    characterSummaryCsv(report),
  );
  process.stdout.write(`${JSON.stringify({
    totalMatches: report.totalMatches,
    pairs: report.pairs.length,
    violations: report.violations.length,
    outputDirectory,
  })}\n`);
  if (options.failOnTargets && report.violations.length > 0) process.exitCode = 2;
} finally {
  closeSync(replayFile);
}

type CliOptions = {
  matches: number;
  seed: number;
  difficulty: AiDifficulty;
  characters: CharacterId[];
  output: string;
  allowSmallRun: boolean;
  failOnTargets: boolean;
};

function parseArguments(argumentsList: string[]): CliOptions {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!argument.startsWith('--')) continue;
    const name = argument.slice(2);
    const next = argumentsList[index + 1];
    if (!next || next.startsWith('--')) flags.add(name);
    else {
      values.set(name, next);
      index += 1;
    }
  }
  const difficulty = (values.get('difficulty') ?? 'HARD') as AiDifficulty;
  if (!['EASY', 'MEDIUM', 'HARD', 'VERY_HARD'].includes(difficulty)) {
    throw new Error(`Unknown difficulty: ${difficulty}`);
  }
  const characters = (values.get('characters')?.split(',') ?? [...CHARACTER_IDS])
    .map((value) => value.trim()) as CharacterId[];
  characters.forEach((character) => {
    if (!CHARACTER_IDS.includes(character)) throw new Error(`Unknown character: ${character}`);
  });
  return {
    matches: integer(values.get('matches'), DEFAULT_BALANCE_CONFIG.matchesPerPair),
    seed: integer(values.get('seed'), DEFAULT_BALANCE_CONFIG.baseSeed),
    difficulty,
    characters,
    output: values.get('output') ?? 'artifacts/balance',
    allowSmallRun: flags.has('allow-small-run'),
    failOnTargets: flags.has('fail-on-targets'),
  };
}

function integer(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return parsed;
}
