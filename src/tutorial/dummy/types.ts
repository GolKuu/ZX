/**
 * Deterministic training-dummy scripts.
 *
 * The dummy is an ordinary fighter in the real engine — it is driven by handing
 * the engine a `FighterInput` each frame, exactly as the AI agent does. It is
 * never given special combat rules, so what a lesson teaches about spacing,
 * blocking and punishing stays true in a real match.
 *
 * Scripts are fully deterministic. Where the brief calls for variety (delayed
 * throws, mixed jump-ins) the variation comes from a seeded pool, so a failed
 * attempt replays identically and "it only worked by luck" cannot happen.
 */

import type { RecordedInputFrame } from '../../input/sampler.js';

export type DummyAction =
  | { readonly kind: 'idle'; readonly frames: number }
  | { readonly kind: 'walk'; readonly direction: 'forward' | 'back';
      readonly frames: number }
  | { readonly kind: 'crouch'; readonly frames: number }
  | { readonly kind: 'jump'; readonly direction: 'neutral' | 'forward' | 'back';
      readonly frames: number }
  /** Start a real move by id. The engine decides whether it may begin. */
  | { readonly kind: 'attack'; readonly moveId: string;
      readonly frames: number }
  | { readonly kind: 'blockHigh'; readonly frames: number }
  | { readonly kind: 'blockLow'; readonly frames: number }
  /** Idle until it has been hit once, then guard everything after. */
  | { readonly kind: 'guardAfterFirstHit'; readonly frames: number }
  /** Act on the first actionable frame after leaving stun. */
  | { readonly kind: 'reversal'; readonly moveId: string;
      readonly frames: number }
  /** Replay physical input captured by the Training Mode recorder. */
  | { readonly kind: 'recorded';
      readonly frames: readonly RecordedInputFrame[] };

export interface DummyScript {
  /** Played in order. */
  readonly actions: readonly DummyAction[];
  /** Restart from the top when the list runs out. */
  readonly loop?: boolean;
  /**
   * Seeded alternatives. When present the controller picks one branch per
   * cycle using `seed`, giving repeatable variety rather than real randomness.
   */
  readonly pool?: readonly (readonly DummyAction[])[];
  readonly seed?: number;
}

/** A dummy that stands still forever — the default for movement lessons. */
export const IDLE_SCRIPT: DummyScript = {
  actions: [{ kind: 'idle', frames: 60 }],
  loop: true,
};

export function scriptOf(
  actions: readonly DummyAction[],
  options: Omit<DummyScript, 'actions'> = {},
): DummyScript {
  return { actions, ...options };
}
