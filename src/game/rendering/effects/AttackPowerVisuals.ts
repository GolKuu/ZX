import type Phaser from 'phaser';

export function drawPowerVisual(
  graphics: Phaser.GameObjects.Graphics,
  color: number,
  moveId: string,
) {
  switch (moveId) {
    case 'special': drawSpecial(graphics); break;
    case 'special-forward': drawSpecialForward(graphics); break;
    case 'special-retreat': drawSpecialRetreat(graphics); break;
    case 'special-air': drawAirSpecial(graphics); break;
    case 'grab': drawGrab(graphics); break;
    case 'throw-forward': drawArrow(graphics, 1); break;
    case 'throw-back': drawArrow(graphics, -1); break;
    case 'super': drawSuper(graphics); break;
    case 'reversal': drawReversal(graphics, color); break;
    default: graphics.fillCircle(52, 0, 10);
  }
}

function drawSpecial(graphics: Phaser.GameObjects.Graphics) {
  graphics.strokeCircle(58, 0, 18);
  graphics.strokeCircle(78, 0, 27);
  graphics.fillCircle(100, 0, 15);
}

function drawSpecialForward(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillCircle(108, 0, 20);
  graphics.strokeCircle(72, 0, 28);
  graphics.beginPath().moveTo(24, 0).lineTo(136, 0).strokePath();
}

function drawSpecialRetreat(graphics: Phaser.GameObjects.Graphics) {
  graphics.strokeCircle(46, 0, 32);
  graphics.fillTriangle(24, 0, 82, -26, 82, 26);
}

function drawAirSpecial(graphics: Phaser.GameObjects.Graphics) {
  graphics.strokeCircle(72, 12, 38);
  graphics.fillTriangle(36, -18, 118, 10, 58, 48);
}

function drawGrab(graphics: Phaser.GameObjects.Graphics) {
  graphics.strokeRoundedRect(42, -27, 58, 54, 14);
  graphics.fillCircle(101, -18, 7).fillCircle(101, 18, 7);
}

function drawArrow(graphics: Phaser.GameObjects.Graphics, direction: 1 | -1) {
  const start = direction === 1 ? 30 : 92;
  const end = direction === 1 ? 98 : 24;
  graphics.beginPath().moveTo(start, 0).lineTo(end, 0).strokePath();
  graphics.fillTriangle(end, 0, end - direction * 22, -14, end - direction * 22, 14);
}

function drawSuper(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillCircle(75, 0, 34).lineStyle(5, 0xffffff, 0.85);
  graphics.strokeCircle(75, 0, 48);
  graphics.strokeCircle(75, 0, 62);
}

function drawReversal(graphics: Phaser.GameObjects.Graphics, color: number) {
  graphics.strokeCircle(52, 0, 34).lineStyle(4, color, 0.7);
  graphics.beginPath().arc(52, 0, 48, 0.3, 5.4).strokePath();
  graphics.fillTriangle(96, -28, 116, -12, 90, -6);
}
