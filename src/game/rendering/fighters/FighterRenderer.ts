import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import type { FighterSnapshot } from '../../core/types';

export class FighterRenderer {
  readonly container: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly body: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, character: CharacterDefinition) {
    this.shadow = scene.add.ellipse(0, 34, 92, 22, 0x2f2555, 0.25);
    this.body = scene.add.circle(0, 0, 39, character.color);
    this.body.setStrokeStyle(6, 0xffffff, 0.9);
    const leftEye = scene.add.circle(-13, -8, 5, 0x27213c);
    const rightEye = scene.add.circle(13, -8, 5, 0x27213c);
    const smile = scene.add.arc(0, 7, 13, 15, 165, false, 0x27213c);
    smile.setStrokeStyle(4, 0x27213c);
    smile.setFillStyle();

    this.container = scene.add.container(0, 0, [
      this.shadow,
      this.body,
      leftEye,
      rightEye,
      smile,
    ]);
  }

  sync(snapshot: FighterSnapshot) {
    const crouchScale = snapshot.mode === 'crouching' ? 0.72 : 1;
    this.container.setPosition(snapshot.x, snapshot.y - 38 * crouchScale);
    this.container.setScale(snapshot.facing, crouchScale);
    if (snapshot.mode === 'blocking') this.container.setScale(snapshot.facing * 0.9, 0.9);
    if (snapshot.mode === 'attackActive') {
      this.container.setScale(snapshot.facing * 1.16, 0.88);
    }
    const knockedDown = snapshot.mode === 'knockdown' || snapshot.mode === 'knockout';
    this.container.setRotation(knockedDown ? snapshot.facing * 1.35 : 0);
    const stunned = snapshot.mode === 'hitstun' || snapshot.mode === 'blockstun';
    this.body.setAlpha(stunned ? 0.55 : snapshot.mode === 'wakeup' ? 0.75 : 1);
    this.shadow.setScale(snapshot.grounded ? 1 : 0.7);
  }

  destroy() {
    this.container.destroy(true);
  }
}
