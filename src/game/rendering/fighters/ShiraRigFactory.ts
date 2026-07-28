import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { ProceduralRig } from '../animation/ProceduralRig';
import type { RigParts } from '../animation/RigTypes';

const OUTLINE = 0x352d55;

export function createShiraRig(scene: Phaser.Scene, character: CharacterDefinition) {
  const backLeg = ribbonTail(scene, -13, 25, character.shadowColor);
  const frontLeg = ribbonTail(scene, 13, 25, character.accentColor, true);
  const backArm = scissorWing(scene, -31, -24, character.shadowColor, 0x9feadf);
  const torso = createCore(scene, character);
  const head = createShell(scene, character);
  const frontArm = scissorWing(scene, 31, -24, character.color, character.accentColor, true);
  const root = scene.add.container(0, 0, [
    backLeg, backArm, frontLeg, torso, head, frontArm,
  ]);
  const parts: RigParts = { root, torso, head, frontArm, backArm, frontLeg, backLeg };
  return new ProceduralRig(parts, 'shira');
}

function ribbonTail(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  front = false,
) {
  const loop = scene.add
    .ellipse(0, 24, 23, 48, 0xffffff, 0)
    .setStrokeStyle(front ? 8 : 7, color, front ? 0.95 : 0.7);
  const knot = scene.add.circle(0, 2, 9, color).setStrokeStyle(4, OUTLINE, 1);
  const tip = scene.add
    .polygon(3, 56, [-8, -10, 8, -12, 14, 8, 0, 17, -11, 7], color)
    .setStrokeStyle(3, OUTLINE, 0.9);
  return scene.add.container(x, y, [loop, knot, tip]);
}

function scissorWing(
  scene: Phaser.Scene,
  x: number,
  y: number,
  shellColor: number,
  bladeColor: number,
  front = false,
) {
  const joint = scene.add.circle(0, 5, 14, 0xfffbf4).setStrokeStyle(5, OUTLINE, 1);
  const handle = scene.add
    .ellipse(0, 28, 24, 36, shellColor, 0.9)
    .setStrokeStyle(5, OUTLINE, 1);
  const inner = scene.add.ellipse(0, 28, 9, 18, 0xfffbf4);
  const bladeOne = scene.add
    .polygon(8, 51, [-7, -18, 8, -16, 24, 18, 12, 24, -5, 4], bladeColor, front ? 1 : 0.72)
    .setStrokeStyle(3, OUTLINE, 0.9);
  const bladeTwo = scene.add
    .polygon(-7, 54, [-8, -15, 6, -17, -7, 25, -21, 20, -4, 2], 0xf7fbfa, front ? 1 : 0.65)
    .setStrokeStyle(3, OUTLINE, 0.9);
  return scene.add.container(x, y, [handle, inner, bladeOne, bladeTwo, joint]);
}

function createCore(scene: Phaser.Scene, character: CharacterDefinition) {
  const aura = scene.add.ellipse(0, 3, 66, 82, character.accentColor, 0.16);
  const body = scene.add
    .polygon(0, 0, [0, -43, 31, -24, 34, 14, 15, 41, -15, 41, -34, 14, -31, -24], character.color)
    .setStrokeStyle(5, OUTLINE, 1);
  const belly = scene.add.ellipse(0, 8, 37, 48, 0xc9b9f4, 0.7);
  const pivot = scene.add.circle(0, 7, 12, 0xfffbf4).setStrokeStyle(5, OUTLINE, 1);
  const sparkle = scene.add.polygon(0, 7, [0, -7, 3, -2, 8, 0, 3, 3, 0, 8, -3, 3, -8, 0, -3, -2], character.accentColor);
  return scene.add.container(0, -10, [aura, body, belly, pivot, sparkle]);
}

function createShell(scene: Phaser.Scene, character: CharacterDefinition) {
  const leftFin = scene.add
    .polygon(-27, -2, [-3, -15, -25, -28, -17, 1, -28, 17, -2, 11], character.accentColor)
    .setStrokeStyle(4, OUTLINE, 1);
  const rightFin = scene.add
    .polygon(27, -2, [3, -15, 25, -28, 17, 1, 28, 17, 2, 11], character.accentColor)
    .setStrokeStyle(4, OUTLINE, 1);
  const shell = scene.add
    .ellipse(0, 0, 55, 43, character.color)
    .setStrokeStyle(5, OUTLINE, 1);
  const visor = scene.add.ellipse(0, -1, 36, 18, OUTLINE);
  const leftEye = scene.add.ellipse(-9, -1, 6, 8, 0xc9fff5);
  const rightEye = scene.add.ellipse(9, -1, 6, 8, 0xc9fff5);
  const glint = scene.add.circle(-11, -4, 2, 0xffffff);
  return scene.add.container(0, -64, [
    leftFin, rightFin, shell, visor, leftEye, rightEye, glint,
  ]);
}
