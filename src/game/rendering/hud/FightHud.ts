import Phaser from 'phaser';
import { balanceConfig, TICKS_PER_SECOND } from '../../config/balanceConfig';
import type { SimulationSnapshot } from '../../core/types';

export class FightHud {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly timer: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(20);
    this.timer = scene.add
      .text(balanceConfig.arenaWidth / 2, 28, '60', {
        fontFamily: 'Arial',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#30264f',
      })
      .setOrigin(0.5, 0)
      .setDepth(21);
    this.status = scene.add
      .text(balanceConfig.arenaWidth / 2, 92, '', {
        fontFamily: 'Arial',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#30264fcc',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setVisible(false);
  }

  update(snapshot: SimulationSnapshot) {
    this.graphics.clear();
    this.drawHealth(36, snapshot.fighters.player1.health, 0xff5d73);
    this.drawHealth(624, snapshot.fighters.player2.health, 0x3fd1c4);
    this.timer.setText(String(Math.ceil(snapshot.roundTicksRemaining / TICKS_PER_SECOND)));

    const label = snapshot.winner
      ? snapshot.winner === 'player1'
        ? 'Комета побеждает!'
        : 'Импульс побеждает!'
      : snapshot.paused
        ? 'Пауза'
        : '';
    this.status.setText(label).setVisible(Boolean(label));
  }

  destroy() {
    this.graphics.destroy();
    this.timer.destroy();
    this.status.destroy();
  }

  private drawHealth(x: number, health: number, color: number) {
    const width = 300;
    this.graphics.fillStyle(0x30264f, 0.35).fillRoundedRect(x, 32, width, 28, 14);
    this.graphics
      .fillStyle(color)
      .fillRoundedRect(x + 4, 36, (width - 8) * (health / 100), 20, 10);
  }
}
