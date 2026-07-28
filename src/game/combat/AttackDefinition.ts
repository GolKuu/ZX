import type { CombatAction } from '../core/types';

export type HitLevel = 'mid' | 'low' | 'overhead' | 'air' | 'throw';
export type AttackCategory = 'light' | 'heavy' | 'special' | 'throw' | 'super';
export type AttackMotion =
  | 'punch'
  | 'front-kick'
  | 'roundhouse-kick'
  | 'sweep-kick'
  | 'axe-kick'
  | 'slam'
  | 'slash'
  | 'thrust'
  | 'burst'
  | 'throw';
export type AttackVisualShape = 'arc' | 'line' | 'burst' | 'ground' | 'projectile';

export type HitboxDefinition = {
  startFrame: number;
  endFrame: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export type MovementFrame = {
  frame: number;
  velocityX: number;
  velocityY: number;
};

export type CancelWindow = {
  startFrame: number;
  endFrame: number;
  into: readonly AttackCategory[];
  onHitOnly: boolean;
};

export type AttackDefinition = {
  id: string;
  name: string;
  description: string;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  damage: number;
  chipDamage: number;
  blockDamage: number;
  hitStun: number;
  blockStun: number;
  knockbackX: number;
  knockbackY: number;
  hitLevel: HitLevel;
  hitboxes: readonly HitboxDefinition[];
  movementTimeline: readonly MovementFrame[];
  cancelWindows: readonly CancelWindow[];
  comboScaling: number;
  reversalType: 'none' | 'invincible' | 'armor';
  comboEscapeWindows: readonly { startFrame: number; endFrame: number }[];
  animationId: string;
  motion: AttackMotion;
  visualShape: AttackVisualShape;
  effectId: string;
  soundId: string;
  category: AttackCategory;
  action: CombatAction;
  knockdown: boolean;
  isFinisher: boolean;
  sideSwitch: boolean;
  energyGain: number;
  energyCost: number;
  hitStopFrames: number;
  visualReach: number;
};

export type CharacterAttackSet = {
  lightChain: readonly [
    AttackDefinition,
    AttackDefinition,
    AttackDefinition,
  ];
  heavy: readonly [AttackDefinition, AttackDefinition, AttackDefinition];
  low: AttackDefinition;
  lowHeavy: AttackDefinition;
  air: AttackDefinition;
  airHeavy: AttackDefinition;
  forwardLight: AttackDefinition;
  retreatLight: AttackDefinition;
  dashLight: AttackDefinition;
  forwardHeavy: AttackDefinition;
  retreatHeavy: AttackDefinition;
  dashHeavy: AttackDefinition;
  special: AttackDefinition;
  forwardSpecial: AttackDefinition;
  retreatSpecial: AttackDefinition;
  airSpecial: AttackDefinition;
  enhancedSpecial: AttackDefinition;
  grab: AttackDefinition;
  forwardThrow: AttackDefinition;
  backThrow: AttackDefinition;
  reversal: AttackDefinition;
  superAttack: AttackDefinition;
};
