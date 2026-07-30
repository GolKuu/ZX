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
 *
 * ## Which way a hinge bends
 *
 * Positive rotates a part's free end towards the opponent. So for an elbow or a
 * knee — hinges that flex one way only — flexion is *negative* and positive is
 * extension back towards straight. Because the drawing starts slightly bent, a
 * small positive value is legitimate; a large one folds the joint backwards.
 * `LIMITS` makes that impossible, and three tables here used to do it.
 */

// Relative, with the `.js` extension the sim modules use, so this file compiles
// under `tsconfig.sim-tests.json` and the joint limits below can be tested without
// standing up a renderer. The path alias does not survive that emit.
import type { FighterSnapshot } from '../../sim/index.js';
import { FIXED_SCALE } from '../../sim/index.js';

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

type JointName = keyof Omit<SpritePose, 'lift' | 'drift'>;

/**
 * How far each joint may travel, in radians, as a delta on the drawn pose.
 *
 * The elbows and knees are the point. They are hinges: they flex one way and stop
 * at straight, and the small positive allowance is only the slack the drawing's own
 * bend leaves. Past it the shin swings out in front of the knee and the limb reads
 * as broken — which is what the walk (`+0.45` on the far shin), the sweep (`+0.95`)
 * and the roundhouse (`+0.85` at full extension) all used to do. Those tables are
 * fixed below; this table is the guarantee that the next one cannot.
 */
const LIMITS: Readonly<Record<JointName, readonly [number, number]>> = {
  torso: [-0.6, 0.65],
  head: [-0.55, 0.5],
  ponytail: [-1.1, 1.1],
  sash: [-0.9, 0.9],
  upperArm: [-1.5, 1.7],
  farUpperArm: [-1.5, 1.7],
  forearm: [-1.6, 0.16],
  farForearm: [-1.6, 0.16],
  thigh: [-1.2, 1.5],
  farThigh: [-1.2, 1.5],
  shin: [-1.6, 0.2],
  farShin: [-1.6, 0.2],
  boot: [-0.55, 0.6],
  farBoot: [-0.55, 0.6],
};

function withinLimits(pose: SpritePose): SpritePose {
  for (const name of Object.keys(LIMITS) as JointName[]) {
    const [low, high] = LIMITS[name];
    pose[name] = Math.min(high, Math.max(low, pose[name]));
  }
  return pose;
}

function blendPose(from: SpritePose, to: SpritePose, amount: number): SpritePose {
  const mixed = pose();
  const clamped = Math.max(0, Math.min(1, amount));
  for (const name of Object.keys(mixed) as (keyof SpritePose)[]) {
    mixed[name] = from[name] + (to[name] - from[name]) * clamped;
  }
  return mixed;
}

/**
 * Neutral fighting stance: weight back, knees bent, breath in the shoulders.
 *
 * The near arm stays close to where it was drawn. It is cut from the drawing, so
 * behind it is the patch of costume that was filled in when it was lifted out —
 * invisible while the arm covers it, a smudge the moment it swings clear. Neutral
 * is the frame that is on screen most of the time, so it is the one frame that has
 * to sit on its own hole; the walk and the damage reactions are free to move.
 */
function stance(breath: number): SpritePose {
  return pose({
    torso: -0.1 + breath * 0.012,
    head: 0.07 - breath * 0.008,
    ponytail: 0.16 + breath * 0.08,
    sash: -0.12 + breath * 0.07,
    // Both hands stay high enough to read as a guard, not hanging turnaround art.
    upperArm: 0.16 + breath * 0.025,
    forearm: -0.48,
    farUpperArm: -0.12 - breath * 0.018,
    farForearm: -0.52,
    // Weight sits between two visibly bent knees.
    thigh: 0.2,
    shin: -0.32,
    boot: 0.1,
    farThigh: -0.22,
    farShin: -0.3,
    farBoot: -0.08,
    lift: -0.055 + breath * 0.014,
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
    // Support leg squats: thigh forward under the weight, shin folded back beneath
    // it. It used to be thigh back with the shin swung forward — a knee opened out
    // the wrong way by 54°, and the reason a sweep looked snapped.
    farThigh: 0.55 * crouch,
    farShin: -1.05 * crouch,
    farBoot: 0.3 * crouch,
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
    // Knee chambers first, then the shin whips out — to straight, and no further.
    // Reaching `out * 1.1` off a −0.26 chamber left the knee 48° hyperextended at
    // the moment of contact, the one frame of a roundhouse anybody looks at.
    thigh: 0.24 + coil * 0.45 + out * 1.2,
    shin: -0.28 - coil * 0.95 + out * 0.4,
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

/**
 * Per-character move tables namespace their ids — `idol.hp`, `glitch.lk`. Keying
 * on the button suffix is what lets one set of poses serve the whole roster;
 * without it every id missed the table and all four attacks silently played the
 * jab.
 */
function attackFor(moveId: string): AttackPose {
  const suffix = moveId.slice(moveId.lastIndexOf('.') + 1);
  return ATTACKS[moveId] ?? ATTACKS[suffix] ?? jab;
}

/**
 * Where on the body a blow landed. Decided by the impact's height, which the sim
 * hands over in `CombatHit`.
 */
export type HurtZone = 'head' | 'body' | 'legs';

/**
 * Struck. Three reactions, because one is a tell that the game is not watching.
 *
 * A single lean-back plays identically whether the chin was clipped or the ankles
 * were swept, and the eye reads that as the hit not connecting with anything. Each
 * of these moves the struck part *first* and lets the rest follow: the head snaps
 * and drags the spine, the gut folds and pulls the arms in, the legs buckle and
 * drop the hips out from under the torso.
 */
function hurt(force: number, zone: HurtZone): SpritePose {
  if (zone === 'head') {
    return pose({
      torso: -0.34 * force,
      head: -0.5 * force,
      ponytail: -0.68 * force,
      sash: 0.2 * force,
      upperArm: 0.36 * force,
      forearm: -0.24 - 0.1 * force,
      farUpperArm: 0.3 * force,
      farForearm: -0.2,
      thigh: 0.16 * force,
      shin: -0.3 * force,
      farThigh: -0.2 * force,
      farShin: -0.16 * force,
      lift: -0.03 * force,
      drift: -0.11 * force,
    });
  }
  if (zone === 'legs') {
    // The struck leg comes off the floor and folds; the hips drop with it and the
    // arms fly up, which is what losing your footing actually looks like.
    return pose({
      torso: 0.3 * force,
      head: -0.14 * force,
      ponytail: 0.32 * force,
      sash: 0.36 * force,
      upperArm: -0.42 * force,
      forearm: -0.3 - 0.24 * force,
      farUpperArm: 0.44 * force,
      farForearm: -0.3,
      thigh: 0.52 * force,
      shin: -0.95 * force,
      boot: 0.24 * force,
      farThigh: -0.22 * force,
      farShin: -0.5 * force,
      lift: -0.3 * force,
      drift: -0.06 * force,
    });
  }
  return pose({
    torso: 0.42 * force,
    head: -0.22 * force,
    ponytail: 0.36 * force,
    sash: 0.26 * force,
    upperArm: 0.5 * force,
    forearm: -0.3 - 0.4 * force,
    farUpperArm: 0.42 * force,
    farForearm: -0.28 - 0.32 * force,
    thigh: 0.24 * force,
    shin: -0.42 * force,
    farThigh: -0.18 * force,
    farShin: -0.32 * force,
    lift: -0.13 * force,
    drift: -0.09 * force,
  });
}

/**
 * Walking: legs counter-swing, the ponytail and sash lag behind.
 *
 * Both knees take a *negative* contribution, each on the half of the cycle where
 * its own leg is trailing — that is the heel lifting behind on push-off. The far
 * knee used to take `+0.45` on its half, swinging the shin forward past straight;
 * a leg bending the wrong way at every stride is the most visible thing a walk can
 * do wrong. Elbows swing gently in opposition, which is what the arms are cut as
 * separate parts for.
 */
function walk(base: SpritePose, phase: number, amount: number): SpritePose {
  const swingPhase = Math.sin(phase) * amount;
  const trailing = Math.max(0, -swingPhase);
  const farTrailing = Math.max(0, swingPhase);
  const stepRise = (1 - Math.cos(phase * 2)) * 0.5 * amount;
  return {
    ...base,
    thigh: base.thigh + swingPhase * 0.44,
    shin: base.shin - trailing * 0.62,
    boot: base.boot + trailing * 0.24,
    farThigh: base.farThigh - swingPhase * 0.44,
    farShin: base.farShin - farTrailing * 0.62,
    farBoot: base.farBoot + farTrailing * 0.24,
    upperArm: base.upperArm - swingPhase * 0.2,
    forearm: base.forearm - Math.max(0, swingPhase) * 0.16,
    farUpperArm: base.farUpperArm + swingPhase * 0.2,
    farForearm: base.farForearm - Math.max(0, -swingPhase) * 0.16,
    ponytail: base.ponytail - swingPhase * 0.36,
    sash: base.sash - swingPhase * 0.3,
    torso: base.torso - swingPhase * 0.055,
    head: base.head + swingPhase * 0.025,
    lift: base.lift + stepRise * 0.045,
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
 * `progress` is the attack's 0…1 position and `hurtZone` where the last blow
 * landed, both supplied by the caller so this module stays free of the frame-data
 * tables and of the runtime's hit channel.
 *
 * Every path returns through `withinLimits`, so no table — including one added
 * later — can put a knee or an elbow through itself.
 */
export function spritePoseFor(
  fighter: FighterSnapshot,
  time: number,
  progress: number,
  hurtZone: HurtZone = 'body',
): SpritePose {
  if (!fighter.grounded) {
    return withinLimits(airborne(fighter.velocity.y > 0));
  }

  if (fighter.action !== null) {
    const attack = attackFor(fighter.action.moveId);
    const [windup, strike, settle] = beats(progress);
    const fightingStance = stance(0);
    if (strike === 0) {
      // The timeline already supplies four evenly spaced windup amounts. Build
      // the authored endpoint once and blend to it once; applying `windup`
      // inside the attack table as well made the first drawing barely move.
      const woundUpPose = attack(1, 0, 0);
      return withinLimits(blendPose(fightingStance, woundUpPose, windup));
    }
    if (settle > 0) {
      // Likewise, recover from one stable contact pose. Previously `settle`
      // shortened the limb inside `attack()` and then blended it again, so the
      // first return frame snapped back and the last two were nearly identical.
      const contactPose = attack(1, 1, 0);
      return withinLimits(blendPose(contactPose, fightingStance, settle));
    }
    return withinLimits(attack(windup, strike, 0));
  }

  if (fighter.hitstun > 0) {
    return withinLimits(hurt(Math.min(1, fighter.hitstun / 14), hurtZone));
  }

  const base = stance(Math.sin(time * 2.2));
  const speed = Math.abs(fighter.velocity.x) / FIXED_SCALE;
  // Authored ground speed is roughly 0.053–0.065 engine units per sim frame.
  // Normalising by 3.5 made the old walk play at under two percent amplitude.
  const amount = Math.min(1, speed / 0.058);
  if (amount < 0.02) return withinLimits(base);
  const travelDirection = fighter.velocity.x * fighter.facing >= 0 ? 1 : -1;
  return withinLimits(walk(base, time * 8.2 * travelDirection, amount));
}
