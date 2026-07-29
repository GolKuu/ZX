import type { GameAction } from '../core/types';

export type HitLevel = 'mid' | 'low' | 'overhead' | 'air' | 'throw';
export type AttackCategory = 'light' | 'heavy' | 'special' | 'throw' | 'super';

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
  effectId: string;
  soundId: string;
  category: AttackCategory;
  action: GameAction;
  knockdown: boolean;
  sideSwitch: boolean;
  energyGain: number;
  energyCost: number;
};

export type CharacterAttackSet = {
  lightChain: readonly [AttackDefinition, AttackDefinition, AttackDefinition];
  heavy: readonly [AttackDefinition, AttackDefinition];
  low: AttackDefinition;
  air: AttackDefinition;
  special: AttackDefinition;
  grab: AttackDefinition;
  forwardThrow: AttackDefinition;
  backThrow: AttackDefinition;
  superAttack: AttackDefinition;
};
