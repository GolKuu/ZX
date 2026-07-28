import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import type { FighterSnapshot, PlayerId } from '../../core/types';
import { AttackVisualRenderer } from '../effects/AttackVisualRenderer';
import { createCharacterBody } from './CharacterBodyFactory';

export class FighterRenderer {
  readonly container: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly body: Phaser.GameObjects.Shape;
  private readonly bodyContainer: Phaser.GameObjects.Container;
  private readonly attackVisual: AttackVisualRenderer;

  constructor(scene: Phaser.Scene, ownerId: PlayerId, character: CharacterDefinition) {
    this.shadow = scene.add.ellipse(0, 34, 92, 22, 0x2f2555, 0.25);
    const appearance = createCharacterBody(scene, character);
    this.body = appearance.body;
    this.bodyContainer = scene.add.container(0, 0, [
      this.shadow,
      ...appearance.children,
    ]);
    this.attackVisual = new AttackVisualRenderer(scene, ownerId, character.accentColor);
    this.container = scene.add.container(0, 0, [this.bodyContainer, this.attackVisual.graphics]);
  }

  sync(snapshot: FighterSnapshot) {
    const crouchScale = snapshot.mode === 'crouching' ? 0.72 : 1;
    this.container.setPosition(snapshot.x, snapshot.y - 38);
    this.bodyContainer.setPosition(0, 38 * (1 - crouchScale));
    this.bodyContainer.setScale(snapshot.facing, crouchScale);
    if (snapshot.mode === 'blocking') this.bodyContainer.setScale(snapshot.facing * 0.9, 0.9);
    if (snapshot.mode === 'attackActive') {
      this.bodyContainer.setScale(snapshot.facing * 1.16, 0.88);
    }
    const knockedDown = snapshot.mode === 'knockdown' || snapshot.mode === 'knockout';
    this.bodyContainer.setRotation(knockedDown ? snapshot.facing * 1.35 : 0);
    const stunned = snapshot.mode === 'hitstun' || snapshot.mode === 'blockstun';
    this.body.setAlpha(stunned ? 0.55 : snapshot.mode === 'wakeup' ? 0.75 : 1);
    this.shadow.setScale(snapshot.grounded ? 1 : 0.7);
    this.attackVisual.sync(snapshot);
  }

  destroy() {
    this.container.destroy(true);
  }
}
