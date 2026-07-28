import type Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import type { CharacterRig } from '../animation/RigTypes';
import { createGraniteRig } from './GraniteRigFactory';
import { createShiraRig } from './ShiraRigFactory';
import { createForceRig } from './ForceRigFactory';

export function createCharacterBody(
  scene: Phaser.Scene,
  character: CharacterDefinition,
): CharacterRig {
  if (character.id === 'granite') return createGraniteRig(scene, character);
  if (character.id === 'shira') return createShiraRig(scene, character);
  return createForceRig(scene, character);
}
