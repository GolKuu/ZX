/**
 * Animation for a 2D cut-out fighter.
 *
 * One angle per joint, in radians, about Z — that is the only axis a flat
 * cut-out can rotate about without revealing that it is a plane. Positive is
 * counter-clockwise on screen for a fighter facing right; the component mirrors
 * the whole rig for the other direction, so every table below is authored
 * facing right and nothing here needs to know about facing.
 *
 * Poses are driven by the simulation snapshot, never by a clip's own clock, for
 * the same reason the geometry rig is: the sim owns the timeline.
 *
 * Attack silhouettes come straight off the character sheets (VIS-CCU-800 §1.5) —
 * LP a straight horizontal jab, HP a wide committed swing, LK a low sweep with
 * the body dropped, HK a high roundhouse with the torso counter-leaning.
 *
 * ## Angles are additive on top of the drawing
 *
 * The sliced parts already carry a pose: the arm hangs, the elbow is already
 * slightly bent, the knees are already soft. Every number here is a *delta* from
 * that, and deltas compound down a chain — a −0.55 shoulder plus a −0.95 elbow
 * put the forearm at −85°, sticking straight out sideways. Limb angles are
 * therefore small, and a value past about 1 radian on a single joint is almost
 * always a mistake.
 */

import type { FighterSnapshot } from '@/src/sim';
import { FIXED_SCALE } from '@/src/sim';

export interface SpritePose {
  torso: number;
  head: number;
  ponytail: number;
  sash: number;
  upperArm: number;
  forearm: number;
  farUpperArm: number;
  farForearm: number;
  thigh: number;
  shin: number;
  boot: number;
  farThigh: number;
  farShin: number;
  farBoot: number;
  /** Vertical offset of the whole rig, in engine units. */
  lift: number;
  /** Horizontal offset, for lunges that should not move the pushbox. */
  drift: number;
}

function pose(overrides: Partial<SpritePose> = {}): SpritePose {
  return {
    torso: 0,
    head: 0,
    ponytail: 0,
    sash: 0,
    upperArm: 0,
    forearm: 0,
    farUpperArm: 0,
    farForearm: 0,
    thigh: 0,
    shin: 0,
    boot: 0,
    farThigh: 0,
    farShin: 0,
    farBoot: 0,
    lift: 0,
    drift: 0,
    ...overrides,
  };
}

/** Neutral fighting stance: weight back, knees bent, guard hand up. */
function stance(breath: number): SpritePose {
  return pose({
    torso: -0.05,
    head: 0.04,
    ponytail: 0.12 + breath * 0.06,
    sash: -0.08 + breath * 0.05,
    upperArm: -0.16 + breath * 0.02,
    forearm: -0.3,
    farUpperArm: -0.08,
    farForearm: -0.22,
    thigh: 0.14,
    shin: -0.2,
    boot: 0.07,
    farThigh: -0.16,
    farShin: 0.18,
    farBoot: -0.04,
    lift: -0.03 + breath * 0.012,
  });
}

const WINDUP_END = 0.34;
const ACTIVE_END = 0.58;

/** Windup, strike, settle — each normalised to 0…1. */
function beats(progress: number): [number, number, number] {
  const windup = Math.min(1, progress / WINDUP_END);
  const strike = progress < WINDUP_END
    ? 0
    : Math.min(1, (progress - WINDUP_END) / (ACTIVE_END - WINDUP_END));
  const settle = progress < ACTIVE_END
    ? 0
    : Math.min(1, (progress - ACTIVE_END) / (1 - ACTIVE_END));
  return [windup, strike, settle];
}

/** The strike, decayed by the recovery so the limb comes back rather than snapping. */
function reach(strike: number, settle: number): number {
  const eased = settle * settle * (3 - 2 * settle);
  return strike * (1 - eased);
}

type AttackPose = (windup: number, strike: number, settle: number) => SpritePose;

/** LP — straight jab. Lead arm horizontal and fully out, front knee deep. */
const jab: AttackPose = (windup, strike, settle) => {
  const coil = windup * (1 - strike);
  const out = reach(strike, settle);
  return pose({
    torso: -0.08 - out * 0.1,
    head: 0.05,
    ponytail: 0.14 + out * 0.3,
    sash: -0.1 - out * 0.14,
    upperArm: -0.42 - coil * 0.12 + out * 0.62,
    forearm: -0.34 + coil * 0.2 + out * 0.42,
    farUpperArm: -0.1 - out * 0.12,
    farForearm: -0.34,
    thigh: 0.2 + out * 0.12,
    shin: -0.28,
    boot: 0.09,
    farThigh: -0.22 - out * 0.12,
    farShin: 0.24,
    lift: -0.05,
    drift: out * 0.1,
  });
};

/** HP — wide committed swing, whole body turning over. */
const swing: AttackPose = (windup, strike, settle) => {
  const coil = windup * (1 - strike);
  const out = reach(strike, settle);
  return pose({
    torso: -0.06 + coil * 0.28 - out * 0.42,
    head: 0.06 - out * 0.12,
    ponytail: 0.16 - coil * 0.35 + out * 0.6,
    sash: -0.1 + coil * 0.2 - out * 0.3,
    upperArm: -0.12 - coil * 0.5 + out * 1.15,
    forearm: -0.18 - coil * 0.3 + out * 0.5,
    farUpperArm: -0.1 + out * 0.18,
    farForearm: -0.32,
    thigh: 0.22 + out * 0.16,
    shin: -0.32,
    boot: 0.1,
    farThigh: -0.26 - out * 0.16,
    farShin: 0.28,
    lift: -0.07 - out * 0.04,
    drift: out * 0.16,
  });
};

/** LK — low sweep. The height drop is what makes it read as a sweep. */
const sweep: AttackPose = (windup, strike, settle) => {
  const coil = windup * (1 - strike);
  const out = reach(strike, settle);
  const crouch = Math.max(coil * 0.7, out * 0.9);
  return pose({
    torso: 0.34 * crouch,
    head: -0.24 * crouch,
    ponytail: 0.2 + crouch * 0.5,
    sash: 0.3 * crouch,
    // Support hand reaches for the floor.
    upperArm: 0.5 * crouch,
    forearm: -0.2 * crouch,
    farUpperArm: -0.18 - crouch * 0.14,
    farForearm: -0.3,
    // Sweeping leg runs out along the ground, nearly straight.
    thigh: 0.34 + out * 0.72,
    shin: -0.55 + out * 0.5,
    boot: 0.12,
    farThigh: -0.7 * crouch,
    farShin: 0.95 * crouch,
    lift: -0.46 * crouch,
    drift: out * 0.08,
  });
};

/** HK — high roundhouse. Foot at head height, torso counter-leaning away. */
const roundhouse: AttackPose = (windup, strike, settle) => {
  const coil = windup * (1 - strike);
  const out = reach(strike, settle);
  return pose({
    torso: 0.1 * coil - 0.42 * out,
    head: -0.1 * out,
    ponytail: 0.18 + out * 0.7,
    sash: -0.12 - out * 0.5,
    farUpperArm: -0.14 - out * 0.3,
    farForearm: -0.32,
    upperArm: -0.1 + out * 0.3,
    forearm: -0.34,
    // Knee chambers first, then the shin whips out.
    thigh: 0.24 + coil * 0.45 + out * 1.2,
    shin: -0.85 * (coil + 0.3) + out * 1.1,
    boot: 0.14,
    farThigh: -0.18 + out * 0.1,
    farShin: 0.2 - out * 0.1,
    lift: -0.05 - out * 0.03,
  });
};

/**
 * Move id → pose. Unmapped ids fall through to the jab so a new move is always
 * visible rather than silently frozen in idle.
 */
const ATTACKS: Readonly<Record<string, AttackPose>> = {
  '5L': jab,
  '5M': roundhouse,
  '5H': swing,
  '2L': sweep,
  '2M': sweep,
  lp: jab,
  hp: swing,
  lk: sweep,
  hk: roundhouse,
};

/** Struck: head snaps back, arms trail, weight drops. */
function hurt(force: number): SpritePose {
  return pose({
    torso: -0.3 * force,
    head: -0.34 * force,
    ponytail: -0.5 * force,
    sash: 0.24 * force,
    upperArm: 0.28 * force,
    forearm: -0.16,
    farUpperArm: 0.24 * force,
    farForearm: -0.14,
    thigh: 0.1 * force,
    shin: -0.18,
    farThigh: -0.13 * force,
    farShin: 0.22,
    lift: -0.05 * force,
    drift: -0.08 * force,
  });
}

/** Walking: legs counter-swing, the ponytail and sash lag behind. */
function walk(base: SpritePose, phase: number, amount: number): SpritePose {
  const swingPhase = Math.sin(phase) * amount;
  const lift = Math.cos(phase * 2) * amount;
  return {
    ...base,
    thigh: base.thigh + swingPhase * 0.36,
    shin: base.shin - Math.max(0, -swingPhase) * 0.45,
    farThigh: base.farThigh - swingPhase * 0.36,
    farShin: base.farShin + Math.max(0, swingPhase) * 0.45,
    upperArm: base.upperArm - swingPhase * 0.18,
    farUpperArm: base.farUpperArm + swingPhase * 0.18,
    ponytail: base.ponytail - swingPhase * 0.3,
    sash: base.sash - swingPhase * 0.22,
    torso: base.torso + Math.abs(swingPhase) * 0.05,
    lift: base.lift + lift * 0.035,
  };
}

/** Airborne: knees up on the rise, legs reaching down on the fall. */
function airborne(rising: boolean): SpritePose {
  const tuck = rising ? 1 : 0.4;
  return pose({
    torso: 0.14 * tuck,
    head: rising ? -0.12 : 0.1,
    ponytail: rising ? -0.4 : 0.45,
    sash: rising ? -0.3 : 0.35,
    upperArm: -0.3,
    forearm: -0.4,
    farUpperArm: -0.2,
    farForearm: -0.3,
    thigh: 0.72 * tuck,
    shin: -0.95 * tuck,
    farThigh: 0.46 * tuck,
    farShin: -0.7 * tuck,
  });
}

/**
 * Resolve one fighter's pose for one rendered frame.
 *
 * `progress` is the attack's 0…1 position, supplied by the caller so this module
 * stays free of the frame-data tables.
 */
export function spritePoseFor(
  fighter: FighterSnapshot,
  time: number,
  progress: number,
): SpritePose {
  if (!fighter.grounded) return airborne(fighter.velocity.y > 0);

  if (fighter.action !== null) {
    const attack = ATTACKS[fighter.action.moveId] ?? jab;
    const [windup, strike, settle] = beats(progress);
    return attack(windup, strike, settle);
  }

  if (fighter.hitstun > 0) return hurt(Math.min(1, fighter.hitstun / 14));

  const base = stance(Math.sin(time * 2.2));
  const speed = Math.abs(fighter.velocity.x) / FIXED_SCALE;
  const amount = Math.min(1, speed / 3.5);
  if (amount < 0.02) return base;
  return walk(base, time * 7.4, amount);
}
