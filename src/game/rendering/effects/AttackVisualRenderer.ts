import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { findCharacterAttack } from '../../data/attacks/characterAttacks';
import type { FighterSnapshot, PlayerId } from '../../core/types';
import type { AttackVisualShape } from '../../combat/AttackDefinition';
import { drawPowerAccent } from './AttackPowerAccents';

export class AttackVisualRenderer {
  readonly graphics: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    private readonly ownerId: PlayerId,
    private readonly character: CharacterDefinition,
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
    const definition = findCharacterAttack(snapshot.characterId, attack.id);
    const hitbox = definition?.hitboxes[0];
    if (!definition || !hitbox) return;
    const alpha = attack.phase === 'active' ? 0.88 : attack.phase === 'startup' ? 0.28 : 0.13;
    this.graphics.setVisible(true).setAlpha(alpha).setScale(snapshot.facing, 1);
    const x = hitbox.offsetX;
    const y = hitbox.offsetY + 38;
    this.drawShape(
      definition.visualShape,
      x,
      y,
      hitbox.width,
      hitbox.height,
      attack.phase === 'active',
      attack.frame,
    );
    if (definition.category === 'special' || definition.category === 'super') {
      drawPowerAccent(
        this.graphics,
        this.character,
        x,
        y,
        hitbox.width,
        hitbox.height,
        attack.frame,
      );
    }
  }

  private drawShape(
    shape: AttackVisualShape,
    x: number,
    y: number,
    width: number,
    height: number,
    active: boolean,
    frame: number,
  ) {
    const color = this.character.accentColor;
    const lineWidth = active ? 8 : 4;
    const centerY = y + height / 2;
    this.graphics.lineStyle(lineWidth, color, 0.9);
    if (shape === 'line') {
      this.graphics
        .fillStyle(color, active ? 0.34 : 0.15)
        .fillRoundedRect(x, centerY - height * 0.18, width, height * 0.36, 12)
        .beginPath().moveTo(x, centerY).lineTo(x + width, centerY).strokePath();
      return;
    }
    if (shape === 'arc') {
      this.graphics
        .beginPath()
        .arc(x + width * 0.42, centerY, width * 0.62, -1.1, 1.08)
        .strokePath()
        .lineStyle(Math.max(2, lineWidth / 2), 0xffffff, 0.72)
        .beginPath()
        .arc(x + width * 0.38, centerY, width * 0.48, -1, 0.98)
        .strokePath();
      return;
    }
    if (shape === 'ground') {
      this.graphics
        .fillStyle(color, active ? 0.42 : 0.16)
        .fillTriangle(x, y + height, x + width * 0.58, y, x + width, y + height)
        .beginPath().moveTo(x, y + height).lineTo(x + width, y + height).strokePath();
      return;
    }
    if (shape === 'projectile') {
      const pulse = 1 + (frame % 3) * 0.08;
      this.graphics
        .fillStyle(color, active ? 0.56 : 0.2)
        .fillEllipse(x + width * 0.72, centerY, width * 0.52 * pulse, height * 0.72)
        .beginPath().moveTo(x, centerY).lineTo(x + width * 0.62, centerY).strokePath();
      return;
    }
    this.graphics
      .fillStyle(color, active ? 0.48 : 0.18)
      .fillCircle(x + width * 0.55, centerY, Math.max(height, width * 0.42) / 2)
      .lineStyle(Math.max(2, lineWidth / 2), 0xffffff, 0.75)
      .strokeCircle(x + width * 0.55, centerY, Math.max(height, width * 0.42) / 2);
  }
}

export function ownsAttackVisual(ownerId: PlayerId, snapshot: FighterSnapshot) {
  return snapshot.id === ownerId;
}
