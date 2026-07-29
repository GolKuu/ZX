import Phaser from 'phaser';
import type { FighterSnapshot } from '../../core/types';

export class AttackVisualRenderer {
  readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, private readonly color: number) {
    this.graphics = scene.add.graphics().setDepth(8).setVisible(false);
  }

  sync(snapshot: FighterSnapshot) {
    const attack = snapshot.attack;
    this.graphics.clear();
    if (!attack) {
      this.graphics.setVisible(false);
      return;
    }
    const moveId = attack.id.slice(snapshot.characterId.length + 1);
    const alpha = attack.phase === 'active' ? 1 : attack.phase === 'startup' ? 0.42 : 0.2;
    this.graphics.setAlpha(alpha).setScale(1 + (attack.frame % 3) * 0.04).setVisible(true);
    this.graphics.lineStyle(6, this.color, 1).fillStyle(this.color, 0.72);
    this.draw(moveId);
  }

  private draw(moveId: string) {
    switch (moveId) {
      case 'light-1': return this.graphics.fillCircle(55, -5, 13);
      case 'light-2': return this.drawSlash();
      case 'light-3': return this.drawBurst();
      case 'heavy-1': return this.graphics.fillRoundedRect(42, -18, 62, 34, 12);
      case 'heavy-2': return this.drawShockwave();
      case 'low': return this.drawLowSweep();
      case 'air': return this.graphics.fillTriangle(25, -2, 88, 28, 48, 42);
      case 'special': return this.drawSpecial();
      case 'grab': return this.drawGrab();
      case 'throw-forward': return this.drawArrow(1);
      case 'throw-back': return this.drawArrow(-1);
      case 'super': return this.drawSuper();
      default: return this.graphics.fillCircle(52, 0, 10);
    }
  }

  private drawSlash() {
    this.graphics.beginPath().moveTo(28, -34).lineTo(88, 24).strokePath();
    this.graphics.beginPath().moveTo(45, -40).lineTo(101, 12).strokePath();
  }

  private drawBurst() {
    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * index) / 4;
      this.graphics.beginPath()
        .moveTo(65 + Math.cos(angle) * 12, Math.sin(angle) * 12)
        .lineTo(65 + Math.cos(angle) * 36, Math.sin(angle) * 36)
        .strokePath();
    }
  }

  private drawShockwave() {
    this.graphics.strokeCircle(64, 0, 24).lineStyle(4, this.color, 0.7);
    this.graphics.strokeCircle(64, 0, 39).lineStyle(3, this.color, 0.45);
    this.graphics.strokeCircle(64, 0, 54);
  }

  private drawLowSweep() {
    this.graphics.fillRoundedRect(22, 20, 98, 14, 7);
    this.graphics.fillCircle(116, 27, 13);
  }

  private drawSpecial() {
    this.graphics.strokeCircle(58, 0, 18);
    this.graphics.strokeCircle(78, 0, 27);
    this.graphics.fillCircle(100, 0, 15);
  }

  private drawGrab() {
    this.graphics.strokeRoundedRect(42, -27, 58, 54, 14);
    this.graphics.fillCircle(101, -18, 7).fillCircle(101, 18, 7);
  }

  private drawArrow(direction: 1 | -1) {
    const start = direction === 1 ? 30 : 92;
    const end = direction === 1 ? 98 : 24;
    this.graphics.beginPath().moveTo(start, 0).lineTo(end, 0).strokePath();
    this.graphics.fillTriangle(end, 0, end - direction * 22, -14, end - direction * 22, 14);
  }

  private drawSuper() {
    this.graphics.fillCircle(75, 0, 34).lineStyle(5, 0xffffff, 0.85);
    this.graphics.strokeCircle(75, 0, 48);
    this.graphics.strokeCircle(75, 0, 62);
  }
}
