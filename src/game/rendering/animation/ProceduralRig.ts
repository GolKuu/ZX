import Phaser from 'phaser';
import {
  RIG_RESTING_BOTTOM,
  type CharacterRig,
  type RigFrame,
  type RigParts,
  type RigPose,
} from './RigTypes';
import { poseFor } from './PoseLibrary';
import type { CharacterId } from '../../data/characters/circleFighters';
import { CHARACTER_MOTION } from './CharacterMotionProfiles';

export class ProceduralRig implements CharacterRig {
  readonly root: Phaser.GameObjects.Container;
  private current: RigPose;
  private readonly headAnchor: Readonly<{ x: number; y: number }>;

  constructor(
    private readonly parts: RigParts,
    private readonly kind: 'granite' | 'shira',
    private readonly characterId: CharacterId,
  ) {
    this.root = parts.root;
    this.headAnchor = { x: parts.head.x, y: parts.head.y };
    this.current = poseFor({
      state: 'idle',
      tick: 0,
      phase: null,
      motion: null,
      stopped: false,
    }, kind, characterId);
  }

  sync(frame: RigFrame) {
    if (frame.stopped) return;
    const target = poseFor(frame, this.kind, this.characterId);
    this.current = blendPose(
      this.current,
      target,
      CHARACTER_MOTION[this.characterId].blend,
    );
    const pose = this.current;
    this.root
      .setPosition(pose.x, groundedRootOffsetY(pose.y, pose.scaleY))
      .setRotation(pose.rotation)
      .setScale(pose.scaleX, pose.scaleY);
    this.parts.torso.setRotation(pose.torso);
    this.parts.head
      .setPosition(this.headAnchor.x, this.headAnchor.y)
      .setRotation(pose.head);
    this.parts.frontArm.setRotation(pose.frontArm);
    this.parts.backArm.setRotation(pose.backArm);
    this.parts.frontLeg.setRotation(pose.frontLeg);
    this.parts.backLeg.setRotation(pose.backLeg);
  }

  setAlpha(alpha: number) {
    this.root.setAlpha(alpha);
  }
}

export function groundedRootOffsetY(poseY: number, scaleY: number) {
  return poseY + RIG_RESTING_BOTTOM * (1 - scaleY);
}

function blendPose(current: RigPose, target: RigPose, speed: number): RigPose {
  return {
    x: blend(current.x, target.x, speed),
    y: blend(current.y, target.y, speed * .92),
    rotation: blend(current.rotation, target.rotation, speed * .86),
    scaleX: blend(current.scaleX, target.scaleX, speed * 1.12),
    scaleY: blend(current.scaleY, target.scaleY, speed * 1.12),
    head: blend(current.head, target.head, speed * .62),
    torso: blend(current.torso, target.torso, speed * .94),
    frontArm: blend(current.frontArm, target.frontArm, speed * 1.08),
    backArm: blend(current.backArm, target.backArm, speed * .76),
    frontLeg: blend(current.frontLeg, target.frontLeg, speed),
    backLeg: blend(current.backLeg, target.backLeg, speed * .7),
  };
}

function blend(from: number, to: number, amount: number) {
  return Phaser.Math.Linear(from, to, amount);
}
