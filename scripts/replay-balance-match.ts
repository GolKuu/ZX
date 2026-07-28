import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { replayBalanceMatch } from '../src/game/balance/BalanceMatchRunner';
import type { BalanceReplay } from '../src/game/balance/BalanceTypes';

const replayFile = resolve(process.argv[2] || 'artifacts/balance/replays.jsonl');
const lineNumber = Math.max(1, Number(process.argv[3] || 1));
const line = readFileSync(replayFile, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)[lineNumber - 1];
if (!line) throw new Error(`Replay line ${lineNumber} does not exist`);

const saved = JSON.parse(line) as BalanceReplay;
const replayed = replayBalanceMatch(saved);
const valid = replayed.checksum === saved.checksum && replayed.winner === saved.winner;
process.stdout.write(`${JSON.stringify({
  valid,
  expectedChecksum: saved.checksum,
  actualChecksum: replayed.checksum,
  winner: replayed.winner,
  seed: saved.seed,
})}\n`);
if (!valid) process.exitCode = 1;
