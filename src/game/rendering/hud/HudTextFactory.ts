import type Phaser from 'phaser';

export function makeHudText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  fontSize: string,
) {
  return scene.add
    .text(x, y, value, {
      fontFamily: 'Arial',
      fontSize,
      fontStyle: 'bold',
      color: '#30264f',
    })
    .setOrigin(0.5, 0)
    .setDepth(21);
}

export function makeComboText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  originX: number,
) {
  return scene.add
    .text(x, y, '', {
      fontFamily: 'Arial',
      fontSize: '22px',
      fontStyle: 'bold',
      align: originX === 0 ? 'left' : 'right',
      color: '#ffffff',
      stroke: '#30264f',
      strokeThickness: 5,
    })
    .setOrigin(originX, 0)
    .setDepth(21)
    .setVisible(false);
}

export function makeGaugeLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  originX: number,
) {
  return scene.add
    .text(x, y, value, {
      fontFamily: 'Arial',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#30264f',
    })
    .setOrigin(originX, 0)
    .setDepth(22);
}

export function makeFighterName(
  scene: Phaser.Scene,
  x: number,
  value: string,
  originX: number,
) {
  return scene.add
    .text(x, 5, value.toUpperCase(), {
      fontFamily: 'Arial',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#30264f',
    })
    .setOrigin(originX, 0)
    .setDepth(22);
}
