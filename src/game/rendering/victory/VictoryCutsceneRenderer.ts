import Phaser from 'phaser';
import type { FighterSnapshot, PlayerId } from '../../core/types';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { drawVictoryForceEffect } from './VictoryForceEffects';
import { VICTORY_SCENES } from './victoryScenes';

export class VictoryCutsceneRenderer {
  private readonly effects: Phaser.GameObjects.Graphics;
  private readonly overlay: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly line: Phaser.GameObjects.Text;
  private activeWinner: PlayerId | null = null;

  constructor(private readonly scene: Phaser.Scene) {
    this.effects = scene.add.graphics().setDepth(4).setVisible(false);
    this.overlay = scene.add.graphics().setDepth(100).setVisible(false);
    this.title = scene.add.text(480, 65, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#241d3d',
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(101).setVisible(false);
    this.line = scene.add.text(480, 475, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fff4df',
    }).setOrigin(0.5).setDepth(101).setVisible(false);
  }

  sync(
    winnerId: PlayerId | null,
    fighter: FighterSnapshot | null,
    character: CharacterDefinition | null,
    elapsedMs: number,
  ) {
    if (!winnerId || !fighter || !character) {
      this.hide();
      return;
    }
    if (winnerId !== this.activeWinner) {
      this.activeWinner = winnerId;
      const definition = VICTORY_SCENES[character.id];
      this.title.setText(`${character.name} · ${definition.title}`);
      this.line.setText(definition.line);
    }
    const reveal = Math.min(1, elapsedMs / 520);
    const textReveal = Math.max(0, Math.min(1, (elapsedMs - 420) / 420));
    this.effects.clear().setVisible(true).setAlpha(reveal);
    drawVictoryForceEffect(this.effects, character, fighter.x, fighter.y, elapsedMs);
    this.overlay.clear().setVisible(true);
    this.overlay.fillStyle(0x171127, 0.12 * reveal).fillRect(0, 0, 960, 540);
    this.overlay.fillStyle(0x241d3d, 0.96)
      .fillRect(0, 0, 960, 45 * reveal)
      .fillRect(0, 540 - 63 * reveal, 960, 63 * reveal);
    this.title.setVisible(true).setAlpha(textReveal).setScale(0.86 + textReveal * 0.14);
    this.line.setVisible(true).setAlpha(textReveal);
    this.scene.cameras.main.setZoom(1 + Math.min(0.055, elapsedMs / 38_000));
  }

  destroy() {
    this.effects.destroy();
    this.overlay.destroy();
    this.title.destroy();
    this.line.destroy();
  }

  private hide() {
    this.activeWinner = null;
    this.effects.clear().setVisible(false);
    this.overlay.clear().setVisible(false);
    this.title.setVisible(false);
    this.line.setVisible(false);
    this.scene.cameras.main.setZoom(1);
  }
}
