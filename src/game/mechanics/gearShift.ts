/**
 * Gear Shift — Elastic Brawler's stance system.
 *
 * `[Down, Down + P+K]` cycles base → Gear 2 → Gear 4 → base.
 *
 *   Gear 2  speed boost. Walk and dash scale up; damage taken is unchanged.
 *   Gear 4  hyper-armor. A fixed number of hits pass through without hitstun,
 *           at the cost of taking more damage.
 *
 * Both gears are timed rather than permanent, which is what makes the shift a
 * decision instead of a strictly-better opener. Armor is a hit *count*, not a
 * damage threshold — a count is readable by the opponent, who can spend two
 * cheap pokes to strip it and then punish.
 *
 * Integer arithmetic throughout: this feeds the simulation.
 */

export type Gear = 'base' | 'gear2' | 'gear4';

/** Frames a gear lasts before dropping back to base. */
export const GEAR_TWO_FRAMES = 600;
export const GEAR_FOUR_FRAMES = 420;

/** Movement scale as an integer percentage; 100 is unmodified. */
export const GEAR_TWO_SPEED_PERCENT = 128;
/** Hits Gear 4 absorbs before the armor is gone. */
export const GEAR_FOUR_ARMOR_HITS = 2;
/** Damage taken while armored, as an integer percentage. */
export const GEAR_FOUR_DAMAGE_TAKEN_PERCENT = 120;

export interface GearState {
  readonly gear: Gear;
  /** Frames left in the current gear; 0 in base. */
  readonly remaining: number;
  /** Armor hits left; 0 outside Gear 4. */
  readonly armor: number;
}

export const INITIAL_GEAR: GearState = {
  gear: 'base',
  remaining: 0,
  armor: 0,
};

const NEXT: Readonly<Record<Gear, Gear>> = {
  base: 'gear2',
  gear2: 'gear4',
  gear4: 'base',
};

/** Applied when `eb.gear` completes. */
export function shift(state: GearState): GearState {
  return enter(NEXT[state.gear]);
}

export function enter(gear: Gear): GearState {
  if (gear === 'gear2') {
    return { gear, remaining: GEAR_TWO_FRAMES, armor: 0 };
  }
  if (gear === 'gear4') {
    return { gear, remaining: GEAR_FOUR_FRAMES, armor: GEAR_FOUR_ARMOR_HITS };
  }
  return INITIAL_GEAR;
}

/** One simulation frame. */
export function advance(state: GearState): GearState {
  if (state.gear === 'base') return state;
  const remaining = state.remaining - 1;
  if (remaining <= 0) return INITIAL_GEAR;
  return { gear: state.gear, remaining, armor: state.armor };
}

export interface ArmorResult {
  readonly state: GearState;
  /** True when the hit was absorbed and hitstun should not be applied. */
  readonly absorbed: boolean;
}

/**
 * Take a hit. Armor absorbs it and is consumed; damage still applies, because
 * armor that also negated damage would make Gear 4 strictly dominant.
 */
export function takeHit(state: GearState): ArmorResult {
  if (state.gear !== 'gear4' || state.armor <= 0) {
    return { state, absorbed: false };
  }
  return {
    state: { gear: state.gear, remaining: state.remaining, armor: state.armor - 1 },
    absorbed: true,
  };
}

export function speedPercentFor(state: GearState): number {
  return state.gear === 'gear2' ? GEAR_TWO_SPEED_PERCENT : 100;
}

export function damageTakenPercentFor(state: GearState): number {
  return state.gear === 'gear4' ? GEAR_FOUR_DAMAGE_TAKEN_PERCENT : 100;
}
