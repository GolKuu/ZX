/**
 * The energy bar behind every super.
 *
 * Energy is earned by fighting, not by losing: the attacker gets the larger
 * share so that offence is what pays for supers, while the fighter taking the
 * hit still gets something back for the trouble.
 */

export const SUPER_METER_MAX = 100;

/** Segments drawn on the HUD bar; one segment is a level-one super. */
export const SUPER_METER_STOCKS = 3;

/** Damage that fills the whole bar, from each side of the hit. */
const DAMAGE_FOR_FULL_BAR_DEALT = 520;
const DAMAGE_FOR_FULL_BAR_TAKEN = 900;

/**
 * What a taunt is worth — under a quarter of a segment.
 *
 * The taunt has no hitbox and 44 frames of recovery, so it needs *some* payoff
 * to be a button rather than a joke; small enough that taunting is never better
 * than fighting.
 */
export const TAUNT_ENERGY_GAIN = 8;

export function superGainForDamageDealt(damage: number): number {
  return gain(damage, DAMAGE_FOR_FULL_BAR_DEALT);
}

export function superGainForDamageTaken(damage: number): number {
  return gain(damage, DAMAGE_FOR_FULL_BAR_TAKEN);
}

export function clampSuperMeter(value: number): number {
  return Math.max(0, Math.min(SUPER_METER_MAX, Math.round(value)));
}

function gain(damage: number, damageForFullBar: number): number {
  if (damage <= 0) return 0;
  return Math.round((damage * SUPER_METER_MAX) / damageForFullBar);
}
