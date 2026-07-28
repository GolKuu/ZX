import Phaser from 'phaser';

export function createSceneButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  action: () => void,
) {
  return scene.add
    .text(x, y, label, {
      fontFamily: 'Arial',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#30264fdd',
      padding: { x: 11, y: 8 },
    })
    .setDepth(30)
    .setInteractive({ useHandCursor: true })
    .on(Phaser.Input.Events.POINTER_DOWN, action);
}
