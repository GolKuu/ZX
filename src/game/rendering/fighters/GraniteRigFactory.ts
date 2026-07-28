import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { ProceduralRig } from '../animation/ProceduralRig';
import type { RigParts } from '../animation/RigTypes';

const OUTLINE = 0x252b38;

export function createGraniteRig(scene: Phaser.Scene, character: CharacterDefinition) {
  const backLeg = stoneLeg(scene, -24, 27, character.shadowColor);
  const frontLeg = stoneLeg(scene, 24, 27, character.color, true);
  const backArm = stoneArm(scene, -49, -15, -1, character.shadowColor);
  const torso = createTorso(scene, character);
  const head = createHead(scene, character);
  const frontArm = stoneArm(scene, 49, -15, 1, character.color, true);
  const root = scene.add.container(0, 0, [
    backLeg, backArm, frontLeg, torso, head, frontArm,
  ]);
  const parts: RigParts = { root, torso, head, frontArm, backArm, frontLeg, backLeg };
  return new ProceduralRig(parts, 'granite', character.id);
}

function stoneArm(
  scene: Phaser.Scene,
  x: number,
  y: number,
  direction: -1 | 1,
  color: number,
  front = false,
) {
  const shoulder = scene.add.circle(0, 0, 18, color).setStrokeStyle(5, OUTLINE, 1);
  const slab = scene.add
    .polygon(0, 27, mirror([-13, -14, 14, -11, 22, 24, 8, 43, -16, 34], direction), color)
    .setStrokeStyle(5, OUTLINE, 1);
  const fist = scene.add
    .polygon(direction * 6, 61, mirror([-17, -15, 15, -13, 23, 7, 8, 20, -19, 12], direction), color)
    .setStrokeStyle(5, OUTLINE, 1);
  const shine = scene.add
    .polygon(direction * 5, 24, mirror([-4, -9, 6, -7, 10, 13, 1, 18, -5, 8], direction), 0xc4ced8, front ? 0.5 : 0.2);
  return scene.add.container(x, y, [shoulder, slab, fist, shine]);
}

function stoneLeg(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  front = false,
) {
  const hip = scene.add.circle(0, 0, 16, color).setStrokeStyle(5, OUTLINE, 1);
  const pillar = scene.add
    .polygon(0, 27, [-14, -16, 14, -14, 17, 27, -12, 30], color)
    .setStrokeStyle(5, OUTLINE, 1);
  const foot = scene.add
    .polygon(5, 57, [-17, -11, 15, -10, 25, 6, 15, 15, -20, 11], color)
    .setStrokeStyle(5, OUTLINE, 1);
  const shine = scene.add.rectangle(-5, 25, 7, 24, 0xc4ced8, front ? 0.42 : 0.16);
  return scene.add.container(x, y, [hip, pillar, foot, shine]);
}

function createTorso(scene: Phaser.Scene, character: CharacterDefinition) {
  const body = scene.add
    .polygon(0, 0, [-52, -29, -34, -45, 31, -45, 53, -27, 51, 19, 32, 43, -33, 43, -53, 17], character.color)
    .setStrokeStyle(6, OUTLINE, 1);
  const lowerPlate = scene.add
    .polygon(0, 13, [-43, -11, 42, -12, 36, 29, 22, 38, -27, 38, -42, 25], character.shadowColor, 0.42);
  const core = scene.add
    .polygon(7, 1, [-10, -15, 9, -18, 18, 1, 5, 20, -14, 10], character.accentColor)
    .setStrokeStyle(3, 0xffe2a2, 0.9);
  return scene.add.container(0, -10, [body, lowerPlate, core]);
}

function createHead(scene: Phaser.Scene, character: CharacterDefinition) {
  const head = scene.add
    .polygon(0, 0, [-29, -17, -9, -29, 26, -22, 31, 8, 14, 23, -23, 20, -32, 1], character.color)
    .setStrokeStyle(5, OUTLINE, 1);
  const facePlate = scene.add
    .polygon(1, 1, [-23, -8, -4, -13, 24, -7, 19, 9, -19, 9], character.shadowColor);
  const leftEye = scene.add.ellipse(-9, 0, 7, 9, 0xffefc1);
  const rightEye = scene.add.ellipse(11, 0, 7, 9, 0xffefc1);
  return scene.add.container(0, -52, [head, facePlate, leftEye, rightEye]);
}

function mirror(points: number[], direction: -1 | 1) {
  return points.map((point, index) => index % 2 === 0 ? point * direction : point);
}
