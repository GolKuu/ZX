import type Phaser from 'phaser';
import type { AnimationStateId } from './AnimationCatalog';

export type RigPose = {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  head: number;
  torso: number;
  frontArm: number;
  backArm: number;
  frontLeg: number;
  backLeg: number;
};

export type RigParts = {
  root: Phaser.GameObjects.Container;
  torso: Phaser.GameObjects.Container;
  head: Phaser.GameObjects.Container;
  frontArm: Phaser.GameObjects.Container;
  backArm: Phaser.GameObjects.Container;
  frontLeg: Phaser.GameObjects.Container;
  backLeg: Phaser.GameObjects.Container;
};

export type RigFrame = {
  state: AnimationStateId;
  tick: number;
  phase: 'startup' | 'active' | 'recovery' | null;
  stopped: boolean;
};

export type CharacterRig = {
  root: Phaser.GameObjects.Container;
  sync: (frame: RigFrame) => void;
  setAlpha: (alpha: number) => void;
};
