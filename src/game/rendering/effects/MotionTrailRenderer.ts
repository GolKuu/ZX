import Phaser from 'phaser';
import type { FighterSnapshot } from '../../core/types';
import type { AnimationStateId } from '../animation/AnimationCatalog';

export class MotionTrailRenderer {
  readonly graphics: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    private readonly color: number,
    private readonly kind: 'granite' | 'shira',
  ) {
    this.graphics = scene.add.graphics().setDepth(2).setVisible(false);
  }

  sync(snapshot: FighterSnapshot, state: AnimationStateId) {
    const movingFast = state === 'dash' || snapshot.mode === 'attackActive';
    this.graphics.clear().setVisible(movingFast).setScale(snapshot.facing, 1);
    if (!movingFast) return;
    const pulse = (snapshot.attack?.frame ?? snapshot.dashTicksRemaining) % 4;
    this.graphics.fillStyle(this.color, 0.14 + pulse * 0.025);
    if (this.kind === 'granite') {
      this.graphics
        .fillRoundedRect(-64, -57, 54, 82, 22)
        .fillRoundedRect(-102, -48, 36, 66, 18);
    } else {
      this.graphics
        .fillTriangle(-92, -48, -10, -18, -78, 12)
        .fillTriangle(-112, -26, -18, 1, -96, 30)
        .lineStyle(5, 0xffffff, 0.26)
        .beginPath().moveTo(-104, -34).lineTo(-22, 18).strokePath();
    }
  }
}
