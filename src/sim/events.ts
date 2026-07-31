import type { FixedVector } from './math.js';
import type { MovePhase } from './frame-data.js';
import type { WallKind } from './walls/types.js';

interface CombatEventBase {
  readonly frame: number;
}

export interface MoveStartedEvent extends CombatEventBase {
  readonly type: 'moveStarted';
  readonly fighterId: string;
  readonly moveId: string;
}

export interface MoveEndedEvent extends CombatEventBase {
  readonly type: 'moveEnded';
  readonly fighterId: string;
  readonly moveId: string;
}

export interface HitEvent extends CombatEventBase {
  readonly type: 'hit';
  readonly attackerId: string;
  readonly defenderId: string;
  readonly moveId: string;
  readonly hitId: string;
  readonly damage: number;
  readonly position: FixedVector;
}

export interface BlockEvent extends CombatEventBase {
  readonly type: 'block';
  readonly attackerId: string;
  readonly defenderId: string;
  readonly moveId: string;
  readonly hitId: string;
  readonly position: FixedVector;
  readonly perfect: boolean;
  readonly painGuard: boolean;
}

export interface GuardBreakEvent extends CombatEventBase {
  readonly type: 'guardBreak';
  readonly attackerId: string;
  readonly defenderId: string;
  readonly moveId: string;
}

export interface ArmourAbsorbedEvent extends CombatEventBase {
  readonly type: 'armourAbsorbed';
  readonly attackerId: string;
  readonly defenderId: string;
  readonly moveId: string;
  readonly damage: number;
}

export interface GrappleEvent extends CombatEventBase {
  readonly type: 'grapple';
  readonly attackerId: string;
  readonly defenderId: string;
  readonly moveId: string;
  readonly kind: import('./frame-data.js').GrappleKind;
  readonly pairedFrames: number;
}

export interface BounceEvent extends CombatEventBase {
  readonly type: 'wallBounce' | 'groundBounce';
  readonly fighterId: string;
  readonly remaining: number;
}

export interface WallSpawnedEvent extends CombatEventBase {
  readonly type: 'wallSpawned';
  readonly wallId: number;
  readonly ownerId: string;
  readonly kind: WallKind;
  readonly position: FixedVector;
}

export interface WallContactEvent extends CombatEventBase {
  readonly type: 'wallContact';
  readonly wallId: number;
  readonly ownerId: string;
  readonly attackerId: string;
  readonly integrity: number;
  readonly position: FixedVector;
}

export interface WallShatteredEvent extends CombatEventBase {
  readonly type: 'wallShattered';
  readonly wallId: number;
  readonly ownerId: string;
  readonly kind: WallKind;
  readonly position: FixedVector;
}

export type WallRunEventPhase =
  | 'contact'
  | 'jump'
  | 'exitForward'
  | 'exitBack'
  | 'interrupted'
  | 'fall';

export interface WallRunEvent extends CombatEventBase {
  readonly type: 'wallRun';
  readonly fighterId: string;
  readonly wallId: number;
  readonly phase: WallRunEventPhase;
}

export type CombatEvent =
  | MoveStartedEvent
  | MoveEndedEvent
  | HitEvent
  | BlockEvent
  | GuardBreakEvent
  | ArmourAbsorbedEvent
  | GrappleEvent
  | BounceEvent
  | WallSpawnedEvent
  | WallContactEvent
  | WallShatteredEvent
  | WallRunEvent;

export interface FighterDebugFrame {
  readonly fighterId: string;
  readonly moveId: string | null;
  readonly moveFrame: number | null;
  readonly phase: MovePhase | null;
  readonly hitboxes: readonly WorldBox[];
  readonly hurtboxes: readonly WorldBox[];
}

export interface WorldBox {
  readonly center: FixedVector;
  readonly halfSize: FixedVector;
}
