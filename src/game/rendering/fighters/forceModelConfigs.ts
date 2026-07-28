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
  caliber: { torso: 'armor', arms: 'cannon', legs: 'boot', shoulderWidth: 55, hipWidth: 24 },
  volt: { torso: 'crystal', arms: 'blade', legs: 'talon', shoulderWidth: 34, hipWidth: 15 },
  nocturne: { torso: 'beast', arms: 'claw', legs: 'hoof', shoulderWidth: 58, hipWidth: 28 },
  ragnar: { torso: 'beast', arms: 'claw', legs: 'talon', shoulderWidth: 66, hipWidth: 34 },
  marina: { torso: 'fluid', arms: 'fin', legs: 'fin', shoulderWidth: 44, hipWidth: 15 },
  zephyr: { torso: 'fluid', arms: 'ribbon', legs: 'ribbon', shoulderWidth: 52, hipWidth: 13 },
  origami: { torso: 'folded', arms: 'blade', legs: 'folded', shoulderWidth: 57, hipWidth: 18 },
  poro: { torso: 'round', arms: 'sponge', legs: 'stub', shoulderWidth: 64, hipWidth: 32 },
  fenr: { torso: 'beast', arms: 'claw', legs: 'paw', shoulderWidth: 53, hipWidth: 25 },
  sylvan: { torso: 'wood', arms: 'branch', legs: 'root', shoulderWidth: 62, hipWidth: 35 },
  adamant: { torso: 'armor', arms: 'gauntlet', legs: 'boot', shoulderWidth: 51, hipWidth: 27 },
  vassa: { torso: 'serpent', arms: 'fang', legs: 'tail', shoulderWidth: 46, hipWidth: 10 },
  pyron: { torso: 'flame', arms: 'ember', legs: 'talon', shoulderWidth: 52, hipWidth: 17 },
};

export function forceModelConfig(characterId: CharacterId) {
  if (characterId === 'granite' || characterId === 'shira') return null;
  return FORCE_MODEL_CONFIGS[characterId];
}
