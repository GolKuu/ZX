/**
 * When an ultimate is allowed.
 *
 * An ultimate is a comeback tool, so it does not take energy — it unlocks when
 * the fighter's own health falls to the threshold, and once per round only.
 */

/** Health ratio at or below which the ultimate unlocks. */
export const ULTIMATE_HEALTH_RATIO = 0.3;

export function ultimateReadyFromHealth(
  health: number,
  maxHealth: number,
): boolean {
  if (maxHealth <= 0) return false;
  return Math.max(0, health) / maxHealth <= ULTIMATE_HEALTH_RATIO;
}

/**
 * How close the fighter is to the unlock, 0–100, for the HUD to show the
 * ultimate warming up as health drops.
 */
export function ultimateProgressFromHealth(
  health: number,
  maxHealth: number,
): number {
  if (maxHealth <= 0) return 0;
  const safeHealth = Math.max(0, Math.min(maxHealth, health));
  const lostRatio = 1 - safeHealth / maxHealth;
  return Math.min(100, Math.round((lostRatio / (1 - ULTIMATE_HEALTH_RATIO)) * 100));
}
