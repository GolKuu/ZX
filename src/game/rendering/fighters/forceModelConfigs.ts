import type { CharacterId } from '../../data/characters/circleFighters';

export type TorsoStyle =
  | 'armor'
  | 'crystal'
  | 'beast'
  | 'fluid'
  | 'folded'
  | 'round'
  | 'wood'
  | 'serpent'
  | 'flame';
export type ArmStyle =
  | 'cannon'
  | 'blade'
  | 'claw'
  | 'fin'
  | 'ribbon'
  | 'sponge'
  | 'branch'
  | 'gauntlet'
  | 'fang'
  | 'ember';
export type LegStyle =
  | 'boot'
  | 'talon'
  | 'hoof'
  | 'fin'
  | 'ribbon'
  | 'folded'
  | 'stub'
  | 'paw'
  | 'root'
  | 'tail';

export type ForceModelConfig = {
  torso: TorsoStyle;
  arms: ArmStyle;
  legs: LegStyle;
  shoulderWidth: number;
  hipWidth: number;
};

type RosterModelId = Exclude<CharacterId, 'granite' | 'shira'>;

export const FORCE_MODEL_CONFIGS: Record<RosterModelId, ForceModelConfig> = {
  caliber: { torso: 'armor', arms: 'cannon', legs: 'boot', shoulderWidth: 43, hipWidth: 22 },
  volt: { torso: 'crystal', arms: 'blade', legs: 'talon', shoulderWidth: 38, hipWidth: 20 },
  nocturne: { torso: 'beast', arms: 'claw', legs: 'hoof', shoulderWidth: 45, hipWidth: 24 },
  ragnar: { torso: 'beast', arms: 'claw', legs: 'talon', shoulderWidth: 50, hipWidth: 27 },
  marina: { torso: 'fluid', arms: 'fin', legs: 'fin', shoulderWidth: 39, hipWidth: 19 },
  zephyr: { torso: 'fluid', arms: 'ribbon', legs: 'ribbon', shoulderWidth: 41, hipWidth: 18 },
  origami: { torso: 'folded', arms: 'blade', legs: 'folded', shoulderWidth: 42, hipWidth: 20 },
  poro: { torso: 'round', arms: 'sponge', legs: 'stub', shoulderWidth: 48, hipWidth: 25 },
  fenr: { torso: 'beast', arms: 'claw', legs: 'paw', shoulderWidth: 42, hipWidth: 22 },
  sylvan: { torso: 'wood', arms: 'branch', legs: 'root', shoulderWidth: 49, hipWidth: 27 },
  adamant: { torso: 'armor', arms: 'gauntlet', legs: 'boot', shoulderWidth: 41, hipWidth: 21 },
  vassa: { torso: 'serpent', arms: 'fang', legs: 'tail', shoulderWidth: 38, hipWidth: 16 },
  pyron: { torso: 'flame', arms: 'ember', legs: 'talon', shoulderWidth: 43, hipWidth: 20 },
};

export function forceModelConfig(characterId: CharacterId) {
  if (characterId === 'granite' || characterId === 'shira') return null;
  return FORCE_MODEL_CONFIGS[characterId];
}
