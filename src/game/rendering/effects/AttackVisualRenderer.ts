import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { getCharacterAttacks } from '../../data/attacks/characterAttacks';
import type { FighterSnapshot, PlayerId } from '../../core/types';

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
    const definition = allAttacks(snapshot.characterId)
      .find((candidate) => candidate.id === attack.id);
    const hitbox = definition?.hitboxes[0];
    if (!definition || !hitbox) return;
    const alpha = attack.phase === 'active' ? 0.88 : attack.phase === 'startup' ? 0.28 : 0.13;
    this.graphics.setVisible(true).setAlpha(alpha).setScale(snapshot.facing, 1);
    const x = hitbox.offsetX;
    const y = hitbox.offsetY + 38;
    if (this.character.visualKind === 'granite') {
      this.drawGranite(x, y, hitbox.width, hitbox.height, attack.phase === 'active');
    } else {
      this.drawShira(x, y, hitbox.width, hitbox.height, attack.frame);
    }
  }

  private drawGranite(x: number, y: number, width: number, height: number, active: boolean) {
    this.graphics
      .fillStyle(this.character.accentColor, active ? 0.5 : 0.22)
      .fillRoundedRect(x, y, width, height, Math.min(18, height / 2))
      .lineStyle(active ? 7 : 4, 0xffe2a2, 0.78)
      .strokeRoundedRect(x, y, width, height, Math.min(18, height / 2));
    if (height <= 40) {
      this.graphics.beginPath().moveTo(x, y + height).lineTo(x + width, y + height).strokePath();
    }
  }

  private drawShira(x: number, y: number, width: number, height: number, frame: number) {
    const inset = frame % 2 === 0 ? 3 : 8;
    this.graphics
      .lineStyle(7, this.character.accentColor, 0.96)
      .beginPath().moveTo(x, y + inset).lineTo(x + width, y + height - inset).strokePath()
      .lineStyle(4, 0xffffff, 0.82)
      .beginPath().moveTo(x + 8, y + height - inset).lineTo(x + width, y + inset).strokePath();
  }
}

function allAttacks(characterId: string) {
  const set = getCharacterAttacks(characterId);
  return [
    ...set.lightChain, ...set.heavy, set.low, set.lowHeavy, set.air, set.airHeavy,
    set.forwardLight, set.retreatLight, set.dashLight,
    set.forwardHeavy, set.retreatHeavy, set.dashHeavy,
    set.special, set.forwardSpecial, set.retreatSpecial, set.airSpecial,
    set.enhancedSpecial, set.grab, set.forwardThrow, set.backThrow,
    set.reversal, set.superAttack,
  ];
}

export function ownsAttackVisual(ownerId: PlayerId, snapshot: FighterSnapshot) {
  return snapshot.id === ownerId;
}
