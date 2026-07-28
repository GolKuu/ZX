import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import type { ArmStyle, LegStyle } from './forceModelConfigs';
import { getModelStrokeWidth, MODEL_HIGHLIGHT, MODEL_OUTLINE } from './modelStyle';

export function createForceArm(
  scene: Phaser.Scene,
  character: CharacterDefinition,
  x: number,
  direction: -1 | 1,
  style: ArmStyle,
  front: boolean,
) {
  const color = front ? character.color : character.shadowColor;
  const alpha = front ? 1 : 0.76;
  const outline = MODEL_OUTLINE;
  const joint = scene.add.circle(0, 0, 12, color, alpha).setStrokeStyle(getModelStrokeWidth(4, 'joint'), outline);
  const upper = scene.add
    .polygon(0, 23, mirror([-9, -17, 10, -15, 13, 24, -10, 29], direction), color, alpha)
    .setStrokeStyle(getModelStrokeWidth(4, 'limb'), outline);
  const pieces: Phaser.GameObjects.GameObject[] = [upper, joint];
  const handX = direction * 4;
  if (style === 'cannon') {
    pieces.push(
      scene.add.rectangle(handX, 55, 29, 35, character.accentColor, alpha)
        .setStrokeStyle(getModelStrokeWidth(4, 'limb'), outline),
      scene.add.ellipse(handX, 72, 31, 12, outline, alpha),
      scene.add.ellipse(handX, 72, 16, 5, 0xffe9a8, alpha),
    );
  } else if (style === 'claw' || style === 'fang') {
    pieces.push(scene.add.circle(handX, 54, 13, color, alpha).setStrokeStyle(getModelStrokeWidth(4, 'joint'), outline));
    [-1, 0, 1].forEach((offset) => pieces.push(
      scene.add.triangle(
        handX + direction * offset * 7,
        72,
        -7, -10, 0, 13, 7, -10,
        style === 'fang' ? 0xdff59b : character.accentColor,
        alpha,
      ).setStrokeStyle(getModelStrokeWidth(2, 'accent'), outline),
    ));
  } else if (style === 'blade' || style === 'fin') {
    pieces.push(
      scene.add.polygon(
        handX + direction * 9,
        58,
        mirror([-11, -17, 9, -12, 28, 17, 1, 10, -12, 22], direction),
        style === 'blade' ? MODEL_HIGHLIGHT : character.accentColor,
        alpha,
      ).setStrokeStyle(getModelStrokeWidth(4, 'limb'), outline),
    );
  } else if (style === 'branch') {
    pieces.push(
      scene.add.rectangle(handX, 56, 15, 35, character.accentColor, alpha)
        .setStrokeStyle(getModelStrokeWidth(4, 'limb'), outline),
      scene.add.triangle(handX - 10, 72, 0, 12, 7, -12, 14, 12, color, alpha)
        .setStrokeStyle(getModelStrokeWidth(2, 'accent'), outline),
      scene.add.triangle(handX + 10, 72, 0, 12, 7, -12, 14, 12, color, alpha)
        .setStrokeStyle(getModelStrokeWidth(2, 'accent'), outline),
    );
  } else if (style === 'ribbon') {
    pieces.push(
      scene.add.polygon(
        handX, 57,
        mirror([-9, -19, 10, -14, 22, 5, 6, 25, -15, 17], direction),
        character.accentColor,
        alpha,
      ).setStrokeStyle(getModelStrokeWidth(3, 'accent'), outline),
    );
  } else {
    const width = style === 'sponge' ? 32 : 27;
    pieces.push(
      scene.add.rectangle(handX, 57, width, 31, character.accentColor, alpha)
        .setStrokeStyle(getModelStrokeWidth(4, 'limb'), outline),
    );
    if (style === 'sponge') {
      pieces.push(scene.add.circle(handX - 6, 52, 3, outline, 0.48));
      pieces.push(scene.add.circle(handX + 7, 62, 4, outline, 0.42));
    }
    if (style === 'ember') {
      pieces.push(scene.add.circle(handX, 57, 18, 0xffc34f, 0.2));
    }
  }
  return scene.add.container(x, -15, pieces);
}

export function createForceLeg(
  scene: Phaser.Scene,
  character: CharacterDefinition,
  x: number,
  style: LegStyle,
  front: boolean,
) {
  const color = front ? character.accentColor : character.shadowColor;
  const alpha = front ? 1 : 0.75;
  const outline = MODEL_OUTLINE;
  const hip = scene.add.circle(0, 0, 10, color, alpha).setStrokeStyle(getModelStrokeWidth(4, 'joint'), outline);
  const shin = scene.add
    .polygon(0, 28, [-9, -22, 9, -20, 13, 24, -10, 29], color, alpha)
    .setStrokeStyle(getModelStrokeWidth(4, 'limb'), outline);
  const shinHighlight = scene.add.rectangle(2, 27, 16, 8, MODEL_HIGHLIGHT, 0.2);
  const pieces: Phaser.GameObjects.GameObject[] = [shin, shinHighlight, hip];
  if (style === 'tail' || style === 'ribbon') {
    pieces.push(scene.add
      .polygon(4, 57, [-12, -17, 10, -13, 17, 13, 4, 23, -16, 13], color, alpha)
      .setStrokeStyle(getModelStrokeWidth(3, 'accent'), outline));
  } else if (style === 'hoof' || style === 'talon' || style === 'paw') {
    pieces.push(scene.add
      .polygon(5, 59, [-14, -9, 14, -8, 23, 8, 9, 15, -18, 11], color, alpha)
      .setStrokeStyle(getModelStrokeWidth(4, 'limb'), outline));
    if (style === 'talon') {
      pieces.push(scene.add.triangle(23, 67, -8, -5, 9, 1, -6, 7, 0xf4efce, alpha)
        .setStrokeStyle(2, outline));
    }
  } else if (style === 'root') {
    pieces.push(
      scene.add.triangle(-7, 65, -18, 8, 5, -14, 15, 8, color, alpha)
        .setStrokeStyle(3, outline),
      scene.add.triangle(10, 66, -13, 8, 4, -13, 17, 8, color, alpha)
        .setStrokeStyle(3, outline),
    );
  } else {
    pieces.push(scene.add
      .rectangle(5, 59, style === 'stub' ? 38 : 31, 22, color, alpha)
      .setStrokeStyle(4, outline));
  }
  return scene.add.container(x, 27, pieces);
}

function mirror(points: number[], direction: -1 | 1) {
  return points.map((point, index) => index % 2 === 0 ? point * direction : point);
}
