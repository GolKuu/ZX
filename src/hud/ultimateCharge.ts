const READY_HEALTH_RATIO = 0.25;
const CHARGEABLE_HEALTH_RATIO = 1 - READY_HEALTH_RATIO;

export function ultimateChargeFromHealth(
  health: number,
  maxHealth: number,
): number {
  if (maxHealth <= 0) return 0;
  const safeHealth = Math.max(0, Math.min(maxHealth, health));
  const lostHealthRatio = 1 - safeHealth / maxHealth;
  return Math.min(100, Math.round(
    (lostHealthRatio / CHARGEABLE_HEALTH_RATIO) * 100,
  ));
}

export function isXrayReady(health: number, maxHealth: number): boolean {
  return ultimateChargeFromHealth(health, maxHealth) >= 100;
}
