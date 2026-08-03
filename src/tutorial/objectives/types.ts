/**
 * What a step asks the player to do, and what the runner watches to decide.
 *
 * Every objective is evaluated against engine *events* and *snapshots* — never
 * against an animation name. The brief rejects animation-name matching outright,
 * and it would be wrong anyway: two moves can share a clip, and a clip can play
 * while the move that owns it has already been interrupted.
 */

import type { CombatEvent, WorldSnapshot } from '../../sim/index.js';
import type { InputBuffer } from '../../input/buffer.js';
import type { Direction } from '../../input/bindings.js';
import type { MotionId } from '../../input/motion.js';
import type { PlayerButton } from '../buttons.js';
import type { SemanticDirection } from '../semantics.js';
import type { TextKey } from '../i18n/keys.js';

/** One simulation frame, as an objective sees it. */
export interface ObjectiveFrame {
  readonly world: WorldSnapshot;
  readonly events: readonly CombatEvent[];
  /** The player's buffer. Directions in it are already facing-relative. */
  readonly buffer: InputBuffer;
  /** Raw screen-space direction this frame, before facing is applied. */
  readonly screenDirection: Direction;
  readonly playerId: string;
  readonly dummyId: string;
  readonly playerFacing: -1 | 1;
  /** Frames since the current step began. */
  readonly stepFrame: number;
}

export type ObjectiveStatus = 'pending' | 'satisfied' | 'failed';

export interface ObjectiveProgress {
  readonly status: ObjectiveStatus;
  /** 0..target, for the progress readout. */
  readonly count: number;
  readonly target: number;
  /** Key explaining the most recent failure, for the feedback engine. */
  readonly failureKey?: TextKey;
  /** Free-form numbers the feedback engine interpolates, e.g. frames early. */
  readonly failureValues?: Readonly<Record<string, number | string>>;
}

/** A rectangle on the stage floor the player must stand in. */
export interface StageZone {
  readonly centerX: number;
  readonly halfWidth: number;
  /** Omitted means "any height" — most zones only care about the x axis. */
  readonly requireGrounded?: boolean;
}

export type ObjectiveSpec =
  /** Hold or press a semantic direction. Side-switch safe by construction. */
  | { readonly kind: 'holdDirection'; readonly direction: SemanticDirection;
      readonly frames: number }
  | { readonly kind: 'reachZone'; readonly zone: StageZone;
      readonly requireDirection?: SemanticDirection }
  /** Cross to the other side of the dummy, proven by a facing flip. */
  | { readonly kind: 'switchSides' }
  | { readonly kind: 'pressButton'; readonly button: PlayerButton;
      readonly count: number }
  | { readonly kind: 'pressChord'; readonly buttons: readonly PlayerButton[];
      readonly count: number }
  | { readonly kind: 'performMotion'; readonly motion: MotionId;
      readonly button?: PlayerButton; readonly count: number }
  /** The engine actually started one of these moves. */
  | { readonly kind: 'performMove'; readonly moveIds: readonly string[];
      readonly count: number }
  | { readonly kind: 'jump'; readonly direction: SemanticDirection;
      readonly count: number }
  | { readonly kind: 'dash'; readonly direction: 'forward' | 'back';
      readonly count: number }
  | { readonly kind: 'hitTarget'; readonly moveIds?: readonly string[];
      readonly count: number }
  /** Deliberately miss: the move ran its whole length without contact. */
  | { readonly kind: 'whiffMove'; readonly moveIds: readonly string[];
      readonly count: number }
  | { readonly kind: 'blockAttack'; readonly count: number;
      readonly level?: 'high' | 'mid' | 'low';
      readonly requirePerfect?: boolean; readonly requirePainGuard?: boolean }
  | { readonly kind: 'takeGuardBreak'; readonly count: number }
  | { readonly kind: 'escapeThrow'; readonly count: number }
  | { readonly kind: 'landThrow'; readonly count: number;
      readonly kinds?: readonly string[] }
  /** Act on the first actionable frame after stun or knockdown. */
  | { readonly kind: 'reversal'; readonly moveIds?: readonly string[];
      readonly windowFrames: number }
  | { readonly kind: 'punishRecovery'; readonly count: number }
  | { readonly kind: 'antiAir'; readonly count: number }
  | { readonly kind: 'combo'; readonly route: readonly string[];
      readonly requireTrue: boolean }
  | { readonly kind: 'comboHits'; readonly minimum: number;
      readonly requireTrue: boolean }
  | { readonly kind: 'absorbWithArmour'; readonly count: number }
  | { readonly kind: 'reachResource'; readonly minimum: number }
  | { readonly kind: 'spendResource'; readonly minimum: number }
  | { readonly kind: 'spawnWall'; readonly count: number }
  | { readonly kind: 'wallInteraction';
      readonly phases: readonly string[]; readonly count: number }
  | { readonly kind: 'surviveSequence'; readonly frames: number;
      readonly maxHitsTaken: number }
  | { readonly kind: 'noDamageTaken'; readonly frames: number }
  /** Progression and Training objectives are satisfied by UI facts, not combat. */
  | { readonly kind: 'progressionAction'; readonly action: string;
      readonly detail?: string }
  | { readonly kind: 'trainingAction'; readonly action: string;
      readonly detail?: string }
  /** Composites. `sequence` is ordered; `all` is not. */
  | { readonly kind: 'sequence'; readonly steps: readonly ObjectiveSpec[] }
  | { readonly kind: 'all'; readonly steps: readonly ObjectiveSpec[] };

export type ObjectiveKind = ObjectiveSpec['kind'];
