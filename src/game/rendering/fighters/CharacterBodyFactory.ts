import type Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import type { CharacterRig } from '../animation/RigTypes';
import { createGraniteRig } from './GraniteRigFactory';
import { createShiraRig } from './ShiraRigFactory';

export function createCharacterBody(
  scene: Phaser.Scene,
  character: CharacterDefinition,
): CharacterRig {
  return character.visualKind === 'granite'
    ? createGraniteRig(scene, character)
    : createShiraRig(scene, character);
}
