import Phaser from 'phaser';
import type { ArenaTrapSnapshot } from '../../core/types';

export class ArenaTrapRenderer {
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(3);
  }

  sync(traps: readonly ArenaTrapSnapshot[]) {
    this.graphics.clear();
    traps.forEach((trap) => {
      if (!trap.active) {
        this.graphics
          .lineStyle(3, 0xffffff, 0.24)
          .beginPath().moveTo(trap.x - 14, 445).lineTo(trap.x + 14, 445).strokePath();
        return;
      }
      if (trap.cuttable) this.drawRibbonTrap(trap.x);
      else this.drawStoneMarker(trap.x);
    });
  }

  destroy() {
    this.graphics.destroy();
  }

  private drawRibbonTrap(x: number) {
    this.graphics
      .fillStyle(0xe15367, 0.86)
      .fillTriangle(x - 16, 447, x, 410, x + 4, 447)
      .fillStyle(0x5bd6c7, 0.9)
      .fillTriangle(x - 4, 447, x + 9, 416, x + 17, 447)
      .lineStyle(3, 0x3f2942, 0.72)
      .strokeTriangle(x - 16, 447, x, 410, x + 17, 447);
  }

  private drawStoneMarker(x: number) {
    this.graphics
      .fillStyle(0x596273, 0.38)
      .fillRoundedRect(x - 18, 420, 36, 29, 9)
      .lineStyle(3, 0xe9a84a, 0.36)
      .strokeRoundedRect(x - 18, 420, 36, 29, 9);
  }
}
