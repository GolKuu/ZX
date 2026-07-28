import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { ProceduralRig } from '../animation/ProceduralRig';
import type { RigParts } from '../animation/RigTypes';
import {
  GRANITE_CORE_GLOW,
  MODEL_HIGHLIGHT,
  MODEL_OUTLINE,
} from './modelStyle';

export function createGraniteRig(scene: Phaser.Scene, character: CharacterDefinition) {
  const backLeg = stoneLeg(scene, -29, 25, character.shadowColor);
  const frontLeg = stoneLeg(scene, 29, 25, character.color, true);
  const backArm = stoneArm(scene, -58, -18, -1, character.shadowColor);
  const torso = createTorso(scene, character);
  const head = createHead(scene, character);
  const frontArm = stoneArm(scene, 58, -18, 1, character.color, true);
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
  const shoulder = scene.add.circle(0, 0, front ? 20 : 18, color)
    .setStrokeStyle(5, MODEL_OUTLINE, 1);
  const jointRing = scene.add.circle(0, 0, front ? 10 : 9, characterShade(color), 0.55)
    .setStrokeStyle(3, MODEL_OUTLINE, 0.8);
  const slab = scene.add
    .polygon(0, 27, mirror([-13, -14, 14, -11, 22, 24, 8, 43, -16, 34], direction), color)
    .setStrokeStyle(5, MODEL_OUTLINE, 1);
  const fist = scene.add
    .polygon(direction * 7, 62, mirror([-19, -16, 17, -14, 25, 7, 9, 22, -21, 13], direction), color)
    .setStrokeStyle(6, MODEL_OUTLINE, 1);
  const shine = scene.add
    .polygon(direction * 5, 24, mirror([-4, -9, 6, -7, 10, 13, 1, 18, -5, 8], direction), MODEL_HIGHLIGHT, front ? 0.32 : 0.12);
  return scene.add.container(x, y, [shoulder, jointRing, slab, fist, shine]);
}

function stoneLeg(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  front = false,
) {
  const hip = scene.add.circle(0, 0, 16, color).setStrokeStyle(5, MODEL_OUTLINE, 1);
  const pillar = scene.add
    .polygon(0, 27, [-14, -16, 14, -14, 17, 27, -12, 30], color)
    .setStrokeStyle(5, MODEL_OUTLINE, 1);
  const foot = scene.add
    .polygon(4, 57, [-19, -11, 17, -10, 28, 6, 17, 15, -23, 12], color)
    .setStrokeStyle(5, MODEL_OUTLINE, 1);
  const shine = scene.add.rectangle(-5, 25, 7, 24, MODEL_HIGHLIGHT, front ? 0.3 : 0.1);
  return scene.add.container(x, y, [hip, pillar, foot, shine]);
}

function createTorso(scene: Phaser.Scene, character: CharacterDefinition) {
  const body = scene.add
    .polygon(0, 0, [-61, -24, -39, -51, 22, -47, 58, -31, 64, 12, 38, 49, -29, 45, -58, 22], character.color)
    .setStrokeStyle(7, MODEL_OUTLINE, 1);
  const shoulderRock = scene.add
    .polygon(-42, -36, [-18, -7, -5, -20, 14, -16, 22, 3, 6, 17, -16, 13], character.shadowColor)
    .setStrokeStyle(5, MODEL_OUTLINE, 1);
  const lowerPlate = scene.add
    .polygon(0, 13, [-43, -11, 42, -12, 36, 29, 22, 38, -27, 38, -42, 25], character.shadowColor, 0.42);
  const core = scene.add
    .polygon(5, 0, [-17, -22, 14, -22, 23, 2, 8, 25, -19, 13], GRANITE_CORE_GLOW)
    .setStrokeStyle(4, 0xffefb0, 1);
  const crack = scene.add.graphics().lineStyle(5, MODEL_HIGHLIGHT, 0.92)
    .beginPath().moveTo(2, -18).lineTo(-5, -3).lineTo(5, 6).lineTo(0, 20).strokePath();
  return scene.add.container(0, -10, [body, shoulderRock, lowerPlate, core, crack]);
}

function createHead(scene: Phaser.Scene, character: CharacterDefinition) {
  const head = scene.add
    .polygon(0, 0, [-42, -10, -25, -32, 19, -37, 41, -14, 36, 14, 11, 31, -31, 23, -43, 4], character.color)
    .setStrokeStyle(6, MODEL_OUTLINE, 1);
  const facePlate = scene.add
    .polygon(1, 1, [-28, -9, -5, -15, 29, -8, 22, 11, -23, 10], MODEL_OUTLINE);
  const leftEye = scene.add.ellipse(-11, 0, 8, 11, 0xffefae);
  const rightEye = scene.add.ellipse(13, 0, 8, 11, 0xffefae);
  const eyeGlint = scene.add.circle(-13, -3, 2, MODEL_HIGHLIGHT);
  return scene.add.container(0, -55, [head, facePlate, leftEye, rightEye, eyeGlint]);
}

function mirror(points: number[], direction: -1 | 1) {
  return points.map((point, index) => index % 2 === 0 ? point * direction : point);
}

function characterShade(color: number) {
  return Phaser.Display.Color.IntegerToColor(color).darken(24).color;
}
