import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { ProceduralRig } from '../animation/ProceduralRig';
import type { RigParts } from '../animation/RigTypes';

export function createGraniteRig(
  scene: Phaser.Scene,
  character: CharacterDefinition,
) {
  const backLeg = stoneLimb(scene, -17, 27, 25, 48, character.shadowColor);
  const frontLeg = stoneLimb(scene, 18, 27, 28, 52, character.color);
  const backArm = stoneLimb(scene, -39, -17, 30, 66, character.shadowColor);
  const torso = createTorso(scene, character);
  const head = createHead(scene, character);
  const frontArm = stoneLimb(scene, 40, -19, 34, 70, character.color, true);
  const root = scene.add.container(0, 0, [
    backLeg,
    backArm,
    frontLeg,
    torso,
    head,
    frontArm,
  ]);
  const parts: RigParts = { root, torso, head, frontArm, backArm, frontLeg, backLeg };
  return new ProceduralRig(parts, 'granite');
}

function stoneLimb(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  front = false,
) {
  const limb = scene.add
    .polygon(0, height * 0.45, [
      -width * 0.44, -height * 0.45,
      width * 0.4, -height * 0.5,
      width * 0.54, height * 0.28,
      0, height * 0.52,
      -width * 0.52, height * 0.26,
    ], color)
    .setStrokeStyle(4, 0x252b38, 0.95);
  const highlight = scene.add
    .polygon(-3, height * 0.15, [-6, -16, 7, -13, 9, 7, -7, 11], 0x9ca5b3, front ? 0.55 : 0.25);
  const fist = scene.add
    .polygon(0, height * 0.92, [-15, -8, 12, -11, 17, 7, 0, 16, -17, 8], color)
    .setStrokeStyle(4, 0x252b38, 0.95);
  return scene.add.container(x, y, [limb, highlight, fist]);
}

function createTorso(scene: Phaser.Scene, character: CharacterDefinition) {
  const body = scene.add
    .polygon(0, 0, [-43, -35, -22, -49, 31, -43, 47, -8, 36, 36, 0, 45, -39, 30], character.color)
    .setStrokeStyle(5, 0x252b38, 1);
  const lowerShade = scene.add
    .polygon(0, 16, [-37, -8, 38, -14, 34, 22, 0, 29, -34, 18], character.shadowColor, 0.52);
  const core = scene.add
    .polygon(8, -4, [-9, -13, 10, -17, 17, 2, 4, 18, -13, 9], character.accentColor)
    .setStrokeStyle(3, 0xffe2a2, 0.85);
  const crack = scene.add
    .polygon(9, 4, [-2, -22, 3, -8, -2, 0, 4, 12, -2, 24], 0xffefc1, 0.75);
  return scene.add.container(0, -13, [body, lowerShade, core, crack]);
}

function createHead(scene: Phaser.Scene, character: CharacterDefinition) {
  const head = scene.add
    .polygon(0, 0, [-29, -22, -7, -33, 27, -24, 33, 8, 14, 27, -22, 23, -34, 1], character.color)
    .setStrokeStyle(5, 0x252b38, 1);
  const brow = scene.add
    .polygon(0, -5, [-23, -6, -3, -12, 22, -6, 18, 3, -18, 3], character.shadowColor);
  const leftEye = scene.add.ellipse(-10, -3, 7, 9, 0xffefc1);
  const rightEye = scene.add.ellipse(11, -3, 7, 9, 0xffefc1);
  const mouth = scene.add.rectangle(0, 13, 18, 4, 0x252b38).setRotation(-0.04);
  return scene.add.container(0, -69, [head, brow, leftEye, rightEye, mouth]);
}
