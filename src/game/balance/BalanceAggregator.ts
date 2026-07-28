import type { PlayerId } from '../core/types';
import type { CharacterId } from '../data/characters/characterTypes';
import { characterMatchup } from '../data/forceMatchups';
import type {
  BalanceReplay,
  CharacterSummary,
  FighterMetricAverages,
  FighterMetrics,
  PairSummary,
} from './BalanceTypes';

type MetricTotals = FighterMetrics & {
  appearances: number;
  comboLengthSum: number;
};

export class BalanceAggregator {
  private readonly characterTotals = new Map<CharacterId, {
    matches: number;
    wins: number;
    metrics: MetricTotals;
  }>();

  addCharacterResults(replay: BalanceReplay) {
    this.addCharacter(
      replay.player1Character,
      replay.winner === 'player1',
      replay.metrics.player1,
    );
    this.addCharacter(
      replay.player2Character,
      replay.winner === 'player2',
      replay.metrics.player2,
    );
  }

  characterSummaries() {
    return [...this.characterTotals.entries()]
      .map(([character, total]): CharacterSummary => ({
        character,
        matches: total.matches,
        wins: total.wins,
        winRate: percent(total.wins, total.matches),
        metrics: averages(total.metrics),
      }))
      .sort((first, second) => first.character.localeCompare(second.character));
  }

  private addCharacter(
    character: CharacterId,
    won: boolean,
    metrics: FighterMetrics,
  ) {
    const total = this.characterTotals.get(character) ?? {
      matches: 0,
      wins: 0,
      metrics: emptyTotals(),
    };
    total.matches += 1;
    if (won) total.wins += 1;
    addMetrics(total.metrics, metrics);
    this.characterTotals.set(character, total);
  }
}

export class PairAggregator {
  private winsA = 0;
  private winsB = 0;
  private durationTicks = 0;
  private sideOneMatches = 0;
  private sideTwoMatches = 0;
  private readonly metricsA = emptyTotals();
  private readonly metricsB = emptyTotals();

  constructor(
    private readonly characterA: CharacterId,
    private readonly characterB: CharacterId,
  ) {}

  add(replay: BalanceReplay) {
    const mirror = this.characterA === this.characterB;
    const aIsPlayerOne = mirror
      ? replay.matchIndex % 2 === 0
      : replay.player1Character === this.characterA;
    if (aIsPlayerOne) this.sideOneMatches += 1;
    else this.sideTwoMatches += 1;
    const winnerCharacter = replay.winner === 'player1'
      ? replay.player1Character
      : replay.player2Character;
    if (mirror) {
      if (
        (aIsPlayerOne && replay.winner === 'player1') ||
        (!aIsPlayerOne && replay.winner === 'player2')
      ) this.winsA += 1;
      else this.winsB += 1;
    } else if (winnerCharacter === this.characterA) {
      this.winsA += 1;
    } else {
      this.winsB += 1;
    }
    this.durationTicks += replay.durationTicks;
    this.addReplayMetrics(replay, aIsPlayerOne);
  }

  summary(): PairSummary {
    const matches = this.winsA + this.winsB;
    const relationA = characterMatchup(this.characterA, this.characterB).relation;
    const advantageCharacter = this.characterA === this.characterB
      ? null
      : relationA === 'ADVANTAGE' ? this.characterA : this.characterB;
    const advantageWins = advantageCharacter === this.characterA ? this.winsA : this.winsB;
    return {
      characterA: this.characterA,
      characterB: this.characterB,
      relationA,
      matches,
      sideOneMatches: this.sideOneMatches,
      sideTwoMatches: this.sideTwoMatches,
      winsA: this.winsA,
      winsB: this.winsB,
      trackedWinRate: percent(this.winsA, matches),
      advantageCharacter,
      advantageWinRate: advantageCharacter ? percent(advantageWins, matches) : null,
      averageDurationSeconds: round(this.durationTicks / Math.max(1, matches) / 60),
      metricsA: averages(this.metricsA),
      metricsB: averages(this.metricsB),
    };
  }

  private addReplayMetrics(replay: BalanceReplay, aIsPlayerOne: boolean) {
    const aPlayer: PlayerId = aIsPlayerOne ? 'player1' : 'player2';
    const bPlayer: PlayerId = aIsPlayerOne ? 'player2' : 'player1';
    addMetrics(this.metricsA, replay.metrics[aPlayer]);
    addMetrics(this.metricsB, replay.metrics[bPlayer]);
  }
}

function emptyTotals(): MetricTotals {
  return {
    appearances: 0,
    comboLengthSum: 0,
    damage: 0,
    maxComboLength: 0,
    autoCombos: 0,
    blocks: 0,
    perfectBlocks: 0,
    comboEscapes: 0,
    comboBreaks: 0,
    momentumReversals: 0,
    specialMoves: 0,
  };
}

function addMetrics(total: MetricTotals, metrics: FighterMetrics) {
  total.appearances += 1;
  total.damage += metrics.damage;
  total.comboLengthSum += metrics.maxComboLength;
  total.maxComboLength = Math.max(total.maxComboLength, metrics.maxComboLength);
  total.autoCombos += metrics.autoCombos;
  total.blocks += metrics.blocks;
  total.perfectBlocks += metrics.perfectBlocks;
  total.comboEscapes += metrics.comboEscapes;
  total.comboBreaks += metrics.comboBreaks;
  total.momentumReversals += metrics.momentumReversals;
  total.specialMoves += metrics.specialMoves;
}

function averages(total: MetricTotals): FighterMetricAverages {
  const count = Math.max(1, total.appearances);
  return {
    averageDamage: round(total.damage / count),
    averageComboLength: round(total.comboLengthSum / count),
    maxComboLength: total.maxComboLength,
    autoCombosPerMatch: round(total.autoCombos / count),
    blocksPerMatch: round(total.blocks / count),
    perfectBlocksPerMatch: round(total.perfectBlocks / count),
    comboEscapesPerMatch: round(total.comboEscapes / count),
    comboBreaksPerMatch: round(total.comboBreaks / count),
    momentumReversalsPerMatch: round(total.momentumReversals / count),
    specialMovesPerMatch: round(total.specialMoves / count),
  };
}

function percent(value: number, total: number) {
  return round((value / Math.max(1, total)) * 100);
}

function round(value: number) {
  return Math.round(value * 1_000) / 1_000;
}
