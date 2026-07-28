import Phaser from 'phaser';
import type { FighterSnapshot } from '../../core/types';
import type { AnimationStateId } from '../animation/AnimationCatalog';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { CHARACTER_MOTION } from '../animation/CharacterMotionProfiles';

export class MotionTrailRenderer {
  readonly graphics: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    private readonly character: CharacterDefinition,
  ) {
    this.graphics = scene.add.graphics().setDepth(2).setVisible(false);
  }

  sync(snapshot: FighterSnapshot, state: AnimationStateId) {
    const movingFast = state === 'dash' || snapshot.mode === 'attackActive';
    this.graphics.clear().setVisible(movingFast).setScale(snapshot.facing, 1);
    if (!movingFast) return;
    const pulse = (snapshot.attack?.frame ?? snapshot.dashTicksRemaining) % 4;
    this.graphics.fillStyle(this.character.accentColor, 0.14 + pulse * 0.025);
    const style = CHARACTER_MOTION[this.character.id].trail;
    if (style === 'blocks') {
      this.graphics
        .fillRoundedRect(-64, -57, 54, 82, 22)
        .fillRoundedRect(-102, -48, 36, 66, 18);
    } else if (style === 'slashes') {
      this.graphics
        .fillTriangle(-92, -48, -10, -18, -78, 12)
        .fillTriangle(-112, -26, -18, 1, -96, 30)
        .lineStyle(5, 0xffffff, 0.26)
        .beginPath().moveTo(-104, -34).lineTo(-22, 18).strokePath();
    } else if (style === 'sparks') {
      this.graphics.lineStyle(7, this.character.accentColor, .32)
        .beginPath().moveTo(-118, 20).lineTo(-75, -18).lineTo(-91, 21)
        .lineTo(-40, -31).strokePath();
    } else if (style === 'rings') {
      this.graphics.lineStyle(9, this.character.accentColor, .2)
        .strokeEllipse(-40, -18, 68, 90)
        .strokeEllipse(-78, -10, 42, 62);
    } else {
      this.graphics.fillEllipse(-43, -14, 88, 62)
        .fillEllipse(-91, -4, 54, 40);
    }
  }
}
