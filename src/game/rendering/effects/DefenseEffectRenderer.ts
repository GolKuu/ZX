import Phaser from 'phaser';
import { balanceConfig } from '../../config/balanceConfig';
import type { FighterSnapshot } from '../../core/types';

export class DefenseEffectRenderer {
  readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(9).setVisible(false);
  }

  sync(snapshot: FighterSnapshot) {
    const { effect, effectTicksRemaining } = snapshot.defense;
    this.graphics.clear();
    if (effect === 'none' || effectTicksRemaining === 0) {
      this.graphics.setVisible(false);
      return;
    }

    const progress = 1 - effectTicksRemaining / balanceConfig.defenseEffectFrames;
    this.graphics.setVisible(true).setAlpha(1 - progress * 0.72);
    if (effect === 'precise-block') this.drawPreciseBlock(progress);
    if (effect === 'perfect-block') this.drawPerfectBlock(progress);
    if (effect === 'combo-break') this.drawComboBreak(progress);
    if (effect === 'combo-escape') this.drawComboEscape(progress);
    if (effect === 'perfect-reversal') this.drawPerfectReversal(progress);
  }

  private drawPreciseBlock(progress: number) {
    this.graphics
      .lineStyle(7, 0x64ddff, 0.95)
      .strokeCircle(0, 38, 48 + progress * 28)
      .lineStyle(2, 0xffffff, 0.9)
      .strokeCircle(0, 38, 38 + progress * 18);
  }

  private drawPerfectBlock(progress: number) {
    this.graphics
      .lineStyle(8, 0xffdc62, 1)
      .strokeCircle(0, 38, 44 + progress * 38)
      .lineStyle(3, 0xffffff, 1)
      .strokeCircle(0, 38, 28 + progress * 26);
  }

  private drawComboBreak(progress: number) {
    const radius = 48 + progress * 120;
    this.graphics
      .fillStyle(0x9f8cff, 0.2)
      .fillCircle(0, 38, radius)
      .lineStyle(10, 0x7557ff, 0.9)
      .strokeCircle(0, 38, radius);
  }

  private drawComboEscape(progress: number) {
    this.graphics
      .lineStyle(8, 0x3fd1c4, 0.9)
      .strokeEllipse(0, 38, 100 + progress * 90, 62 + progress * 38)
      .lineStyle(3, 0xffffff, 0.8)
      .strokeEllipse(0, 38, 64 + progress * 60, 42 + progress * 24);
  }

  private drawPerfectReversal(progress: number) {
    this.graphics
      .fillStyle(0xfff1a8, 0.22)
      .fillCircle(0, 38, 46 + progress * 74)
      .lineStyle(9, 0xe9a84a, 0.96)
      .beginPath().arc(0, 38, 54 + progress * 38, -0.8, 4.8).strokePath()
      .fillStyle(0xffffff, 0.92)
      .fillTriangle(62, -1, 79, 12, 55, 18);
  }
}
