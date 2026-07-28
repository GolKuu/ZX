import Phaser from 'phaser';
import type {
  ComboSnapshot,
  FighterSnapshot,
  SimulationSnapshot,
} from '../../core/types';

export class DefenseTrainingHud {
  private readonly playerOne: Phaser.GameObjects.Text;
  private readonly playerTwo: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private readonly visible: boolean) {
    this.playerOne = this.makePanel(scene, 36, 404, 0);
    this.playerTwo = this.makePanel(scene, 924, 404, 1);
  }

  update(snapshot: SimulationSnapshot) {
    this.updatePanel(
      this.playerOne,
      snapshot.fighters.player1,
      snapshot.combos.player2,
    );
    this.updatePanel(
      this.playerTwo,
      snapshot.fighters.player2,
      snapshot.combos.player1,
    );
  }

  destroy() {
    this.playerOne.destroy();
    this.playerTwo.destroy();
  }

  private updatePanel(
    panel: Phaser.GameObjects.Text,
    fighter: FighterSnapshot,
    incomingCombo: ComboSnapshot,
  ) {
    const feedback = feedbackLabel(fighter);
    const escape = escapeLabel(fighter, incomingCombo);
    const segments =
      '◆'.repeat(fighter.defense.segments) +
      '◇'.repeat(fighter.defense.maxSegments - fighter.defense.segments);
    panel
      .setText(`${feedback}\n${escape}\nСЕГМЕНТЫ ${segments}`)
      .setColor(incomingCombo.escapeWindowTicksRemaining > 0 ? '#fff2a8' : '#ffffff')
      .setVisible(this.visible);
  }

  private makePanel(scene: Phaser.Scene, x: number, y: number, originX: number) {
    return scene.add
      .text(x, y, '', {
        fontFamily: 'Arial',
        fontSize: '12px',
        fontStyle: 'bold',
        align: originX === 0 ? 'left' : 'right',
        color: '#ffffff',
        backgroundColor: '#30264fcc',
        padding: { x: 9, y: 7 },
        lineSpacing: 3,
      })
      .setOrigin(originX, 0)
      .setDepth(22)
      .setVisible(false);
  }
}

function feedbackLabel(fighter: FighterSnapshot) {
  if (fighter.defense.feedback === 'too-early') return 'ТАЙМИНГ: СЛИШКОМ РАНО';
  if (fighter.defense.feedback === 'too-late') return 'ТАЙМИНГ: СЛИШКОМ ПОЗДНО';
  if (fighter.defense.feedback === 'success') {
    if (fighter.defense.effect === 'perfect-block') return 'УСПЕШНО: ИДЕАЛЬНЫЙ БЛОК';
    if (fighter.defense.effect === 'precise-block') return 'УСПЕШНО: ТОЧНЫЙ БЛОК';
    return 'ТАЙМИНГ: УСПЕШНО';
  }
  return 'ТАЙМИНГ: —';
}

function escapeLabel(fighter: FighterSnapshot, combo: ComboSnapshot) {
  if (combo.escapeWindowTicksRemaining > 0) {
    return `COMBO ESCAPE: ОКНО ${combo.escapeWindowTicksRemaining}`;
  }
  if (fighter.defense.comboEscapeCooldownTicks > 0) {
    return `COMBO ESCAPE: COOLDOWN ${fighter.defense.comboEscapeCooldownTicks}`;
  }
  return 'COMBO ESCAPE: —';
}
