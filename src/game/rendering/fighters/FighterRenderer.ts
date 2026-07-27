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
    this.container.setPosition(snapshot.x, snapshot.y - 38);
    this.container.setScale(snapshot.mode === 'blocking' ? 0.9 : 1);
    this.body.setAlpha(snapshot.mode === 'hitstun' ? 0.55 : 1);
    this.shadow.setScale(snapshot.grounded ? 1 : 0.7);
  }

  destroy() {
    this.container.destroy(true);
  }
}
