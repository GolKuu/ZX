import type { BalanceReport } from './BalanceTypes';

export function balanceReportJson(report: BalanceReport) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function pairSummaryCsv(report: BalanceReport) {
  const header = [
    'character_a', 'character_b', 'relation_a', 'matches',
    'side_one_matches', 'side_two_matches', 'wins_a', 'wins_b',
    'tracked_win_rate', 'advantage_character', 'advantage_win_rate',
    'average_duration_seconds', 'a_average_damage', 'b_average_damage',
    'a_average_combo', 'b_average_combo', 'a_auto_combo_per_match',
    'b_auto_combo_per_match', 'a_blocks_per_match', 'b_blocks_per_match',
    'a_perfect_blocks_per_match', 'b_perfect_blocks_per_match',
    'a_combo_escape_per_match', 'b_combo_escape_per_match',
    'a_combo_break_per_match', 'b_combo_break_per_match',
    'a_momentum_reversal_per_match', 'b_momentum_reversal_per_match',
    'a_specials_per_match', 'b_specials_per_match',
  ];
  const rows = report.pairs.map((pair) => [
    pair.characterA, pair.characterB, pair.relationA, pair.matches,
    pair.sideOneMatches, pair.sideTwoMatches, pair.winsA, pair.winsB,
    pair.trackedWinRate, pair.advantageCharacter ?? '', pair.advantageWinRate ?? '',
    pair.averageDurationSeconds,
    pair.metricsA.averageDamage, pair.metricsB.averageDamage,
    pair.metricsA.averageComboLength, pair.metricsB.averageComboLength,
    pair.metricsA.autoCombosPerMatch, pair.metricsB.autoCombosPerMatch,
    pair.metricsA.blocksPerMatch, pair.metricsB.blocksPerMatch,
    pair.metricsA.perfectBlocksPerMatch, pair.metricsB.perfectBlocksPerMatch,
    pair.metricsA.comboEscapesPerMatch, pair.metricsB.comboEscapesPerMatch,
    pair.metricsA.comboBreaksPerMatch, pair.metricsB.comboBreaksPerMatch,
    pair.metricsA.momentumReversalsPerMatch, pair.metricsB.momentumReversalsPerMatch,
    pair.metricsA.specialMovesPerMatch, pair.metricsB.specialMovesPerMatch,
  ]);
  return csv(header, rows);
}

export function characterSummaryCsv(report: BalanceReport) {
  const header = [
    'character', 'matches', 'wins', 'win_rate', 'average_damage',
    'average_combo_length', 'max_combo_length', 'auto_combo_per_match',
    'blocks_per_match', 'perfect_blocks_per_match', 'combo_escape_per_match',
    'combo_break_per_match', 'momentum_reversal_per_match', 'specials_per_match',
  ];
  const rows = report.characters.map((character) => [
    character.character,
    character.matches,
    character.wins,
    character.winRate,
    character.metrics.averageDamage,
    character.metrics.averageComboLength,
    character.metrics.maxComboLength,
    character.metrics.autoCombosPerMatch,
    character.metrics.blocksPerMatch,
    character.metrics.perfectBlocksPerMatch,
    character.metrics.comboEscapesPerMatch,
    character.metrics.comboBreaksPerMatch,
    character.metrics.momentumReversalsPerMatch,
    character.metrics.specialMovesPerMatch,
  ]);
  return csv(header, rows);
}

function csv(header: string[], rows: Array<Array<string | number>>) {
  return `${[header, ...rows].map((row) => row.map(cell).join(',')).join('\n')}\n`;
}

function cell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
