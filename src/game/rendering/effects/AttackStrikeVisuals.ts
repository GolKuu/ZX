import type Phaser from 'phaser';

export function drawStrikeVisual(
  graphics: Phaser.GameObjects.Graphics,
  color: number,
  moveId: string,
) {
  switch (moveId) {
    case 'light-1': graphics.fillCircle(55, -5, 13); break;
    case 'light-2': drawSlash(graphics); break;
    case 'light-3': drawBurst(graphics); break;
    case 'light-4': drawFinisher(graphics); break;
    case 'light-forward': drawArrow(graphics, 1); break;
    case 'light-retreat': drawRetreat(graphics); break;
    case 'light-dash': drawSpeedLines(graphics); break;
    case 'heavy-1': graphics.fillRoundedRect(42, -18, 62, 34, 12); break;
    case 'heavy-2': drawShockwave(graphics, color); break;
    case 'heavy-3': drawHeavyFinisher(graphics); break;
    case 'heavy-forward': graphics.fillTriangle(28, -30, 124, 0, 28, 30); break;
    case 'heavy-retreat': drawRetreat(graphics, true); break;
    case 'heavy-air': drawAirHeavy(graphics); break;
    case 'heavy-dash': drawDashHeavy(graphics); break;
    case 'low': drawLowSweep(graphics); break;
    case 'air': graphics.fillTriangle(25, -2, 88, 28, 48, 42); break;
    default: return false;
  }
  return true;
}

function drawSlash(graphics: Phaser.GameObjects.Graphics) {
  graphics.beginPath().moveTo(28, -34).lineTo(88, 24).strokePath();
  graphics.beginPath().moveTo(45, -40).lineTo(101, 12).strokePath();
}

function drawBurst(graphics: Phaser.GameObjects.Graphics) {
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * index) / 4;
    graphics.beginPath()
      .moveTo(65 + Math.cos(angle) * 12, Math.sin(angle) * 12)
      .lineTo(65 + Math.cos(angle) * 36, Math.sin(angle) * 36)
      .strokePath();
  }
}

function drawFinisher(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillCircle(70, 0, 24);
  graphics.lineStyle(5, 0xffffff, 0.9).strokeCircle(70, 0, 34);
}

function drawArrow(graphics: Phaser.GameObjects.Graphics, direction: 1 | -1) {
  const start = direction === 1 ? 30 : 92;
  const end = direction === 1 ? 98 : 24;
  graphics.beginPath().moveTo(start, 0).lineTo(end, 0).strokePath();
  graphics.fillTriangle(end, 0, end - direction * 22, -14, end - direction * 22, 14);
}

function drawRetreat(graphics: Phaser.GameObjects.Graphics, heavy = false) {
  const size = heavy ? 30 : 20;
  graphics.fillTriangle(30, 0, 72, -size, 72, size);
  graphics.beginPath().moveTo(24, -size).lineTo(4, -size).strokePath();
}

function drawSpeedLines(graphics: Phaser.GameObjects.Graphics) {
  [0, 14, 28].forEach((offset) => {
    graphics.beginPath().moveTo(20, -20 + offset).lineTo(112, -20 + offset).strokePath();
  });
}

function drawShockwave(graphics: Phaser.GameObjects.Graphics, color: number) {
  graphics.strokeCircle(64, 0, 24).lineStyle(4, color, 0.7);
  graphics.strokeCircle(64, 0, 39).lineStyle(3, color, 0.45);
  graphics.strokeCircle(64, 0, 54);
}

function drawHeavyFinisher(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillRoundedRect(34, -28, 82, 56, 18);
  graphics.lineStyle(5, 0xffffff, 0.85).strokeRoundedRect(28, -34, 94, 68, 22);
}

function drawAirHeavy(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillTriangle(28, -32, 102, 32, 46, 44);
  graphics.strokeCircle(82, 24, 24);
}

function drawDashHeavy(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillRoundedRect(20, -26, 120, 52, 20);
  graphics.lineStyle(4, 0xffffff, 0.75).strokeRoundedRect(34, -34, 112, 68, 24);
}

function drawLowSweep(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillRoundedRect(22, 20, 98, 14, 7);
  graphics.fillCircle(116, 27, 13);
}
