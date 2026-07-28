import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { ProceduralRig } from '../animation/ProceduralRig';
import type { RigParts } from '../animation/RigTypes';
import {
  getModelStrokeWidth,
  MODEL_EYE_GLOW,
  MODEL_HIGHLIGHT,
  MODEL_OUTLINE,
} from './modelStyle';

export function createShiraRig(scene: Phaser.Scene, character: CharacterDefinition) {
  const backLeg = ribbonTail(scene, -17, 22, -1, character.shadowColor);
  const frontLeg = ribbonTail(scene, 17, 22, 1, character.accentColor, true);
  const backArm = scissorWing(scene, -37, -16, -1, character.shadowColor, 0x9feadf);
  const torso = createCore(scene, character);
  const head = createShell(scene, character);
  const frontArm = scissorWing(scene, 37, -16, 1, character.color, character.accentColor, true);
  const root = scene.add.container(0, 0, [
    backLeg, backArm, frontLeg, torso, head, frontArm,
  ]);
  const parts: RigParts = { root, torso, head, frontArm, backArm, frontLeg, backLeg };
  return new ProceduralRig(parts, 'shira', character.id);
}

function ribbonTail(
  scene: Phaser.Scene,
  x: number,
  y: number,
  direction: -1 | 1,
  color: number,
  front = false,
) {
  const knot = scene.add.circle(0, 0, 9, color).setStrokeStyle(getModelStrokeWidth(4, 'joint'), MODEL_OUTLINE, 1);
  const loop = scene.add.ellipse(direction * 2, 25, 29, 49, MODEL_OUTLINE, 0.08)
    .setStrokeStyle(getModelStrokeWidth(10, 'limb'), color, front ? 1 : 0.72);
  const ankle = scene.add.circle(direction * 5, 45, 8, MODEL_HIGHLIGHT)
    .setStrokeStyle(getModelStrokeWidth(4, 'joint'), MODEL_OUTLINE, 1);
  const tip = scene.add
    .polygon(direction * 6, 57, mirror([-13, -9, 11, -12, 18, 7, 3, 17, -15, 9], direction), color)
    .setStrokeStyle(getModelStrokeWidth(4, 'limb'), MODEL_OUTLINE, 1);
  return scene.add.container(x, y, [loop, tip, ankle, knot]);
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
    .setStrokeStyle(getModelStrokeWidth(4, 'limb'), MODEL_OUTLINE, 1);
  const bladeTwo = scene.add
    .polygon(0, 0, mirror([8, 7, 24, 1, 65, 7, 73, 16, 25, 13, 10, 11], direction), 0xf2f7f4, front ? 1 : 0.62)
    .setStrokeStyle(getModelStrokeWidth(4, 'limb'), MODEL_OUTLINE, 1);
  const shoulder = scene.add.circle(-direction * 7, 0, 14, MODEL_HIGHLIGHT, front ? 1 : 0.75)
    .setStrokeStyle(getModelStrokeWidth(4, 'joint'), MODEL_OUTLINE, 1);
  const handle = scene.add
    .ellipse(0, 0, 25, 29, shellColor, front ? 1 : 0.8)
    .setStrokeStyle(getModelStrokeWidth(5, 'body'), MODEL_OUTLINE, 1);
  const inner = scene.add.ellipse(0, 0, 10, 13, MODEL_OUTLINE, 0.9);
  const pin = scene.add.circle(direction * 9, 0, 4, 0xd9fff8);
  return scene.add.container(x, y, [bladeOne, bladeTwo, shoulder, handle, inner, pin]);
}

function createCore(scene: Phaser.Scene, character: CharacterDefinition) {
  const aura = scene.add.ellipse(0, 2, 65, 79, character.accentColor, 0.12);
  const body = scene.add
    .polygon(0, 0, [0, -53, 28, -30, 42, 6, 21, 47, 0, 55, -21, 47, -42, 6, -28, -30], character.color)
    .setStrokeStyle(getModelStrokeWidth(6, 'body'), MODEL_OUTLINE, 1);
  const breastplate = scene.add
    .polygon(0, 9, [-19, -18, 19, -18, 14, 22, 0, 31, -14, 22], 0xc9b9f4, 0.72);
  const coreRing = scene.add.circle(0, 4, 15, MODEL_HIGHLIGHT)
    .setStrokeStyle(getModelStrokeWidth(4, 'joint'), MODEL_OUTLINE, 1);
  const star = scene.add
    .polygon(0, 4, [0, -10, 4, -4, 11, 0, 4, 4, 0, 11, -4, 4, -11, 0, -4, -4], character.accentColor);
  const glint = scene.add.circle(-3, 0, 2, MODEL_HIGHLIGHT);
  return scene.add.container(0, -10, [aura, body, breastplate, coreRing, star, glint]);
}

function createShell(scene: Phaser.Scene, character: CharacterDefinition) {
  const leftFin = scene.add
    .polygon(-27, -2, [-3, -15, -25, -28, -17, 1, -28, 17, -2, 11], character.accentColor)
    .setStrokeStyle(getModelStrokeWidth(4, 'detail'), MODEL_OUTLINE, 1);
  const rightFin = scene.add
    .polygon(27, -2, [3, -15, 25, -28, 17, 1, 28, 17, 2, 11], character.accentColor)
    .setStrokeStyle(getModelStrokeWidth(4, 'detail'), MODEL_OUTLINE, 1);
  const shell = scene.add
    .polygon(0, 0, [-36, -12, -15, -31, 22, -27, 38, -4, 24, 26, -21, 27, -39, 5], character.color)
    .setStrokeStyle(getModelStrokeWidth(6, 'body'), MODEL_OUTLINE, 1);
  const visor = scene.add.ellipse(0, -1, 40, 21, MODEL_OUTLINE);
  const leftEye = scene.add.ellipse(-10, -1, 7, 10, MODEL_EYE_GLOW);
  const rightEye = scene.add.ellipse(10, -1, 7, 10, MODEL_EYE_GLOW);
  const glint = scene.add.circle(-12, -4, 2, MODEL_HIGHLIGHT);
  return scene.add.container(0, -61, [
    leftFin, rightFin, shell, visor, leftEye, rightEye, glint,
  ]);
}

function mirror(points: number[], direction: -1 | 1) {
  return points.map((point, index) => index % 2 === 0 ? point * direction : point);
}
