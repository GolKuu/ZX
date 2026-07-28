import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';

export function drawVictoryForceEffect(
  graphics: Phaser.GameObjects.Graphics,
  character: CharacterDefinition,
  x: number,
  y: number,
  elapsedMs: number,
) {
  const progress = Math.min(1, elapsedMs / 900);
  const pulse = 0.5 + Math.sin(elapsedMs / 150) * 0.18;
  const color = character.accentColor;
  graphics.fillStyle(color, 0.16 + pulse * 0.12).lineStyle(5, color, 0.72);
  switch (character.id) {
    case 'granite':
      for (let index = -2; index <= 2; index += 1) {
        const height = (54 + Math.abs(index) * 17) * progress;
        graphics.fillTriangle(x + index * 42 - 16, y, x + index * 42, y - height, x + index * 42 + 17, y);
      }
      break;
    case 'caliber':
      for (let index = -2; index <= 2; index += 1) {
        graphics.strokeCircle(x + index * 58, y - 72, 10 + progress * 14);
        graphics.beginPath().moveTo(x + index * 58 - 42, y - 72)
          .lineTo(x + index * 58 + 42, y - 72).strokePath();
      }
      break;
    case 'volt':
      graphics.beginPath().moveTo(x - 105, y - 155).lineTo(x - 35, y - 95)
        .lineTo(x - 67, y - 42).lineTo(x + 14, y - 112)
        .lineTo(x - 2, y - 38).lineTo(x + 108, y - 135).strokePath();
      break;
    case 'nocturne':
      graphics.strokeCircle(x, y - 82, 76 * progress).strokeCircle(x, y - 82, 48 * progress)
        .strokeTriangle(x, y - 152, x + 72, y - 38, x - 72, y - 38);
      break;
    case 'ragnar':
      graphics.fillTriangle(x - 12, y - 76, x - 142 * progress, y - 154, x - 86, y - 32)
        .fillTriangle(x + 12, y - 76, x + 142 * progress, y - 154, x + 86, y - 32);
      break;
    case 'marina':
      for (let index = 0; index < 4; index += 1) {
        graphics.beginPath().arc(x, y - 25 - index * 27, 42 + index * 18, 3.25, 6.15).strokePath();
      }
      break;
    case 'zephyr':
      for (let index = 0; index < 4; index += 1) {
        graphics.beginPath().arc(x, y - 82, 35 + index * 25 * progress, -2.2 + index, 2.6 + index).strokePath();
      }
      break;
    case 'origami':
      for (let index = 0; index < 7; index += 1) {
        const angle = (Math.PI * 2 * index) / 7 + elapsedMs / 1_600;
        const px = x + Math.cos(angle) * 105 * progress;
        const py = y - 82 + Math.sin(angle) * 68 * progress;
        graphics.fillTriangle(px, py - 13, px + 18, py + 9, px - 15, py + 5);
      }
      break;
    case 'poro':
      for (let index = 0; index < 9; index += 1) {
        const px = x - 100 + (index % 5) * 48;
        const py = y - 28 - (index * 31 + elapsedMs / 18) % 145;
        graphics.strokeCircle(px, py, 8 + (index % 3) * 5);
      }
      break;
    case 'fenr':
      graphics.fillCircle(x + 74, y - 150, 41 * progress);
      [-1, 0, 1].forEach((offset) => graphics.beginPath()
        .moveTo(x - 100, y - 150 + offset * 35)
        .lineTo(x + 92, y - 85 + offset * 35).strokePath());
      break;
    case 'sylvan':
      graphics.beginPath().moveTo(x, y).lineTo(x, y - 167)
        .moveTo(x, y - 120).lineTo(x - 96, y - 174)
        .moveTo(x, y - 99).lineTo(x + 98, y - 154).strokePath();
      [-1, 1].forEach((side) => graphics.fillCircle(x + side * 87, y - 163, 25 * progress));
      break;
    case 'adamant':
      for (let index = 0; index < 10; index += 1) {
        const angle = (Math.PI * 2 * index) / 10;
        graphics.beginPath().moveTo(x + Math.cos(angle) * 42, y - 88 + Math.sin(angle) * 42)
          .lineTo(x + Math.cos(angle) * 126 * progress, y - 88 + Math.sin(angle) * 126 * progress)
          .strokePath();
      }
      break;
    case 'vassa':
      graphics.beginPath().moveTo(x - 105, y - 135).lineTo(x - 54, y - 74)
        .lineTo(x - 10, y - 142).lineTo(x + 45, y - 69)
        .lineTo(x + 106, y - 132).strokePath();
      break;
    case 'shira':
      graphics.beginPath().moveTo(x - 120, y - 165).lineTo(x + 120, y - 25)
        .moveTo(x + 120, y - 165).lineTo(x - 120, y - 25).strokePath();
      break;
    case 'pyron':
      for (let index = -3; index <= 3; index += 1) {
        const flameHeight = (70 + (index % 2 === 0 ? 55 : 22)) * progress;
        graphics.fillTriangle(x + index * 34 - 23, y, x + index * 34, y - flameHeight, x + index * 34 + 24, y);
      }
  }
}
