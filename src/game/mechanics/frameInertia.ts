/**
 * Frame Inertia — Velocity King's passive.
 *
 * "Decreases move recovery by 15% per stack." The brief specifies the effect
 * but not the economy, so the economy is defined here and is the part open to
 * balancing:
 *
 *   gain    +1 stack when a move connects (hit or block), and on a completed
 *           Projection Sorcery — the dash is how the character *starts* a
 *           pressure sequence, so it has to pay in
 *   lose    all stacks on being hit; the passive rewards holding the turn, and
 *           losing the turn should cost the whole thing
 *   decay   1 stack per 120 idle frames, so it cannot be banked between rounds
 *           of neutral
 *
 * Everything is integer arithmetic. This feeds `recoveryPercent` on the
 * simulation's fighter state, and a float there would desync two clients
 * running identical inputs.
 */

export const MAX_STACKS = 3;
export const REDUCTION_PER_STACK_PERCENT = 15;
/** Frames without connecting before one stack falls off. */
export const DECAY_FRAMES = 120;

export interface FrameInertiaState {
  readonly stacks: number;
  /** Frames since the last stack-granting event. */
  readonly idleFrames: number;
}

export const INITIAL_FRAME_INERTIA: FrameInertiaState = {
  stacks: 0,
  idleFrames: 0,
};

/**
 * Recovery scale for a stack count, as an integer percentage.
 * 0 → 100, 1 → 85, 2 → 70, 3 → 55.
 */
export function recoveryPercentFor(stacks: number): number {
  const clamped = clampStacks(stacks);
  return 100 - REDUCTION_PER_STACK_PERCENT * clamped;
}

/** A move connected — hit or blocked, both keep the turn. */
export function onConnect(state: FrameInertiaState): FrameInertiaState {
  return { stacks: clampStacks(state.stacks + 1), idleFrames: 0 };
}

/** The character was hit. The turn is lost, so the whole stack is lost. */
export function onPunished(): FrameInertiaState {
  return INITIAL_FRAME_INERTIA;
}

/** One simulation frame with nothing connecting. */
export function advance(state: FrameInertiaState): FrameInertiaState {
  if (state.stacks === 0) {
    return state.idleFrames === 0 ? state : INITIAL_FRAME_INERTIA;
  }
  const idleFrames = state.idleFrames + 1;
  if (idleFrames < DECAY_FRAMES) {
    return { stacks: state.stacks, idleFrames };
  }
  return { stacks: state.stacks - 1, idleFrames: 0 };
}

function clampStacks(stacks: number): number {
  if (stacks < 0) return 0;
  if (stacks > MAX_STACKS) return MAX_STACKS;
  return Math.floor(stacks);
}
