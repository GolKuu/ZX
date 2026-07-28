import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import type { TorsoStyle } from './forceModelConfigs';
import { MODEL_HIGHLIGHT, MODEL_OUTLINE } from './modelStyle';

const TORSO_POINTS: Record<Exclude<TorsoStyle, 'round'>, number[]> = {
  armor: [-39, -37, -22, -48, 23, -47, 40, -34, 38, 30, 20, 44, -22, 44, -40, 29],
  crystal: [0, -50, 34, -27, 27, 37, 0, 49, -29, 35, -35, -25],
  beast: [-40, -36, -24, -48, 25, -47, 43, -30, 37, 36, 0, 48, -37, 35],
  fluid: [0, -50, 31, -27, 37, 16, 20, 45, -19, 45, -37, 17, -30, -27],
  folded: [0, -51, 39, -18, 24, 43, 0, 31, -25, 43, -39, -18],
  wood: [-35, -43, -22, -50, 26, -49, 37, -39, 31, 44, -31, 44],
  serpent: [0, -52, 30, -26, 22, 16, 13, 47, -13, 47, -22, 16, -30, -26],
  flame: [0, -55, 16, -34, 31, -42, 39, -10, 27, 39, 0, 49, -28, 38, -39, -10, -22, -37],
};

export function createForceTorso(
  scene: Phaser.Scene,
  character: CharacterDefinition,
  style: TorsoStyle,
) {
  const outline = MODEL_OUTLINE;
  const body = style === 'round'
    ? scene.add.ellipse(0, 0, 86, 94, character.color)
    : scene.add.polygon(0, 0, TORSO_POINTS[style], character.color);
  body.setStrokeStyle(5, outline, 1);
  const shade = scene.add.ellipse(9, 12, 45, 62, character.shadowColor, 0.22);
  const plate = scene.add
    .polygon(0, 8, [-25, -25, 24, -25, 20, 24, 0, 36, -20, 24], character.accentColor, 0.26)
    .setStrokeStyle(2, character.accentColor, 0.48);
  const emblem = createEmblem(scene, character);
  return scene.add.container(0, -10, [body, shade, plate, emblem]);
}

function createEmblem(scene: Phaser.Scene, character: CharacterDefinition) {
  const graphics = scene.add.graphics();
  const accent = character.accentColor;
  graphics.fillStyle(accent, 0.94).lineStyle(3, MODEL_HIGHLIGHT, 0.72);
  switch (character.id) {
    case 'caliber':
      graphics.fillCircle(-11, 2, 5).fillCircle(0, 2, 5).fillCircle(11, 2, 5);
      break;
    case 'volt':
      graphics.fillTriangle(-5, -20, 10, -7, 0, -2)
        .fillTriangle(0, -2, 12, 2, -8, 21);
      break;
    case 'nocturne':
      graphics.strokeCircle(0, 0, 16).fillTriangle(0, -12, 11, 10, -11, 10);
      break;
    case 'ragnar':
      graphics.fillTriangle(0, -20, 18, 16, 0, 8)
        .fillTriangle(0, -20, -18, 16, 0, 8);
      break;
    case 'marina':
      graphics.fillTriangle(0, -21, 15, 8, -15, 8).fillCircle(0, 8, 15);
      break;
    case 'zephyr':
      graphics.strokeCircle(-7, 0, 11).strokeCircle(8, 0, 13);
      break;
    case 'origami':
      graphics.fillTriangle(0, -18, 17, 15, 0, 8)
        .fillTriangle(0, -18, -17, 15, 0, 8);
      break;
    case 'poro':
      graphics.fillCircle(-9, -5, 5).fillCircle(8, 7, 7).fillCircle(-5, 13, 3);
      break;
    case 'fenr':
      graphics.strokeCircle(0, 0, 15).fillTriangle(-14, -13, -4, -22, -2, -10);
      break;
    case 'sylvan':
      graphics.fillTriangle(0, -21, 16, 7, 0, 18).fillTriangle(0, -21, -16, 7, 0, 18);
      break;
    case 'adamant':
      graphics.fillTriangle(0, -19, 17, 0, 0, 20).fillTriangle(0, -19, -17, 0, 0, 20);
      break;
    case 'vassa':
      graphics.beginPath().moveTo(-9, -18).lineTo(8, -5).lineTo(-7, 7).lineTo(9, 19).strokePath();
      break;
    case 'pyron':
      graphics.fillTriangle(0, -22, 15, 16, 0, 8).fillTriangle(0, -10, -15, 16, 0, 8);
      break;
    default:
      graphics.fillCircle(0, 0, 12);
  }
  return graphics;
}
