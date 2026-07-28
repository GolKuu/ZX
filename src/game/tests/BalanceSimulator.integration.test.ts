import { describe, expect, it } from 'vitest';
import {
  balanceReportJson,
  characterSummaryCsv,
  pairSummaryCsv,
} from '../balance/BalanceExport';
import {
  createPairs,
  runBalanceSimulator,
} from '../balance/BalanceSimulator';
import { replayBalanceMatch } from '../balance/BalanceMatchRunner';
import type { BalanceReplay } from '../balance/BalanceTypes';
import { CHARACTER_IDS } from '../data/characters/characterTypes';

describe('Balance Simulator integration', () => {
  it('covers every roster pair, including mirrors', () => {
    expect(createPairs([...CHARACTER_IDS])).toHaveLength(120);
  });

  it('uses fixed seeds, switches sides and reproduces replay checksums', () => {
    const replays: BalanceReplay[] = [];
    const config = {
      matchesPerPair: 4,
      baseSeed: 20260728,
      difficulty: 'HARD' as const,
      characterIds: ['granite', 'shira'] as const,
      allowIncompleteRun: true,
    };
    const first = runBalanceSimulator(
      { ...config, characterIds: [...config.characterIds] },
      { onReplay: (replay) => replays.push(replay) },
    );
    const second = runBalanceSimulator({
      ...config,
      characterIds: [...config.characterIds],
    });

    expect(first.totalMatches).toBe(12);
    expect(first.pairs.map((pair) => [pair.sideOneMatches, pair.sideTwoMatches]))
      .toEqual([[2, 2], [2, 2], [2, 2]]);
    expect(first.pairs).toEqual(second.pairs);
    expect(first.characters).toEqual(second.characters);
    expect(replayBalanceMatch(replays[0])).toMatchObject({
      winner: replays[0].winner,
      checksum: replays[0].checksum,
      metrics: replays[0].metrics,
    });
  });

  it('enforces the 500-match publication floor and exports CSV and JSON', () => {
    expect(() => runBalanceSimulator({
      matchesPerPair: 499,
      characterIds: ['granite'],
    })).toThrow(/at least 500/);

    const report = runBalanceSimulator({
      matchesPerPair: 1,
      characterIds: ['granite'],
      allowIncompleteRun: true,
    });
    expect(balanceReportJson(report)).toContain('"fixedSeeds": true');
    expect(pairSummaryCsv(report)).toContain('perfect_blocks_per_match');
    expect(characterSummaryCsv(report)).toContain('momentum_reversal_per_match');
  });
});
