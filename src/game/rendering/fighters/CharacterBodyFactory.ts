import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';

export type CharacterBody = {
  children: Phaser.GameObjects.GameObject[];
  body: Phaser.GameObjects.Shape;
};

export function createCharacterBody(
  scene: Phaser.Scene,
  character: CharacterDefinition,
): CharacterBody {
  return character.visualKind === 'comet'
    ? createCometBody(scene, character)
    : createPulseBody(scene, character);
}

function createCometBody(scene: Phaser.Scene, character: CharacterDefinition): CharacterBody {
  const accents = scene.add.graphics();
  accents.fillStyle(character.accentColor, 1);
  accents.fillTriangle(-35, -23, -66, -8, -41, 4);
  accents.fillTriangle(-28, -34, -42, -58, -8, -39);
  const body = scene.add.circle(0, 0, 39, character.color).setStrokeStyle(6, 0xffffff, 0.95);
  const leftEye = scene.add.ellipse(-13, -9, 8, 12, 0x27213c).setRotation(-0.25);
  const rightEye = scene.add.ellipse(13, -9, 8, 12, 0x27213c).setRotation(0.25);
  const smile = createSmile(scene, 0x27213c);
  return { children: [accents, body, leftEye, rightEye, smile], body };
}

function createPulseBody(scene: Phaser.Scene, character: CharacterDefinition): CharacterBody {
  const orbit = scene.add.ellipse(0, 0, 96, 66);
  orbit.setFillStyle(0xffffff, 0).setStrokeStyle(4, character.accentColor, 0.9);
  const leftNode = scene.add.circle(-46, 0, 7, character.accentColor);
  const rightNode = scene.add.circle(46, 0, 7, character.accentColor);
  const body = scene.add.circle(0, 0, 37, character.color).setStrokeStyle(6, 0xffffff, 0.95);
  const visor = scene.add.rectangle(0, -10, 38, 13, 0x27213c, 0.9);
  const shine = scene.add.rectangle(-8, -12, 10, 4, 0xffffff, 0.75);
  const smile = createSmile(scene, 0x27213c);
  return { children: [orbit, leftNode, rightNode, body, visor, shine, smile], body };
}

function createSmile(scene: Phaser.Scene, color: number) {
  const smile = scene.add.arc(0, 8, 13, 15, 165, false, color);
  smile.setStrokeStyle(4, color);
  smile.setFillStyle();
  return smile;
}
