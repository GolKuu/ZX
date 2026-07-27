import Phaser from 'phaser';
import { balanceConfig } from '../../config/balanceConfig';

export function createArena(scene: Phaser.Scene) {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x8bd8ff).fillRect(0, 0, balanceConfig.arenaWidth, balanceConfig.arenaHeight);
  graphics.fillStyle(0xfff2a8).fillCircle(790, 100, 58);

  graphics.fillStyle(0xffffff, 0.75);
  graphics.fillCircle(170, 112, 36);
  graphics.fillCircle(215, 98, 52);
  graphics.fillCircle(270, 115, 34);

  graphics.fillStyle(0xb69cff).fillRect(0, 320, balanceConfig.arenaWidth, 130);
  graphics.fillStyle(0x7457d9).fillRect(0, balanceConfig.groundY, balanceConfig.arenaWidth, 90);
  graphics.fillStyle(0xffdc62).fillRect(0, balanceConfig.groundY, balanceConfig.arenaWidth, 12);

  for (let x = 40; x < balanceConfig.arenaWidth; x += 90) {
    graphics.fillStyle(0xffffff, 0.12).fillCircle(x, 382 + (x % 3) * 8, 22);
  }

  return graphics;
}
