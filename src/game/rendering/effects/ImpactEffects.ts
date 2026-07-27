import Phaser from 'phaser';

export function showImpact(scene: Phaser.Scene, x: number, y: number) {
  const flash = scene.add.circle(x, y, 12, 0xfff1a6).setDepth(10);
  scene.tweens.add({
    targets: flash,
    scale: 3,
    alpha: 0,
    duration: 140,
    onComplete: () => flash.destroy(),
  });
}
