import Phaser from 'phaser';
import type { FighterSnapshot, PlayerId } from '../../core/types';
import { drawPowerVisual } from './AttackPowerVisuals';
import { drawStrikeVisual } from './AttackStrikeVisuals';

export class AttackVisualRenderer {
  readonly graphics: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    private readonly ownerId: PlayerId,
    private readonly color: number,
  ) {
    this.graphics = scene.add.graphics().setDepth(8).setVisible(false);
  }

  sync(snapshot: FighterSnapshot) {
    const attack = ownsAttackVisual(this.ownerId, snapshot) ? snapshot.attack : null;
    this.graphics.clear();
    if (!attack) {
      this.graphics.setVisible(false);
      return;
    }
    const moveId = attack.id.slice(snapshot.characterId.length + 1);
    const alpha = attack.phase === 'active' ? 1 : attack.phase === 'startup' ? 0.42 : 0.2;
    const pulse = 1 + (attack.frame % 3) * 0.04;
    this.graphics
      .setAlpha(alpha)
      .setScale(snapshot.facing * pulse, pulse)
      .setVisible(true)
      .lineStyle(6, this.color, 1)
      .fillStyle(this.color, 0.72);
    if (!drawStrikeVisual(this.graphics, this.color, moveId)) {
      drawPowerVisual(this.graphics, this.color, moveId);
    }
  }
}

export function ownsAttackVisual(ownerId: PlayerId, snapshot: FighterSnapshot) {
  return snapshot.id === ownerId;
}
