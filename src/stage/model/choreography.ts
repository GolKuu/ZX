/**
 * Choreography — multi-beat attack strings.
 *
 * The existing pose functions describe one motion as three continuous phases
 * (windup → strike → settle). That is right for a jab. It is wrong for a
 * sequence, where the character hits a *series* of held key poses and the
 * spacing between them is the performance.
 *
 * ## Why this is stepped rather than interpolated
 *
 * A sequence here is a list of beats, and each beat is **held for its whole
 * duration with no interpolation to the next**. That is not a shortcut — it is
 * the technique. Reference-quality fight animation is drawn on 2s and 3s, and
 * the held pose is what gives a strike its weight; smooth interpolation between
 * two extremes reads as floaty no matter how good the extremes are
 * (`VIS-CCU-800` §8.2, `CHR-CCU-810` §8.2).
 *
 * A `smear` beat is the one exception in spirit: a single frame of a physically
 * impossible over-extension between two keys. Nobody sees it consciously;
 * everybody feels it missing.
 *
 * ## Timing is bound to the simulation
 *
 * Beat durations are in simulation frames and a sequence's total length is
 * validated against the move's frame data. A sequence that ran long would
 * desynchronise the performance from the hitbox, which is the one thing
 * animation is not allowed to do (rule R4).
 */

/**
 * Generic over the rig types on purpose. A scheduler does not need to know what
 * a joint is, and keeping it ignorant means it carries no three.js dependency
 * and can be unit-tested as pure timing logic.
 */
export interface ChoreographyBeat<TJoints, TRest> {
  /** Frames this key pose is held. Two and three are the useful values. */
  readonly hold: number;
  /** The key pose itself. Receives 0..1 across the beat for micro-drift only. */
  readonly pose: (joints: TJoints, rest: TRest, within: number) => void;
  /**
   * Marks a one-frame over-extension. Held for exactly one frame regardless of
   * `hold`, because a smear that lingers stops being a smear and becomes a
   * broken pose.
   */
  readonly smear?: boolean;
  /** Optional label, for debugging an off-looking string. */
  readonly name?: string;
}

export interface Choreography<TJoints = unknown, TRest = unknown> {
  readonly moveId: string;
  readonly beats: readonly ChoreographyBeat<TJoints, TRest>[];
}

/** Frames a sequence occupies. Smear beats always count as one. */
export function sequenceLength(sequence: Choreography<never, never>): number {
  let total = 0;
  for (const beat of sequence.beats) {
    total += beat.smear === true ? 1 : Math.max(1, beat.hold);
  }
  return total;
}

export interface ResolvedBeat<TJoints, TRest> {
  readonly beat: ChoreographyBeat<TJoints, TRest>;
  readonly index: number;
  /** Progress inside this beat, 0..1. */
  readonly within: number;
}

/**
 * Which beat is showing on `frame`.
 *
 * Past the end the final beat is held rather than falling back to idle — the
 * recovery of a move should settle from where the string ended, not snap.
 */
export function beatAt<TJoints, TRest>(
  sequence: Choreography<TJoints, TRest>,
  frame: number,
): ResolvedBeat<TJoints, TRest> | null {
  const beats = sequence.beats;
  if (beats.length === 0) return null;

  const target = Math.max(0, Math.floor(frame));
  let elapsed = 0;

  for (let index = 0; index < beats.length; index += 1) {
    const beat = beats[index];
    if (beat === undefined) continue;
    const hold = beat.smear === true ? 1 : Math.max(1, beat.hold);
    if (target < elapsed + hold) {
      return { beat, index, within: (target - elapsed) / hold };
    }
    elapsed += hold;
  }

  const last = beats[beats.length - 1];
  if (last === undefined) return null;
  return { beat: last, index: beats.length - 1, within: 1 };
}

/** Apply the beat showing on `frame`. Returns false if there is nothing to show. */
export function applyChoreography<TJoints, TRest>(
  joints: TJoints,
  rest: TRest,
  sequence: Choreography<TJoints, TRest>,
  frame: number,
): boolean {
  const resolved = beatAt(sequence, frame);
  if (resolved === null) return false;
  resolved.beat.pose(joints, rest, resolved.within);
  return true;
}

/**
 * Adapts a sequence to the `RosterAttackPose` signature the existing pose
 * tables use, so a choreographed move drops into the same lookup as a plain
 * one and nothing downstream needs to know the difference.
 *
 * The three phase values are recombined into a single 0..1 progress, then
 * scaled across the sequence. Phase boundaries are deliberately ignored: a
 * string has its own internal rhythm, and forcing it onto windup/strike/settle
 * is what flattens choreography back into a single swing.
 */
export function asAttackPose<TJoints, TRest>(
  sequence: Choreography<TJoints, TRest>,
  /**
   * The move's real length from the frame data. Required: without it the
   * sequence gets stretched across whatever the move happens to last, a 1-frame
   * smear starts showing for three or four frames, and the stepping this whole
   * module exists to produce is gone.
   */
  totalFrames: number,
): (
  joints: TJoints,
  rest: TRest,
  windup: number,
  strike: number,
  settle: number,
) => void {
  const span = Math.max(1, totalFrames) - 1;
  return (joints, rest, windup, strike, settle) => {
    const progress = combineProgress(windup, strike, settle);
    applyChoreography(joints, rest, sequence, progress * span);
  };
}

/**
 * Whether a sequence's beats add up to the move it is attached to.
 *
 * They must. Beat holds are simulation frames, and if the sum is short the
 * string finishes early and the last pose sits frozen through the rest of the
 * move; if it is long the tail never plays. Either way the performance stops
 * matching the hitbox, which is the one thing animation may not do (rule R4).
 */
export function sequenceFitsMove(
  sequence: Choreography<never, never>,
  totalFrames: number,
): boolean {
  return sequenceLength(sequence) === totalFrames;
}

/** Rebuilds 0..1 from the three phase values `combatAnimationProgress` splits. */
function combineProgress(
  windup: number,
  strike: number,
  settle: number,
): number {
  const WINDUP_END = 0.34;
  const ACTIVE_END = 0.58;
  if (settle > 0) {
    return ACTIVE_END + settle * (1 - ACTIVE_END);
  }
  if (strike > 0) {
    return WINDUP_END + strike * (ACTIVE_END - WINDUP_END);
  }
  return windup * WINDUP_END;
}
