const MINIMUM_DAMAGE_PERCENT = 55;

/** First two hits stay full strength; longer routes trade damage for control. */
export function comboDamagePercent(previousHits: number): number {
  if (previousHits < 2) return 100;
  return Math.max(MINIMUM_DAMAGE_PERCENT, 90 - (previousHits - 2) * 7);
}
