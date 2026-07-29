export type AangElement = 'air' | 'fire' | 'earth' | 'water' | 'avatar';

export type AangCategory = 'normal' | 'special' | 'mechanic' | 'super';

export type RigPart =
  | 'root'
  | 'body'
  | 'head'
  | 'frontArm'
  | 'backArm'
  | 'frontLeg'
  | 'backLeg'
  | 'staff';

export interface AangMove {
  readonly id: string;
  readonly element: AangElement;
  readonly category: AangCategory;
  readonly input: string;
  readonly name: string;
  readonly description: string;
  readonly properties: readonly string[];
  readonly beats: readonly [windup: string, impact: string, recovery: string];
}

export interface RigPose {
  readonly at: number;
  readonly transforms: Partial<Record<RigPart, string>>;
}

export type OpponentReaction =
  | 'flinch'
  | 'launch'
  | 'knockdown'
  | 'push'
  | 'wall'
  | 'none';

export type EffectMotion =
  | 'air-palm'
  | 'air-arc'
  | 'air-low'
  | 'air-launch'
  | 'fire-jab'
  | 'fire-blade'
  | 'fire-low'
  | 'fire-column'
  | 'earth-elbow'
  | 'earth-spike'
  | 'earth-low'
  | 'earth-sweep'
  | 'water-whip'
  | 'water-double'
  | 'water-low'
  | 'water-crescent'
  | 'air-squall'
  | 'earth-wall'
  | 'water-diagonal'
  | 'element-shift'
  | 'elemental-cocoon'
  | 'avatar-state';

export interface AangMotion {
  readonly durationMs: number;
  readonly poses: readonly RigPose[];
  readonly effect: EffectMotion;
  readonly reaction: OpponentReaction;
}
