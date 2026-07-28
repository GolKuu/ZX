import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { ProceduralRig } from '../animation/ProceduralRig';
import type { RigParts } from '../animation/RigTypes';

const OUTLINE = 0x252b38;

export function createGraniteRig(scene: Phaser.Scene, character: CharacterDefinition) {
  const backLeg = stoneLeg(scene, -18, 25, character.shadowColor);
  const frontLeg = stoneLeg(scene, 18, 25, character.color, true);
  const backArm = stoneArm(scene, -41, -24, character.shadowColor);
  const torso = createTorso(scene, character);
  const head = createHead(scene, character);
  const frontArm = stoneArm(scene, 41, -24, character.color, true);
  const root = scene.add.container(0, 0, [
    backLeg, backArm, frontLeg, torso, head, frontArm,
  ]);
  const parts: RigParts = { root, torso, head, frontArm, backArm, frontLeg, backLeg };
  return new ProceduralRig(parts, 'granite');
}

function stoneArm(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  front = false,
) {
  const shoulder = scene.add.circle(0, 5, 15, color).setStrokeStyle(4, OUTLINE, 1);
  const upper = scene.add
    .polygon(0, 22, [-13, -13, 12, -11, 15, 13, -11, 16], color)
    .setStrokeStyle(4, OUTLINE, 1);
  const elbow = scene.add.circle(1, 39, 11, 0x778190).setStrokeStyle(4, OUTLINE, 1);
  const forearm = scene.add
    .polygon(2, 54, [-11, -12, 13, -11, 15, 15, -10, 16], color)
    .setStrokeStyle(4, OUTLINE, 1);
  const fist = scene.add
    .polygon(4, 75, [-17, -11, 15, -13, 21, 7, 5, 19, -18, 9], color)
    .setStrokeStyle(4, OUTLINE, 1);
  const shine = scene.add
    .polygon(-4, 51, [-4, -8, 5, -7, 6, 7, -5, 9], 0xb4bec9, front ? 0.5 : 0.22);
  return scene.add.container(x, y, [shoulder, upper, elbow, forearm, fist, shine]);
}

function stoneLeg(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  front = false,
) {
  const hip = scene.add.circle(0, 2, 14, color).setStrokeStyle(4, OUTLINE, 1);
  const thigh = scene.add
    .polygon(0, 20, [-13, -12, 13, -11, 14, 14, -12, 16], color)
    .setStrokeStyle(4, OUTLINE, 1);
  const knee = scene.add.circle(1, 39, 11, 0x6f7988).setStrokeStyle(4, OUTLINE, 1);
  const shin = scene.add
    .polygon(1, 55, [-11, -11, 12, -12, 15, 14, -10, 16], color)
    .setStrokeStyle(4, OUTLINE, 1);
  const foot = scene.add
    .polygon(8, 75, [-15, -9, 13, -10, 25, 5, 15, 14, -18, 10], color)
    .setStrokeStyle(4, OUTLINE, 1);
  const shine = scene.add.rectangle(-4, 19, 7, 18, 0xb4bec9, front ? 0.42 : 0.18);
  return scene.add.container(x, y, [hip, thigh, knee, shin, foot, shine]);
}

function createTorso(scene: Phaser.Scene, character: CharacterDefinition) {
  const body = scene.add
    .polygon(0, 0, [-47, -34, -25, -49, 28, -47, 49, -30, 50, 16, 31, 43, -32, 43, -50, 14], character.color)
    .setStrokeStyle(5, OUTLINE, 1);
  const chest = scene.add
    .polygon(0, 4, [-38, -23, 35, -25, 39, 21, 24, 34, -28, 34, -40, 16], character.shadowColor, 0.35);
  const core = scene.add
    .polygon(8, 0, [-10, -15, 9, -18, 18, 1, 5, 20, -14, 10], character.accentColor)
    .setStrokeStyle(3, 0xffe2a2, 0.9);
  const neck = scene.add.roundedRect?.(0, -45, 28, 18, 6, character.shadowColor);
  const children = neck ? [body, chest, core, neck] : [body, chest, core];
  return scene.add.container(0, -12, children);
}

function createHead(scene: Phaser.Scene, character: CharacterDefinition) {
  const head = scene.add
    .polygon(0, 0, [-25, -19, -7, -29, 24, -22, 29, 7, 12, 24, -20, 21, -30, 1], character.color)
    .setStrokeStyle(5, OUTLINE, 1);
  const brow = scene.add
    .polygon(0, -4, [-21, -6, -3, -11, 20, -6, 16, 3, -17, 3], character.shadowColor);
  const leftEye = scene.add.ellipse(-9, -2, 7, 9, 0xffefc1);
  const rightEye = scene.add.ellipse(10, -2, 7, 9, 0xffefc1);
  return scene.add.container(0, -66, [head, brow, leftEye, rightEye]);
}
