import { CHARACTER_ANIMATION_STATES } from '../../rendering/animation/AnimationCatalog';
import type { CharacterDefinition, CharacterSeed } from './characterTypes';

export function defineCharacter(seed: CharacterSeed): CharacterDefinition {
  return {
    ...seed,
    visualKind: seed.visualModel.rig,
    animationStates: CHARACTER_ANIMATION_STATES,
  };
}
