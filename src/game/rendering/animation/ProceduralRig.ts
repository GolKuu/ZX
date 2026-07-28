import Phaser from 'phaser';
import type { CharacterRig, RigFrame, RigParts, RigPose } from './RigTypes';
import { poseFor } from './PoseLibrary';

export class ProceduralRig implements CharacterRig {
  readonly root: Phaser.GameObjects.Container;
  private current: RigPose;

  constructor(
    private readonly parts: RigParts,
    private readonly kind: 'granite' | 'shira',
  ) {
    this.root = parts.root;
    this.current = poseFor({
      state: 'idle',
      tick: 0,
      phase: null,
      motion: null,
      stopped: false,
    }, kind);
  }

  sync(frame: RigFrame) {
    if (frame.stopped) return;
    const target = poseFor(frame, this.kind);
    this.current = blendPose(this.current, target);
    const pose = this.current;
    this.root
      .setPosition(pose.x, pose.y)
      .setRotation(pose.rotation)
      .setScale(pose.scaleX, pose.scaleY);
    this.parts.torso.setRotation(pose.torso);
    this.parts.head.setRotation(blend(this.parts.head.rotation, pose.head, 0.14));
    this.parts.frontArm.setRotation(blend(this.parts.frontArm.rotation, pose.frontArm, 0.34));
    this.parts.backArm.setRotation(blend(this.parts.backArm.rotation, pose.backArm, 0.22));
    this.parts.frontLeg.setRotation(blend(this.parts.frontLeg.rotation, pose.frontLeg, 0.3));
    this.parts.backLeg.setRotation(blend(this.parts.backLeg.rotation, pose.backLeg, 0.2));
  }

  setAlpha(alpha: number) {
    this.root.setAlpha(alpha);
  }
}

function blendPose(current: RigPose, target: RigPose): RigPose {
  return {
    x: blend(current.x, target.x, 0.32),
    y: blend(current.y, target.y, 0.3),
    rotation: blend(current.rotation, target.rotation, 0.28),
    scaleX: blend(current.scaleX, target.scaleX, 0.38),
    scaleY: blend(current.scaleY, target.scaleY, 0.38),
    head: blend(current.head, target.head, 0.18),
    torso: blend(current.torso, target.torso, 0.3),
    frontArm: blend(current.frontArm, target.frontArm, 0.35),
    backArm: blend(current.backArm, target.backArm, 0.24),
    frontLeg: blend(current.frontLeg, target.frontLeg, 0.32),
    backLeg: blend(current.backLeg, target.backLeg, 0.22),
  };
}

function blend(from: number, to: number, amount: number) {
  return Phaser.Math.Linear(from, to, amount);
}
