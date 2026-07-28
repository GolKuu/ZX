import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import { ProceduralRig } from '../animation/ProceduralRig';
import type { RigParts } from '../animation/RigTypes';
import { createForceHead } from './ForceHeadFactory';
import { createForceArm, createForceLeg } from './ForceLimbFactory';
import { forceModelConfig } from './forceModelConfigs';
import { createForceTorso } from './ForceTorsoFactory';

export function createForceRig(scene: Phaser.Scene, character: CharacterDefinition) {
  const config = forceModelConfig(character.id);
  if (!config) throw new Error(`Force rig is not configured for ${character.id}`);
  const backLeg = createForceLeg(
    scene, character, -config.hipWidth, config.legs, false,
  );
  const frontLeg = createForceLeg(
    scene, character, config.hipWidth, config.legs, true,
  );
  const backArm = createForceArm(
    scene, character, -config.shoulderWidth, -1, config.arms, false,
  );
  const torso = createForceTorso(scene, character, config.torso);
  const head = createForceHead(scene, character);
  const frontArm = createForceArm(
    scene, character, config.shoulderWidth, 1, config.arms, true,
  );
  const root = scene.add.container(0, 0, [
    backLeg, backArm, frontLeg, torso, head, frontArm,
  ]);
  const parts: RigParts = { root, torso, head, frontArm, backArm, frontLeg, backLeg };
  return new ProceduralRig(parts, character.visualKind, character.id);
}
