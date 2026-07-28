import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { ProceduralRig } from '../animation/ProceduralRig';
import type { RigParts } from '../animation/RigTypes';

export function createShiraRig(
  scene: Phaser.Scene,
  character: CharacterDefinition,
) {
  const backLeg = ribbonLeg(scene, -12, 29, character.shadowColor);
  const frontLeg = ribbonLeg(scene, 14, 29, character.color);
  const backArm = scissorArm(scene, -27, -22, character.shadowColor, character.accentColor);
  const torso = createTorso(scene, character);
  const head = createHead(scene, character);
  const frontArm = scissorArm(scene, 28, -23, character.color, character.accentColor, true);
  const root = scene.add.container(0, 0, [
    backLeg,
    backArm,
    frontLeg,
    torso,
    head,
    frontArm,
  ]);
  const parts: RigParts = { root, torso, head, frontArm, backArm, frontLeg, backLeg };
  return new ProceduralRig(parts, 'shira');
}

function ribbonLeg(scene: Phaser.Scene, x: number, y: number, color: number) {
  const shin = scene.add
    .polygon(0, 20, [-10, -22, 9, -24, 8, 18, 18, 34, -14, 34, -7, 14], color)
    .setStrokeStyle(4, 0x3f2942, 1);
  const boot = scene.add
    .polygon(7, 53, [-12, -7, 12, -7, 24, 5, 15, 13, -12, 10], 0x3f2942);
  return scene.add.container(x, y, [shin, boot]);
}

function scissorArm(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  bladeColor: number,
  front = false,
) {
  const sleeve = scene.add
    .polygon(0, 15, [-10, -18, 11, -17, 9, 24, -9, 27], color)
    .setStrokeStyle(4, 0x3f2942, 1);
  const ring = scene.add.circle(0, 37, 10, 0xfff4ed).setStrokeStyle(4, 0x3f2942, 1);
  const upperBlade = scene.add
    .polygon(13, 52, [-6, -17, 9, -14, 33, 10, 22, 15, -4, 2], bladeColor, front ? 1 : 0.72)
    .setStrokeStyle(3, 0x3f2942, 0.9);
  const lowerBlade = scene.add
    .polygon(11, 57, [-5, -4, 25, 4, 35, 16, 24, 20, -4, 7], 0xf4f6f7, front ? 1 : 0.7)
    .setStrokeStyle(3, 0x3f2942, 0.9);
  return scene.add.container(x, y, [sleeve, ring, upperBlade, lowerBlade]);
}

function createTorso(scene: Phaser.Scene, character: CharacterDefinition) {
  const body = scene.add
    .polygon(0, 0, [-24, -34, 18, -37, 29, -4, 20, 37, -19, 37, -29, -5], character.color)
    .setStrokeStyle(5, 0x3f2942, 1);
  const panel = scene.add
    .polygon(0, 4, [-12, -26, 12, -27, 17, 27, -15, 28], character.shadowColor, 0.72);
  const seam = scene.add
    .polygon(0, 0, [-3, -24, 3, -24, 5, 27, -4, 27], character.accentColor);
  return scene.add.container(0, -11, [body, panel, seam]);
}

function createHead(scene: Phaser.Scene, character: CharacterDefinition) {
  const hairBack = scene.add
    .polygon(-7, -3, [-25, -25, 5, -36, 29, -18, 34, 16, 8, 30, -26, 21], 0x3f2942);
  const face = scene.add.ellipse(0, 0, 47, 52, 0xffd8cb).setStrokeStyle(5, 0x3f2942, 1);
  const fringe = scene.add
    .polygon(-2, -17, [-23, -6, -10, -20, 4, -13, 18, -25, 24, -7, 8, 0, -6, -8], character.color);
  const ponytail = scene.add
    .polygon(-29, -10, [-8, -17, -27, -29, -19, 0, -36, 20, -7, 13], character.accentColor)
    .setStrokeStyle(4, 0x3f2942, 1);
  const leftEye = scene.add.ellipse(-9, 1, 6, 9, 0x3f2942).setRotation(-0.18);
  const rightEye = scene.add.ellipse(10, 0, 6, 9, 0x3f2942).setRotation(0.18);
  const smile = scene.add.arc(1, 9, 10, 15, 165, false, 0x3f2942)
    .setStrokeStyle(3, 0x3f2942).setFillStyle();
  return scene.add.container(0, -65, [
    ponytail, hairBack, face, fringe, leftEye, rightEye, smile,
  ]);
}
