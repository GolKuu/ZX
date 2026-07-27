import Phaser from 'phaser';

export function popIn(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject) {
  scene.tweens.add({
    targets: target,
    scale: { from: 0.8, to: 1 },
    duration: 180,
    ease: 'Back.Out',
  });
}
