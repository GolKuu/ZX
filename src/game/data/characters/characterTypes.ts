import type { AnimationStateId } from '../../rendering/animation/AnimationCatalog';

export const CHARACTER_IDS = [
  'granite', 'caliber', 'volt', 'nocturne', 'ragnar',
  'marina', 'zephyr', 'origami', 'poro', 'fenr',
  'sylvan', 'adamant', 'vassa', 'shira', 'pyron',
] as const;

export type CharacterId = (typeof CHARACTER_IDS)[number];
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type CombatStyle = 'heavy' | 'balanced' | 'rushdown' | 'zoning';
export type VisualRigKind = 'granite' | 'shira';
export type SilhouetteKind = 'heavy' | 'balanced' | 'agile';

export type CharacterStats = {
  maxHealth: number;
  walkSpeed: number;
  airMoveSpeed: number;
  dashSpeed: number;
  dashTicks: number;
  jumpSpeed: number;
  range: 1 | 2 | 3 | 4 | 5;
};

export type UniqueResource = {
  name: string;
  description: string;
  initialValue: number;
  maximumValue: number;
  status: 'active' | 'prototype';
};

export type CharacterVisualModel = {
  type: 'final-procedural' | 'final-original';
  rig: VisualRigKind;
  silhouette: SilhouetteKind;
  symbol: string;
};

export type CharacterDefinition = {
  id: CharacterId;
  forceIndex: number;
  name: string;
  force: string;
  archetype: string;
  difficulty: Difficulty;
  tagline: string;
  passiveName: string;
  passiveDescription: string;
  uniqueResource: UniqueResource;
  strengths: readonly string[];
  weaknesses: readonly string[];
  basicAttackNames: readonly [string, string, string, string, string, string];
  combatStyle: CombatStyle;
  color: number;
  cssColor: string;
  accentColor: number;
  accentCss: string;
  shadowColor: number;
  visualKind: VisualRigKind;
  visualModel: CharacterVisualModel;
  stats: CharacterStats;
  animationStates: readonly AnimationStateId[];
};

export type CharacterSeed = Omit<CharacterDefinition, 'animationStates' | 'visualKind'>;
