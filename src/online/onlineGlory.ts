import { gloryXpForWin } from '@/src/progression/glory';
import { useProgressionStore } from '@/src/store/progressionStore';
import type { MatchResult } from '@/src/store/hudStore';
import { getOnlineSnapshot } from './onlineSession';

/**
 * Pays Glory XP for a finished online fight. Only quick matchmaking counts:
 * a private room is a friendly, exactly like Brawl Stars friendly battles.
 */
export function reportOnlineMatchResult(result: MatchResult): void {
  const online = getOnlineSnapshot();
  if (online.origin !== 'quick' || online.matchId === null || online.role === null) return;
  const localTag = online.role === 'guest' ? 'P2' : 'P1';
  if (!result.winner.startsWith(localTag)) return;
  const [hostRounds, guestRounds] = roundScore(result.rounds);
  const loserRounds = online.role === 'guest' ? hostRounds : guestRounds;
  useProgressionStore.getState().awardGlory({
    xp: gloryXpForWin({ loserRounds, maxCombo: result.maxCombo }),
    matchId: online.matchId,
  });
}

/** `"2-1"` as written by the host: player one first, player two second. */
function roundScore(rounds: string): readonly [number, number] {
  const parts = rounds.split('-').map((part) => Number.parseInt(part, 10));
  const first = parts[0] ?? 0;
  const second = parts[1] ?? 0;
  return [Number.isFinite(first) ? first : 0, Number.isFinite(second) ? second : 0];
}
