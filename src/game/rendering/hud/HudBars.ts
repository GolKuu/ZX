import Phaser from 'phaser';
import type { FighterSnapshot, SimulationSnapshot } from '../../core/types';

const BAR_WIDTH = 330;

export function drawFighterBars(
  graphics: Phaser.GameObjects.Graphics,
  fighter: FighterSnapshot,
  x: number,
  healthColor: number,
  passiveColor: number,
  mirrored = false,
) {
  drawBar(graphics, x, 26, BAR_WIDTH, 24, fighter.health / fighter.maxHealth, healthColor, mirrored);
  drawBar(graphics, x, 56, BAR_WIDTH, 10, fighter.energy / fighter.maxEnergy, 0xffdc62, mirrored);
  drawBar(
    graphics,
    x,
    72,
    BAR_WIDTH,
    8,
    fighter.blockMeter / fighter.maxBlockMeter,
    0x9f8cff,
    mirrored,
  );
  drawBar(
    graphics,
    x,
    84,
    BAR_WIDTH,
    7,
    fighter.passiveValue / fighter.maxPassiveValue,
    passiveColor,
    mirrored,
  );
  drawDefenseSegments(graphics, fighter, x, mirrored);
}

function drawDefenseSegments(
  graphics: Phaser.GameObjects.Graphics,
  fighter: FighterSnapshot,
  x: number,
  mirrored: boolean,
) {
  for (let index = 0; index < fighter.defense.maxSegments; index += 1) {
    const offset = index * 18;
    const segmentX = mirrored ? x + BAR_WIDTH - 11 - offset : x + 11 + offset;
    const filled = index < fighter.defense.segments;
    graphics
      .fillStyle(filled ? 0x7557ff : 0xffffff, filled ? 1 : 0.42)
      .fillCircle(segmentX, 99, 6)
      .lineStyle(2, 0x30264f, 0.7)
      .strokeCircle(segmentX, 99, 6);
  }
}

export function drawRoundWins(
  graphics: Phaser.GameObjects.Graphics,
  snapshot: SimulationSnapshot,
) {
  [0, 1].forEach((index) => {
    graphics
      .fillStyle(index < snapshot.wins.player1 ? 0xffdc62 : 0xffffff, 0.95)
      .fillCircle(352 - index * 20, 96, 6);
    graphics
      .fillStyle(index < snapshot.wins.player2 ? 0xffdc62 : 0xffffff, 0.95)
      .fillCircle(608 + index * 20, 96, 6);
  });
}

function drawBar(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  ratio: number,
  color: number,
  mirrored: boolean,
) {
  const safeRatio = Math.min(1, Math.max(0, ratio));
  const fillWidth = (width - 6) * safeRatio;
  graphics.fillStyle(0x241d3d, 0.7).fillRoundedRect(x, y, width, height, height / 2);
  graphics.fillStyle(color);
  const fillX = mirrored ? x + width - 3 - fillWidth : x + 3;
  graphics.fillRoundedRect(fillX, y + 3, fillWidth, height - 6, (height - 6) / 2);
}

export function createSuperIndicator(
  scene: Phaser.Scene,
  x: number,
  originX: number,
) {
  return scene.add
    .text(x, 100, 'SUPER READY', {
      fontFamily: 'Arial',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#8b5b00',
      backgroundColor: '#ffdc62dd',
      padding: { x: 6, y: 3 },
    })
    .setOrigin(originX, 0)
    .setDepth(22)
    .setVisible(false);
}
