export const TICKS_PER_SECOND = 60;
export const FIXED_STEP_SECONDS = 1 / TICKS_PER_SECOND;

export const balanceConfig = {
  arenaWidth: 960,
  arenaHeight: 540,
  groundY: 450,
  fighterRadius: 38,
  walkSpeed: 250,
  jumpSpeed: 650,
  gravity: 1_650,
  maxHealth: 100,
  lightDamage: 8,
  attackRange: 104,
  attackCooldownTicks: 24,
  hitstunTicks: 12,
  roundSeconds: 60,
} as const;
