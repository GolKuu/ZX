/**
 * Command throw meter drain — Velocity King.
 *
 * `[Half-Circle Back + LP+LK]` drains the opponent's energy meter on connect.
 *
 * The drain is what makes the throw worth its 5-frame startup and 30-frame
 * recovery: the damage alone does not justify the risk, but denying a defensive
 * resource does. It is capped as a flat amount rather than a percentage so it
 * is equally meaningful at every meter level — a percentage drain would be
 * worthless against an empty meter and crushing against a full one.
 *
 * Meter is stored as an integer 0..100, matching the HUD.
 */

export const METER_MAXIMUM = 100;
export const COMMAND_THROW_DRAIN = 25;

/** Meter after the throw connects. Never negative. */
export function drainMeter(
  meter: number,
  amount: number = COMMAND_THROW_DRAIN,
): number {
  const current = clampMeter(meter);
  return Math.max(0, current - Math.max(0, Math.floor(amount)));
}

/** How much was actually removed — for the HUD drain flash. */
export function drainedAmount(
  meter: number,
  amount: number = COMMAND_THROW_DRAIN,
): number {
  return clampMeter(meter) - drainMeter(meter, amount);
}

function clampMeter(meter: number): number {
  if (meter < 0) return 0;
  if (meter > METER_MAXIMUM) return METER_MAXIMUM;
  return Math.floor(meter);
}
