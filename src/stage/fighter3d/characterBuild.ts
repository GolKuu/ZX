import type { CharacterId } from '@/src/data/characterRoster';

/**
 * The body each fighter is built from.
 *
 * A roster reads as a roster when its members are different *shapes*, not when
 * they are the same shape in different colours — a player has to know who is on
 * screen from the silhouette alone, at speed, half-covered in impact sparks. So
 * the numbers here are deliberately far apart: Titan is nearly twice Mim's mass
 * through the shoulders, Vorgh stands hunched, Lucky is all leg.
 *
 * Everything is expressed relative to a 1.0 body, and the rig multiplies
 * through, so a character can be re-proportioned by editing one row without
 * touching a single mesh.
 */
export interface CharacterBuild {
  readonly id: CharacterId;
  /** Overall height multiplier. */
  readonly height: number;
  /** Shoulder span — the strongest single silhouette cue at distance. */
  readonly shoulders: number;
  /** Chest and hip depth. */
  readonly bulk: number;
  /** Arm and leg diameter. */
  readonly limbs: number;
  readonly head: number;
  /** Forward lean, in radians. Positive crouches the fighter over their guard. */
  readonly stoop: number;
  /** Which signature pieces the skeleton hangs off the base body. */
  readonly features: readonly CharacterFeature[];
  /** Emissive trim colour: the one thing on the body allowed to glow. */
  readonly accent: string;
}

export type CharacterFeature =
  | 'mask'
  | 'visor'
  | 'horns'
  | 'pauldrons'
  | 'coat'
  | 'cape'
  | 'claws'
  | 'spikes'
  | 'hair';

const BUILDS: Record<CharacterId, CharacterBuild> = {
  // Stage trickster: tall, narrow, weightless. The mask and the cape do all
  // the identifying work.
  mim: {
    id: 'mim',
    height: 1.02, shoulders: 0.86, bulk: 0.82, limbs: 0.82, head: 1.02,
    stoop: 0.04, features: ['mask', 'cape'], accent: '#bb6dff',
  },
  // Broken protocol: square, armoured, upright. Reads as a machine that has
  // decided to stand like a person.
  glitch: {
    id: 'glitch',
    height: 1, shoulders: 1.02, bulk: 0.95, limbs: 0.94, head: 0.94,
    stoop: 0.06, features: ['visor', 'pauldrons'], accent: '#48dfff',
  },
  // Gambler: long coat, long legs, light frame.
  lucky: {
    id: 'lucky',
    height: 1.04, shoulders: 0.9, bulk: 0.84, limbs: 0.84, head: 0.98,
    stoop: 0.02, features: ['coat', 'hair'], accent: '#e8ba62',
  },
  // Berserker: hunched, heavy through the shoulders, long arms.
  vorgh: {
    id: 'vorgh',
    height: 1.03, shoulders: 1.26, bulk: 1.24, limbs: 1.2, head: 0.92,
    stoop: 0.22, features: ['horns', 'claws', 'spikes'], accent: '#ff3d5e',
  },
  // Industrial colossus: the widest thing on the stage, with a small head to
  // sell the scale.
  titan: {
    id: 'titan',
    height: 1.14, shoulders: 1.5, bulk: 1.46, limbs: 1.42, head: 0.8,
    stoop: 0.1, features: ['pauldrons', 'spikes'], accent: '#ff8c42',
  },
};

export function characterBuild(characterId: CharacterId): CharacterBuild {
  return BUILDS[characterId];
}

export function hasFeature(
  build: CharacterBuild,
  feature: CharacterFeature,
): boolean {
  return build.features.includes(feature);
}
