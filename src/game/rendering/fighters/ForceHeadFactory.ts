import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';

export function createForceHead(scene: Phaser.Scene, character: CharacterDefinition) {
  const outline = character.shadowColor;
  const pieces: Phaser.GameObjects.GameObject[] = [];
  if (character.id === 'caliber') {
    pieces.push(
      scene.add.rectangle(0, 0, 66, 45, character.color).setStrokeStyle(5, outline),
      scene.add.rectangle(24, -25, 24, 11, character.accentColor).setStrokeStyle(3, outline),
    );
  } else if (character.id === 'volt') {
    pieces.push(scene.add
      .polygon(0, 0, [0, -35, 30, -11, 21, 28, 0, 20, -22, 28, -31, -11], character.color)
      .setStrokeStyle(5, outline));
  } else if (character.id === 'nocturne') {
    pieces.push(
      scene.add.polygon(0, 1, [-28, -19, -13, -31, 14, -31, 29, -18, 25, 24, -24, 24], character.color)
        .setStrokeStyle(5, outline),
      horn(scene, -24, -24, -1, character.accentColor, outline),
      horn(scene, 24, -24, 1, character.accentColor, outline),
    );
  } else if (character.id === 'ragnar') {
    pieces.push(
      scene.add.polygon(0, 3, [-34, -15, -18, -31, 19, -29, 36, -8, 27, 25, -24, 25], character.color)
        .setStrokeStyle(5, outline),
      horn(scene, -20, -29, -1, 0xf5dfb0, outline),
      horn(scene, 20, -29, 1, 0xf5dfb0, outline),
      scene.add.polygon(31, 8, [0, -9, 25, 0, 1, 10], character.accentColor).setStrokeStyle(3, outline),
    );
  } else if (character.id === 'marina') {
    pieces.push(
      scene.add.polygon(0, 0, [0, -37, 29, 2, 20, 28, -20, 28, -29, 2], character.color)
        .setStrokeStyle(5, outline),
      scene.add.ellipse(0, 4, 46, 31, character.accentColor, 0.28),
    );
  } else if (character.id === 'zephyr') {
    pieces.push(
      scene.add.circle(-18, 3, 23, character.color).setStrokeStyle(4, outline),
      scene.add.circle(8, -5, 29, character.color).setStrokeStyle(4, outline),
      scene.add.circle(29, 6, 19, character.color).setStrokeStyle(4, outline),
    );
  } else if (character.id === 'origami') {
    pieces.push(
      scene.add.polygon(0, 0, [0, -36, 35, -2, 17, 29, 0, 17, -18, 29, -35, -2], character.color)
        .setStrokeStyle(5, outline),
      scene.add.polygon(0, 1, [0, -25, 18, 18, 0, 9, -18, 18], character.accentColor, 0.45),
    );
  } else if (character.id === 'poro') {
    pieces.push(
      scene.add.ellipse(0, 0, 68, 55, character.color).setStrokeStyle(5, outline),
      scene.add.circle(-23, -14, 5, outline, 0.32),
      scene.add.circle(24, 9, 7, outline, 0.28),
    );
  } else if (character.id === 'fenr') {
    pieces.push(
      scene.add.polygon(0, 2, [-31, -16, -25, -36, -8, -25, 9, -25, 26, -36, 31, -13, 22, 25, -22, 25], character.color)
        .setStrokeStyle(5, outline),
      scene.add.polygon(27, 8, [-2, -10, 22, 0, -2, 11], character.accentColor).setStrokeStyle(3, outline),
    );
  } else if (character.id === 'sylvan') {
    pieces.push(
      scene.add.polygon(0, 2, [-29, -24, -14, -32, 18, -31, 30, -18, 25, 27, -25, 27], character.color)
        .setStrokeStyle(5, outline),
      branchCrown(scene, character.accentColor, outline),
    );
  } else if (character.id === 'vassa') {
    pieces.push(
      scene.add.polygon(0, 0, [-37, -19, -15, -29, 15, -29, 37, -19, 24, 29, -24, 29], character.color)
        .setStrokeStyle(5, outline),
      scene.add.triangle(0, 27, -6, -5, 6, -5, 0, 14, 0xf0a4b2),
    );
  } else if (character.id === 'pyron') {
    pieces.push(
      scene.add.polygon(0, 4, [0, -42, 11, -25, 25, -34, 33, -7, 24, 27, -24, 27, -33, -7, -17, -28], character.color)
        .setStrokeStyle(5, outline),
      scene.add.polygon(0, -4, [0, -27, 11, -9, 2, 19, -11, 7], character.accentColor, 0.7),
    );
  } else {
    pieces.push(scene.add
      .polygon(0, 0, [-29, -23, 29, -23, 31, 20, 0, 30, -31, 20], character.color)
      .setStrokeStyle(5, outline));
  }
  pieces.push(...createFace(scene, character));
  return scene.add.container(0, -61, pieces);
}

function createFace(scene: Phaser.Scene, character: CharacterDefinition) {
  const visor = scene.add.ellipse(0, 2, 43, 20, character.shadowColor, 0.92);
  const leftEye = scene.add.ellipse(-10, 1, 6, 8, character.accentColor);
  const rightEye = scene.add.ellipse(10, 1, 6, 8, character.accentColor);
  const glint = scene.add.circle(-12, -2, 2, 0xffffff);
  return [visor, leftEye, rightEye, glint];
}

function horn(
  scene: Phaser.Scene,
  x: number,
  y: number,
  direction: -1 | 1,
  color: number,
  outline: number,
) {
  return scene.add.triangle(x, y, 0, 9, direction * 19, -18, direction * 13, 13, color)
    .setStrokeStyle(3, outline);
}

function branchCrown(scene: Phaser.Scene, color: number, outline: number) {
  return scene.add
    .polygon(0, -27, [-24, 13, -32, -12, -16, 2, -12, -25, 0, -4, 13, -27, 16, 1, 33, -13, 24, 14], color)
    .setStrokeStyle(4, outline);
}
