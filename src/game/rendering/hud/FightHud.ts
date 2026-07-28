import Phaser from 'phaser';
import { balanceConfig, TICKS_PER_SECOND } from '../../config/balanceConfig';
import type { SimulationSnapshot } from '../../core/types';

export class FightHud {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly timer: Phaser.GameObjects.Text;
  private readonly round: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(20);
    this.timer = this.makeText(scene, balanceConfig.arenaWidth / 2, 28, '90', '32px');
    this.round = this.makeText(scene, balanceConfig.arenaWidth / 2, 65, 'Раунд 1', '16px');
    this.status = scene.add
      .text(balanceConfig.arenaWidth / 2, 175, '', {
        fontFamily: 'Arial',
        fontSize: '54px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#30264f',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setVisible(false);
  }

  update(snapshot: SimulationSnapshot, countdownLabel: string) {
    this.graphics.clear();
    this.drawHealth(36, snapshot.fighters.player1.health, 0xff5d73);
    this.drawHealth(624, snapshot.fighters.player2.health, 0x3fd1c4);
    this.drawRoundWins(snapshot);
    this.timer.setText(String(Math.ceil(snapshot.roundTicksRemaining / TICKS_PER_SECOND)));
    this.round.setText(`Раунд ${snapshot.roundNumber}`);

    const label =
      countdownLabel ||
      (snapshot.matchWinner
        ? `${snapshot.matchWinner === 'player1' ? 'Player 1' : 'Player 2'} победил!`
        : snapshot.roundPhase === 'ROUND_OVER'
          ? snapshot.roundWinner
            ? 'Раунд окончен'
            : 'Ничья'
          : snapshot.paused
            ? 'Пауза'
            : '');
    this.status.setText(label).setVisible(Boolean(label));
  }

  destroy() {
    this.graphics.destroy();
    this.timer.destroy();
    this.round.destroy();
    this.status.destroy();
  }

  private makeText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    value: string,
    fontSize: string,
  ) {
    return scene.add
      .text(x, y, value, {
        fontFamily: 'Arial',
        fontSize,
        fontStyle: 'bold',
        color: '#30264f',
      })
      .setOrigin(0.5, 0)
      .setDepth(21);
  }

  private drawHealth(x: number, health: number, color: number) {
    const width = 300;
    this.graphics.fillStyle(0x30264f, 0.35).fillRoundedRect(x, 32, width, 28, 14);
    this.graphics
      .fillStyle(color)
      .fillRoundedRect(x + 4, 36, (width - 8) * (health / 100), 20, 10);
  }

  private drawRoundWins(snapshot: SimulationSnapshot) {
    [0, 1].forEach((index) => {
      this.graphics
        .fillStyle(index < snapshot.wins.player1 ? 0xffdc62 : 0xffffff, 0.95)
        .fillCircle(52 + index * 22, 75, 7);
      this.graphics
        .fillStyle(index < snapshot.wins.player2 ? 0xffdc62 : 0xffffff, 0.95)
        .fillCircle(908 - index * 22, 75, 7);
    });
  }
}
