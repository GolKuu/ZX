import {
  KNOCKDOWN_DOWN_FRAMES,
  KNOCKDOWN_FRAMES,
  KNOCKDOWN_GETUP_FRAMES,
} from '../../sim/knockdown.js';
import type { KnockdownPhase } from '../../sim/state.js';

const COLUMNS = 4;
const frame = (row: number, column: number): number => row * COLUMNS + column;

/** Atlas drawings a fall can use. Every reference sheet shares this layout. */
const FIGHTING_STANCE = frame(1, 0);
const CROUCH = frame(1, 1);
const STAGGER = frame(1, 3);
const PRONE = frame(2, 3);

/**
 * How far a settled body has rotated away from standing, in radians.
 *
 * The prone drawing is already a low lunge, so a full quarter turn would push
 * its head through the floor. This lays the shoulders down instead.
 */
const FLAT_ROTATION = 1.3;

/** Depth of a settled body below its standing centre, in display heights. */
const FLAT_DROP = 0.36;

const DOWN_FRAMES = KNOCKDOWN_DOWN_FRAMES + KNOCKDOWN_GETUP_FRAMES;

/** Frames the defeat collapse takes to reach the floor. */
const COLLAPSE_FRAMES = 22;

/**
 * Frames the airborne tumble takes to finish tipping over.
 *
 * It must be reached before the shortest possible landing, because the ground
 * beat starts from the tumble's final tilt. A knockdown launch is always at
 * least 170 fixed units upward against 24 per frame of gravity, so the body is
 * airborne for a good 14 frames even at the floor of that range.
 */
const LAUNCH_FRAMES = 12;

/**
 * A fall in the drawing's own space, where +x is always the direction the
 * fighter faces.
 *
 * Nothing here is signed by `facing`: the group above the drawing already
 * carries the mirror, so a constant sign is what lays every fighter down away
 * from its opponent. Multiplying by `facing` as well — as the old inline
 * knockdown did — cancels the mirror out, and a fighter looking right then fell
 * forwards onto its face while the same hit laid its mirror image on its back.
 */
export interface PhotoFallPose {
  /** Radians about Z. Positive tips the head away from the opponent. */
  readonly rotation: number;
  /** Downward offset in display heights. */
  readonly drop: number;
  /** Offset along the fighter's front, in display heights. Never positive. */
  readonly slide: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

/** Only the fields a fall needs, so the pose stays testable without a scene. */
export interface FallingFighter {
  readonly grounded: boolean;
  readonly health: number;
  readonly knockdownFrames: number;
  readonly knockdownPhase: KnockdownPhase;
}

interface Keyframe {
  readonly frame: number;
  readonly value: number;
}

interface FallTracks {
  readonly tilt: readonly Keyframe[];
  readonly drop: readonly Keyframe[];
  readonly slide: readonly Keyframe[];
  readonly scaleX: readonly Keyframe[];
  readonly scaleY: readonly Keyframe[];
}

/**
 * Airborne beat, keyed off frames since the hit landed.
 *
 * The launch arc itself comes from simulation velocity, so these tracks only
 * carry what physics cannot: the body coming off its feet and tumbling. `drop`
 * stays at zero — sinking the drawing while the fighter is still in the air is
 * what used to make a knockdown look like a fighter melting into the floor.
 */
const LAUNCH: FallTracks = {
  tilt: [
    { frame: 0, value: 0 },
    { frame: 3, value: 0.34 },
    { frame: 7, value: 0.68 },
    { frame: LAUNCH_FRAMES, value: 0.84 },
  ],
  drop: [{ frame: 0, value: 0 }],
  slide: [
    { frame: 0, value: 0 },
    { frame: 5, value: -0.05 },
    { frame: LAUNCH_FRAMES, value: -0.08 },
  ],
  scaleX: [
    { frame: 0, value: 1 },
    { frame: 4, value: 1.04 },
    { frame: LAUNCH_FRAMES, value: 1.02 },
  ],
  scaleY: [
    { frame: 0, value: 1 },
    { frame: 4, value: 0.96 },
    { frame: LAUNCH_FRAMES, value: 0.99 },
  ],
};

/**
 * Ground beat, keyed off frames since the body landed.
 *
 * Its first frame continues the tumble's last one, so touching down is not a
 * cut. Two frames of hard squash sell the impact, a small rebound follows, and
 * the body then settles flat. Without the rebound the landing reads as the
 * sprite being switched off rather than as hitting the floor.
 *
 * The squash carries the violence of the impact; `drop` deliberately does not.
 * A body that lurched a third of its own height downward in two frames read as
 * a dropped frame rather than as weight.
 */
const IMPACT: FallTracks = {
  tilt: [
    { frame: 0, value: 0.84 },
    { frame: 3, value: 1.03 },
    { frame: 7, value: 0.95 },
    { frame: 13, value: 1 },
  ],
  drop: [
    { frame: 0, value: 0 },
    { frame: 3, value: 0.62 },
    { frame: 6, value: 0.9 },
    { frame: 9, value: 0.82 },
    { frame: 14, value: 1 },
  ],
  slide: [
    { frame: 0, value: -0.08 },
    { frame: 9, value: -0.14 },
  ],
  scaleX: [
    { frame: 0, value: 1.02 },
    { frame: 2, value: 1.13 },
    { frame: 7, value: 1 },
  ],
  scaleY: [
    { frame: 0, value: 0.99 },
    { frame: 2, value: 0.85 },
    { frame: 7, value: 1 },
  ],
};

/**
 * Defeat collapse, keyed off frames since the fighter lost its last health.
 *
 * A killing blow never sets a knockdown timer, so this is the only fall the
 * simulation does not launch. The body buckles under itself rather than being
 * thrown: a short rise onto the toes, then the knees give out.
 */
const COLLAPSE: FallTracks = {
  tilt: [
    { frame: 0, value: 0 },
    { frame: 4, value: 0.16 },
    { frame: 10, value: 0.62 },
    { frame: 16, value: 1.04 },
    { frame: COLLAPSE_FRAMES, value: 1 },
  ],
  drop: [
    { frame: 0, value: 0 },
    { frame: 5, value: 0.14 },
    { frame: 12, value: 0.68 },
    { frame: 17, value: 1.02 },
    { frame: COLLAPSE_FRAMES, value: 1 },
  ],
  slide: [
    { frame: 0, value: 0 },
    { frame: 10, value: -0.06 },
    { frame: COLLAPSE_FRAMES, value: -0.12 },
  ],
  scaleX: [
    { frame: 0, value: 1 },
    { frame: 12, value: 1.03 },
    { frame: 17, value: 1.1 },
    { frame: COLLAPSE_FRAMES, value: 1.02 },
  ],
  scaleY: [
    { frame: 0, value: 1 },
    { frame: 4, value: 1.03 },
    { frame: 12, value: 0.94 },
    { frame: 17, value: 0.87 },
    { frame: COLLAPSE_FRAMES, value: 0.99 },
  ],
};

/**
 * Get-up beat, keyed off frames since the rise began.
 *
 * The tilt crosses slightly past standing so the fighter arrives on its feet
 * with momentum instead of easing to a halt while still leaning.
 */
const RISE: FallTracks = {
  tilt: [
    { frame: 0, value: 1 },
    { frame: 5, value: 0.82 },
    { frame: 13, value: 0.3 },
    { frame: 19, value: -0.05 },
    { frame: KNOCKDOWN_GETUP_FRAMES, value: 0 },
  ],
  drop: [
    { frame: 0, value: 1 },
    { frame: 5, value: 0.9 },
    { frame: 13, value: 0.34 },
    { frame: KNOCKDOWN_GETUP_FRAMES, value: 0 },
  ],
  slide: [
    { frame: 0, value: -0.14 },
    { frame: 11, value: -0.07 },
    { frame: KNOCKDOWN_GETUP_FRAMES, value: 0 },
  ],
  scaleX: [
    { frame: 0, value: 1 },
    { frame: 6, value: 0.97 },
    { frame: KNOCKDOWN_GETUP_FRAMES, value: 1 },
  ],
  scaleY: [
    { frame: 0, value: 1 },
    { frame: 6, value: 1.05 },
    { frame: KNOCKDOWN_GETUP_FRAMES, value: 1 },
  ],
};

const STANDING: PhotoFallPose = {
  rotation: 0,
  drop: 0,
  slide: 0,
  scaleX: 1,
  scaleY: 1,
};

export function isFalling(fighter: FallingFighter): boolean {
  return fighter.health <= 0 || fighter.knockdownPhase !== 'none';
}

/**
 * Whole-body motion for a knocked down or defeated fighter.
 *
 * `defeatFrames` is the caller's count since the fighter lost its last health;
 * it is ignored while the fighter is alive. `elapsedTime` only drives the
 * breathing of a body already at rest, so the fall itself stays a pure function
 * of simulation frames and replays identically every time.
 */
export function photoFallPose(
  fighter: FallingFighter,
  elapsedTime: number,
  defeatFrames = 0,
): PhotoFallPose {
  if (!isFalling(fighter)) return STANDING;
  const beat = fallBeat(fighter, defeatFrames);
  // A settled body still breathes. The amplitude is a fraction of the squash
  // above it, so it never competes with the landing.
  const breath = beat.settled ? Math.sin(elapsedTime * 2.4) * 0.008 : 0;
  return {
    rotation: FLAT_ROTATION * sample(beat.tracks.tilt, beat.frame),
    // An airborne body's height is already the simulation's; only a fighter
    // that has reached the floor may be pushed below its standing centre.
    drop: fighter.grounded ? FLAT_DROP * sample(beat.tracks.drop, beat.frame) : 0,
    slide: sample(beat.tracks.slide, beat.frame),
    scaleX: sample(beat.tracks.scaleX, beat.frame),
    scaleY: sample(beat.tracks.scaleY, beat.frame) + breath,
  };
}

/**
 * Atlas drawing for a fall, or `null` while the fighter is still standing.
 *
 * The rise walks the sheet backwards out of the fall — prone, crouched, then
 * guarding — so the fighter is visibly back on guard before it can act again.
 */
export function photoFallFrame(
  fighter: FallingFighter,
  defeatFrames = 0,
): number | null {
  if (!isFalling(fighter)) return null;
  if (fighter.health <= 0) {
    return defeatFrames < COLLAPSE_FRAMES * 0.5 ? STAGGER : PRONE;
  }
  if (fighter.knockdownPhase === 'rising') {
    const since = KNOCKDOWN_GETUP_FRAMES - fighter.knockdownFrames;
    if (since < 4) return PRONE;
    return since < KNOCKDOWN_GETUP_FRAMES - 6 ? CROUCH : FIGHTING_STANCE;
  }
  if (fighter.knockdownPhase === 'falling' && !fighter.grounded) return STAGGER;
  return PRONE;
}

interface FallBeat {
  readonly tracks: FallTracks;
  readonly frame: number;
  /** Whether the body has come to rest, and so may breathe. */
  readonly settled: boolean;
}

function fallBeat(fighter: FallingFighter, defeatFrames: number): FallBeat {
  // Defeat outranks the knockdown timer: a fighter that dies mid-knockdown must
  // collapse and stay down rather than get up on a dead health bar.
  if (fighter.health <= 0) {
    return {
      tracks: COLLAPSE,
      frame: defeatFrames,
      settled: defeatFrames >= COLLAPSE_FRAMES,
    };
  }
  if (fighter.knockdownPhase === 'rising') {
    return {
      tracks: RISE,
      frame: KNOCKDOWN_GETUP_FRAMES - fighter.knockdownFrames,
      settled: false,
    };
  }
  if (fighter.knockdownPhase === 'falling' && !fighter.grounded) {
    return {
      tracks: LAUNCH,
      frame: KNOCKDOWN_FRAMES - fighter.knockdownFrames,
      settled: false,
    };
  }
  // The landing frame still reports 'falling'; the simulation only advances to
  // 'down' on the following tick, so clamp that frame to the start of IMPACT.
  const since = fighter.knockdownPhase === 'down'
    ? DOWN_FRAMES - fighter.knockdownFrames
    : 0;
  return { tracks: IMPACT, frame: since, settled: since >= 14 };
}

/** Eased read of an authored track. Values hold before and after their keys. */
function sample(track: readonly Keyframe[], frameNumber: number): number {
  const first = track[0];
  if (first === undefined) return 0;
  if (frameNumber <= first.frame) return first.value;
  for (let index = 1; index < track.length; index += 1) {
    const key = track[index];
    const previous = track[index - 1];
    if (key === undefined || previous === undefined) break;
    if (frameNumber >= key.frame) continue;
    const span = Math.max(1, key.frame - previous.frame);
    const amount = smooth((frameNumber - previous.frame) / span);
    return previous.value + (key.value - previous.value) * amount;
  }
  return track[track.length - 1]?.value ?? 0;
}

function smooth(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}
