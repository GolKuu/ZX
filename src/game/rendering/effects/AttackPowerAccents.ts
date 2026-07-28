import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';

export function drawPowerAccent(
  graphics: Phaser.GameObjects.Graphics,
  character: CharacterDefinition,
  x: number,
  y: number,
  width: number,
  height: number,
  frame: number,
) {
  const color = character.accentColor;
  const centerX = x + width * 0.56;
  const centerY = y + height * 0.5;
  const pulse = 1 + (frame % 4) * 0.08;
  graphics.lineStyle(3, 0xffffff, 0.72).fillStyle(color, 0.32);
  switch (character.id) {
    case 'granite':
      graphics.fillTriangle(x, y + height, centerX, y, x + width, y + height);
      break;
    case 'caliber':
      graphics.strokeCircle(centerX, centerY, 8 * pulse)
        .strokeCircle(centerX, centerY, 15 * pulse)
        .beginPath().moveTo(x, centerY).lineTo(x + width, centerY).strokePath();
      break;
    case 'volt':
      graphics.beginPath().moveTo(x, y + height).lineTo(centerX - 9, centerY)
        .lineTo(centerX + 4, centerY - 13).lineTo(centerX + 1, centerY + 10)
        .lineTo(x + width, y).strokePath();
      break;
    case 'nocturne':
      graphics.strokeCircle(centerX, centerY, Math.min(width, height) * 0.4)
        .strokeTriangle(centerX, y, x + width, y + height, x, y + height);
      break;
    case 'ragnar':
      graphics.fillTriangle(x, y + height, centerX - 8, y, centerX, y + height)
        .fillTriangle(centerX - 4, y + height, centerX + 14, y + 5, x + width, y + height);
      break;
    case 'marina':
      graphics.beginPath().arc(centerX, centerY, width * 0.32, 3.2, 6.1).strokePath()
        .beginPath().arc(centerX, centerY + 8, width * 0.22, 3.2, 6.1).strokePath();
      break;
    case 'zephyr':
      graphics.beginPath().arc(centerX, centerY, width * 0.36, -2.2, 1.9).strokePath()
        .beginPath().arc(centerX, centerY, width * 0.2, 0.4, 4.6).strokePath();
      break;
    case 'origami':
      graphics.fillTriangle(x, centerY, centerX, y, centerX - 4, centerY)
        .fillTriangle(centerX, centerY, x + width, centerY - 10, centerX, y + height);
      break;
    case 'poro':
      graphics.strokeCircle(centerX - 16, centerY, 9 * pulse)
        .strokeCircle(centerX + 10, centerY - 9, 6 * pulse)
        .strokeCircle(centerX + 21, centerY + 10, 4 * pulse);
      break;
    case 'fenr':
      [-1, 0, 1].forEach((offset) => graphics.beginPath()
        .moveTo(x, centerY + offset * 10)
        .lineTo(x + width, centerY - 13 + offset * 10).strokePath());
      break;
    case 'sylvan':
      for (let index = 0; index < 4; index += 1) {
        const spikeX = x + (index + 0.5) * width / 4;
        graphics.fillTriangle(spikeX - 9, y + height, spikeX, y, spikeX + 9, y + height);
      }
      break;
    case 'adamant':
      graphics.beginPath().moveTo(centerX, y).lineTo(centerX, y + height)
        .moveTo(x, centerY).lineTo(x + width, centerY)
        .moveTo(x + 8, y + 7).lineTo(x + width - 8, y + height - 7)
        .moveTo(x + width - 8, y + 7).lineTo(x + 8, y + height - 7).strokePath();
      break;
    case 'vassa':
      graphics.beginPath().moveTo(x, y).lineTo(centerX - 9, centerY)
        .lineTo(centerX + 9, y).lineTo(x + width, y + height).strokePath();
      break;
    case 'shira':
      graphics.beginPath().moveTo(x, y).lineTo(x + width, y + height)
        .moveTo(x + width, y).lineTo(x, y + height).strokePath();
      break;
    case 'pyron':
      graphics.fillTriangle(x, y + height, centerX - 14, y, centerX, y + height)
        .fillTriangle(centerX - 5, y + height, centerX + 17, y + 8, x + width, y + height);
      break;
  }
}
