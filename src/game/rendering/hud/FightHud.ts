import Phaser from 'phaser';
import { TICKS_PER_SECOND } from '../../config/balanceConfig';
import type { ComboSnapshot, SimulationSnapshot } from '../../core/types';
import { createSuperIndicator, drawFighterBars, drawRoundWins } from './HudBars';

export class FightHud {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly timer: Phaser.GameObjects.Text;
  private readonly round: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;
  private readonly comboOne: Phaser.GameObjects.Text;
  private readonly comboTwo: Phaser.GameObjects.Text;
  private readonly superOne: Phaser.GameObjects.Text;
  private readonly superTwo: Phaser.GameObjects.Text;
  private readonly gaugeLabels: Phaser.GameObjects.Text[];

  constructor(scene: Phaser.Scene, private readonly showCombatHints = true) {
    this.graphics = scene.add.graphics().setDepth(20);
    this.timer = this.makeText(scene, 480, 18, '90', '32px');
    this.round = this.makeText(scene, 480, 56, 'Раунд 1', '15px');
    this.status = scene.add
      .text(480, 170, '', {
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
    this.comboOne = this.makeComboText(scene, 42, 122, 0);
    this.comboTwo = this.makeComboText(scene, 918, 122, 1);
    this.superOne = createSuperIndicator(scene, 42, 0);
    this.superTwo = createSuperIndicator(scene, 918, 1);
    this.gaugeLabels = [
      this.makeGaugeLabel(scene, 44, 30, 'HP', 0),
      this.makeGaugeLabel(scene, 44, 55, 'ENERGY', 0),
      this.makeGaugeLabel(scene, 44, 69, 'BLOCK', 0),
      this.makeGaugeLabel(scene, 916, 30, 'HP', 1),
      this.makeGaugeLabel(scene, 916, 55, 'ENERGY', 1),
      this.makeGaugeLabel(scene, 916, 69, 'BLOCK', 1),
    ];
  }

  update(snapshot: SimulationSnapshot, countdownLabel: string) {
    this.graphics.clear();
    drawFighterBars(this.graphics, snapshot.fighters.player1, 36, 0xff5d73);
    drawFighterBars(this.graphics, snapshot.fighters.player2, 594, 0x3fd1c4, true);
    drawRoundWins(this.graphics, snapshot);
    this.timer.setText(String(Math.ceil(snapshot.roundTicksRemaining / TICKS_PER_SECOND)));
    this.round.setText(`Раунд ${snapshot.roundNumber}`);
    this.updateCombo(this.comboOne, snapshot.combos.player1);
    this.updateCombo(this.comboTwo, snapshot.combos.player2);
    this.superOne.setVisible(
      this.showCombatHints &&
      snapshot.fighters.player1.energy >= snapshot.fighters.player1.maxEnergy,
    );
    this.superTwo.setVisible(
      this.showCombatHints &&
      snapshot.fighters.player2.energy >= snapshot.fighters.player2.maxEnergy,
    );

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
    this.comboOne.destroy();
    this.comboTwo.destroy();
    this.superOne.destroy();
    this.superTwo.destroy();
    this.gaugeLabels.forEach((label) => label.destroy());
  }

  private updateCombo(text: Phaser.GameObjects.Text, combo: ComboSnapshot) {
    text
      .setText(`${combo.hits} HIT\n${combo.damage} УРОНА`)
      .setVisible(combo.hits >= 2);
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

  private makeComboText(scene: Phaser.Scene, x: number, y: number, originX: number) {
    return scene.add
      .text(x, y, '', {
        fontFamily: 'Arial',
        fontSize: '22px',
        fontStyle: 'bold',
        align: originX === 0 ? 'left' : 'right',
        color: '#ffffff',
        stroke: '#30264f',
        strokeThickness: 5,
      })
      .setOrigin(originX, 0)
      .setDepth(21)
      .setVisible(false);
  }

  private makeGaugeLabel(
    scene: Phaser.Scene,
    x: number,
    y: number,
    value: string,
    originX: number,
  ) {
    return scene.add
      .text(x, y, value, {
        fontFamily: 'Arial',
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#30264f',
      })
      .setOrigin(originX, 0)
      .setDepth(22);
  }

}
