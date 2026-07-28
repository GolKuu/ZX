import type Phaser from 'phaser';

export function paintQuietCanopy(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillGradientStyle(0x9dc8d8, 0x9dc8d8, 0xf6dfbd, 0xf6dfbd, 1);
  graphics.fillRect(0, 0, 960, 450);
  graphics.fillStyle(0xffc966, 0.78).fillCircle(790, 92, 48);
  graphics.lineStyle(18, 0xffffff, 0.18).strokeCircle(790, 92, 67);
  cloud(graphics, 104, 92, 0.48);
  cloud(graphics, 480, 128, 0.28);
  graphics.fillStyle(0x799487, 0.7);
  graphics.fillTriangle(0, 352, 238, 180, 430, 352);
  graphics.fillTriangle(290, 352, 574, 216, 790, 352);
  graphics.fillStyle(0xa9bba3, 0.72).fillRoundedRect(0, 326, 960, 124, 40);
  for (let x = 35; x < 960; x += 88) {
    graphics.fillStyle(0xffffff, 0.12).fillCircle(x, 372 + (x % 3) * 5, 18);
  }
}

export function paintMoonNursery(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillGradientStyle(0x293a58, 0x293a58, 0x607f82, 0x607f82, 1);
  graphics.fillRect(0, 0, 960, 450);
  graphics.fillStyle(0xdffbf4, 0.72).fillCircle(180, 86, 42);
  graphics.lineStyle(3, 0x9fe8db, 0.35).strokeCircle(180, 86, 62);
  graphics.lineStyle(5, 0xa7ded3, 0.2);
  for (let x = 80; x < 960; x += 145) {
    graphics.beginPath().moveTo(x, 0).lineTo(x + 28, 114).strokePath();
    graphics.fillStyle(0x9af2dc, 0.7).fillCircle(x + 28, 122, 9);
    graphics.fillStyle(0xd8fff6, 0.22).fillCircle(x + 28, 122, 18);
  }
  graphics.fillStyle(0x3d665f, 0.72);
  for (let x = -20; x < 980; x += 90) {
    graphics.fillEllipse(x, 332, 88, 180);
    graphics.fillEllipse(x + 30, 344, 70, 126);
  }
  graphics.lineStyle(4, 0x8bdacb, 0.28)
    .strokeRoundedRect(46, 46, 868, 316, 160);
}

export function paintPaperHarbor(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillGradientStyle(0xb9d3e8, 0xb9d3e8, 0xf4d9cf, 0xf4d9cf, 1);
  graphics.fillRect(0, 0, 960, 450);
  graphics.fillStyle(0xffffff, 0.46);
  graphics.fillTriangle(110, 82, 218, 130, 146, 174);
  graphics.fillTriangle(680, 74, 812, 118, 740, 186);
  graphics.lineStyle(3, 0x4f5776, 0.22);
  graphics.beginPath().moveTo(146, 174).lineTo(138, 330).strokePath();
  graphics.beginPath().moveTo(740, 186).lineTo(756, 330).strokePath();
  graphics.fillStyle(0xff7185, 0.55);
  graphics.fillTriangle(380, 144, 518, 196, 424, 268);
  graphics.fillStyle(0x7c7ed1, 0.42);
  for (let y = 292; y < 420; y += 30) {
    graphics.fillRoundedRect(-30 + (y % 4) * 18, y, 1020, 19, 10);
  }
  graphics.fillStyle(0xffffff, 0.18);
  for (let x = 20; x < 960; x += 96) {
    graphics.fillTriangle(x, 316, x + 30, 292, x + 56, 318);
  }
}

function cloud(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  alpha: number,
) {
  graphics.fillStyle(0xffffff, alpha);
  graphics.fillCircle(x, y, 28);
  graphics.fillCircle(x + 42, y - 11, 40);
  graphics.fillCircle(x + 84, y + 3, 27);
  graphics.fillRoundedRect(x - 2, y, 91, 32, 16);
}
