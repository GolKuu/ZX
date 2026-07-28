import Phaser from 'phaser';
import { balanceConfig } from '../../config/balanceConfig';

export function createArena(scene: Phaser.Scene) {
  const graphics = scene.add.graphics();
  graphics.fillGradientStyle(0x8ea6c7, 0x8ea6c7, 0xe9d7bd, 0xe9d7bd, 1);
  graphics.fillRect(0, 0, balanceConfig.arenaWidth, balanceConfig.arenaHeight);
  graphics.fillStyle(0xffd587, 0.88).fillCircle(785, 100, 57);
  graphics.fillStyle(0xfff1c2, 0.36).fillCircle(785, 100, 78);

  drawCloud(graphics, 150, 96, 0.58);
  drawCloud(graphics, 520, 138, 0.35);
  graphics.fillGradientStyle(0x84907e, 0x84907e, 0x657067, 0x657067, 1);
  graphics.fillTriangle(0, 360, 250, 170, 445, 360);
  graphics.fillTriangle(260, 360, 570, 215, 790, 360);
  graphics.fillTriangle(610, 360, 860, 185, 960, 300);
  graphics.fillStyle(0xaeb5a1, 0.75).fillRect(0, 338, balanceConfig.arenaWidth, 112);
  graphics.fillGradientStyle(0x596273, 0x596273, 0x343c4a, 0x343c4a, 1);
  graphics.fillRect(0, balanceConfig.groundY, balanceConfig.arenaWidth, 90);
  graphics.fillStyle(0xe9a84a).fillRect(0, balanceConfig.groundY, balanceConfig.arenaWidth, 7);

  for (let x = 24; x < balanceConfig.arenaWidth; x += 72) {
    graphics.fillStyle(0xffffff, 0.08).fillCircle(x, 382 + (x % 4) * 6, 18);
  }
  return graphics;
}

function drawCloud(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  alpha: number,
) {
  graphics.fillStyle(0xffffff, alpha);
  graphics.fillCircle(x, y, 30);
  graphics.fillCircle(x + 42, y - 12, 43);
  graphics.fillCircle(x + 88, y + 3, 29);
  graphics.fillRoundedRect(x - 4, y, 98, 34, 16);
}
