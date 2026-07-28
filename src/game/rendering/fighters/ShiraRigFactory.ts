import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { ProceduralRig } from '../animation/ProceduralRig';
import type { RigParts } from '../animation/RigTypes';

const OUTLINE = 0x352d55;

export function createShiraRig(scene: Phaser.Scene, character: CharacterDefinition) {
  const backLeg = ribbonTail(scene, -13, 25, -1, character.shadowColor);
  const frontLeg = ribbonTail(scene, 13, 25, 1, character.accentColor, true);
  const backArm = scissorWing(scene, -31, -13, -1, character.shadowColor, 0x9feadf);
  const torso = createCore(scene, character);
  const head = createShell(scene, character);
  const frontArm = scissorWing(scene, 31, -13, 1, character.color, character.accentColor, true);
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
  direction: -1 | 1,
  color: number,
  front = false,
) {
  const knot = scene.add.circle(0, 0, 8, color).setStrokeStyle(4, OUTLINE, 1);
  const ribbon = scene.add
    .polygon(0, 27, mirror([-7, -21, 7, -20, 14, 13, 4, 36, -12, 27], direction), color, front ? 1 : 0.75)
    .setStrokeStyle(4, OUTLINE, 1);
  const tip = scene.add
    .polygon(direction * 5, 58, mirror([-11, -8, 9, -11, 15, 7, 2, 16, -13, 8], direction), color)
    .setStrokeStyle(3, OUTLINE, 0.9);
  return scene.add.container(x, y, [ribbon, tip, knot]);
}

function scissorWing(
  scene: Phaser.Scene,
  x: number,
  y: number,
  direction: -1 | 1,
  shellColor: number,
  bladeColor: number,
  front = false,
) {
  const bladeOne = scene.add
    .polygon(0, 0, mirror([8, -8, 24, -14, 66, -12, 75, -3, 26, 1, 10, 4], direction), bladeColor, front ? 1 : 0.68)
    .setStrokeStyle(4, OUTLINE, 1);
  const bladeTwo = scene.add
    .polygon(0, 0, mirror([8, 7, 24, 1, 65, 7, 73, 16, 25, 13, 10, 11], direction), 0xf2f7f4, front ? 1 : 0.62)
    .setStrokeStyle(4, OUTLINE, 1);
  const handle = scene.add
    .ellipse(0, 0, 25, 29, shellColor, front ? 1 : 0.8)
    .setStrokeStyle(5, OUTLINE, 1);
  const inner = scene.add.ellipse(0, 0, 10, 13, OUTLINE, 0.9);
  const pin = scene.add.circle(direction * 9, 0, 4, 0xd9fff8);
  return scene.add.container(x, y, [bladeOne, bladeTwo, handle, inner, pin]);
}

function createCore(scene: Phaser.Scene, character: CharacterDefinition) {
  const aura = scene.add.ellipse(0, 2, 65, 79, character.accentColor, 0.12);
  const body = scene.add
    .polygon(0, 0, [0, -42, 30, -25, 33, 14, 14, 40, -14, 40, -33, 14, -30, -25], character.color)
    .setStrokeStyle(5, OUTLINE, 1);
  const breastplate = scene.add
    .polygon(0, 9, [-19, -18, 19, -18, 14, 22, 0, 31, -14, 22], 0xc9b9f4, 0.72);
  const pivot = scene.add.circle(0, 4, 7, character.accentColor).setStrokeStyle(3, OUTLINE, 1);
  const glint = scene.add.circle(-2, 2, 2, 0xffffff);
  return scene.add.container(0, -10, [aura, body, breastplate, pivot, glint]);
}

function createShell(scene: Phaser.Scene, character: CharacterDefinition) {
  const leftFin = scene.add
    .polygon(-27, -2, [-3, -15, -25, -28, -17, 1, -28, 17, -2, 11], character.accentColor)
    .setStrokeStyle(4, OUTLINE, 1);
  const rightFin = scene.add
    .polygon(27, -2, [3, -15, 25, -28, 17, 1, 28, 17, 2, 11], character.accentColor)
    .setStrokeStyle(4, OUTLINE, 1);
  const shell = scene.add.ellipse(0, 0, 55, 43, character.color)
    .setStrokeStyle(5, OUTLINE, 1);
  const visor = scene.add.ellipse(0, -1, 36, 18, OUTLINE);
  const leftEye = scene.add.ellipse(-9, -1, 6, 8, 0xc9fff5);
  const rightEye = scene.add.ellipse(9, -1, 6, 8, 0xc9fff5);
  const glint = scene.add.circle(-11, -4, 2, 0xffffff);
  return scene.add.container(0, -61, [
    leftFin, rightFin, shell, visor, leftEye, rightEye, glint,
  ]);
}

function mirror(points: number[], direction: -1 | 1) {
  return points.map((point, index) => index % 2 === 0 ? point * direction : point);
}
